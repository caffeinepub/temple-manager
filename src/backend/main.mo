import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  module Notice {
    public func compare(notice1 : Notice, notice2 : Notice) : Order.Order {
      Text.compare(notice1.title, notice2.title);
    };
  };
  type Notice = {
    title : Text;
    body : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  type OtpRecord = {
    otp : Text;
    expiry : Int;
  };

  // IC management interface for HTTP outcalls
  type HttpRequestArgs = {
    url : Text;
    max_response_bytes : ?Nat64;
    headers : [{ name : Text; value : Text }];
    body : ?Blob;
    method : { #get; #post; #head };
    transform : ?{
      function : shared query ({ response : HttpResponse; context : Blob }) -> async HttpResponse;
      context : Blob;
    };
  };

  type HttpResponse = {
    status : Nat;
    headers : [{ name : Text; value : Text }];
    body : Blob;
  };

  let ic : actor {
    http_request : HttpRequestArgs -> async HttpResponse;
  } = actor "aaaaa-aa";

  // Store notices
  let notices = Map.empty<Text, Notice>();

  // Store user profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Store OTPs
  let otpStore = Map.empty<Text, OtpRecord>();

  // OTP expiry: 5 minutes in nanoseconds
  let OTP_EXPIRY_NS : Int = 5 * 60 * 1_000_000_000;

  // MSG91 credentials
  let MSG91_AUTH_KEY = "503066Aju4EL5R69c2b372P1";
  let MSG91_TEMPLATE_ID = "global_otp";
  let MSG91_MAILER_DOMAIN = "qjt8sp.mailer91.com";

  // Generate a pseudo-random 6-digit OTP based on time
  func generateOtp() : Text {
    let t = Int.abs(Time.now());
    let n = t % 900000 + 100000;
    n.toText();
  };

  // Check if contact is an email address
  func isEmail(contact : Text) : Bool {
    contact.contains(#char '@');
  };

  // Send OTP via MSG91 SMS
  func sendSmsOtp(phone : Text, otp : Text) : async Bool {
    let jsonBody = "{\"template_id\":\"" # MSG91_TEMPLATE_ID # "\",\"mobile\":\"" # phone # "\",\"otp\":\"" # otp # "\",\"authkey\":\"" # MSG91_AUTH_KEY # "\"}";
    let request : HttpRequestArgs = {
      url = "https://control.msg91.com/api/v5/otp";
      max_response_bytes = ?2000;
      headers = [
        { name = "Content-Type"; value = "application/json" },
        { name = "authkey"; value = MSG91_AUTH_KEY },
      ];
      body = ?jsonBody.encodeUtf8();
      method = #post;
      transform = null;
    };
    try {
      let _response = await ic.http_request(request);
      true;
    } catch (_e) {
      true;
    };
  };

  // Send OTP via MSG91 Email
  func sendEmailOtp(email : Text, otp : Text) : async Bool {
    let jsonBody = "{\"to\":[{\"name\":\"User\",\"email\":\"" # email # "\"}],\"from\":{\"name\":\"Hosamma Temple\",\"email\":\"otp@" # MSG91_MAILER_DOMAIN # "\"},\"subject\":\"Your OTP for Hosamma Temple\",\"template_id\":\"" # MSG91_TEMPLATE_ID # "\",\"variables\":{\"otp\":\"" # otp # "\"}}";
    let request : HttpRequestArgs = {
      url = "https://control.msg91.com/api/v5/email/send";
      max_response_bytes = ?2000;
      headers = [
        { name = "Content-Type"; value = "application/json" },
        { name = "authkey"; value = MSG91_AUTH_KEY },
      ];
      body = ?jsonBody.encodeUtf8();
      method = #post;
      transform = null;
    };
    try {
      let _response = await ic.http_request(request);
      true;
    } catch (_e) {
      true;
    };
  };

  public shared func sendOtp(contactInfo : Text) : async Bool {
    let otp = generateOtp();
    let expiry = Time.now() + OTP_EXPIRY_NS;
    otpStore.add(contactInfo, { otp; expiry });

    if (isEmail(contactInfo)) {
      await sendEmailOtp(contactInfo, otp);
    } else {
      await sendSmsOtp(contactInfo, otp);
    };
  };

  public shared func verifyOtp(contactInfo : Text, otpInput : Text) : async Bool {
    switch (otpStore.get(contactInfo)) {
      case (null) { false };
      case (?record) {
        if (Time.now() > record.expiry) {
          otpStore.remove(contactInfo);
          false;
        } else if (record.otp == otpInput) {
          otpStore.remove(contactInfo);
          true;
        } else {
          false;
        };
      };
    };
  };

  // User Profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Notice functions (Admin only for create, update, delete)
  public shared ({ caller }) func createNotice(notice : Notice) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can post notices");
    };
    notices.add(notice.title, notice);
  };

  public shared ({ caller }) func deleteNotice(title : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete notices");
    };
    if (not notices.containsKey(title)) {
      Runtime.trap("Notice not found, nothing to delete.");
    };
    notices.remove(title);
  };

  public shared ({ caller }) func updateNotice(title : Text, newBody : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update notices");
    };
    notices.add(title, { title; body = newBody });
  };

  // Notice read functions
  public query func getNotice(title : Text) : async Notice {
    let notice = notices.get(title);
    switch (notice) {
      case (null) { Runtime.trap("Notice not found") };
      case (?n) { n };
    };
  };

  public query func getAllNotices() : async [Notice] {
    notices.values().toArray().sort();
  };
};
