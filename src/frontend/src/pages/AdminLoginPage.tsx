import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { TempleHeader } from "../components/TempleHeader";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const AUTHORIZED_ADMIN_EMAIL = "ajayappu4509@gmail.com";

type Step = "login" | "otp";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity, clear } = useInternetIdentity();
  const { actor } = useActor();
  const [step, setStep] = useState<Step>("login");
  const [contactInfo, setContactInfo] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailError, setEmailError] = useState("");

  const isLoggingIn = loginStatus === "logging-in";

  async function handleLogin() {
    if (contactInfo.trim().toLowerCase() !== AUTHORIZED_ADMIN_EMAIL) {
      setEmailError(
        "Access denied. This email is not authorized for admin access.",
      );
      return;
    }
    setEmailError("");
    await login();
  }

  const handlePostLogin = async () => {
    if (identity && step === "login") {
      setIsSendingOtp(true);
      try {
        if (actor) {
          await (actor as any).sendOtp(contactInfo);
        }
        setStep("otp");
        toast.info(`OTP sent to ${contactInfo}`);
      } catch (_e) {
        toast.error("Failed to send OTP. Please try again.");
      } finally {
        setIsSendingOtp(false);
      }
    }
  };

  if (
    identity &&
    step === "login" &&
    loginStatus === "success" &&
    !isSendingOtp
  ) {
    handlePostLogin();
  }

  async function handleVerifyOtp() {
    setIsVerifying(true);
    setOtpError("");
    try {
      if (actor) {
        const valid = await (actor as any).verifyOtp(contactInfo, otpInput);
        if (!valid) {
          setOtpError("Invalid OTP. Please try again.");
          return;
        }
        const isAdmin = await actor.isCallerAdmin();
        if (isAdmin) {
          toast.success("Welcome, Admin! Access granted.");
          navigate({ to: "/dashboard" });
        } else {
          toast.error("Access denied: Admin privileges required");
          clear();
          setStep("login");
          setOtpInput("");
        }
      }
    } catch (_e) {
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="min-h-screen admin-bg flex flex-col">
      {/* Dark hero banner */}
      <div className="w-full h-48 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/generated/temple-hero.dim_1200x400.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-saffron-950/80" />
        <div className="relative w-full h-full flex items-end justify-center pb-4">
          <TempleHeader subtitle="Admin Portal" compact />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Restricted-access banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 mb-6"
          >
            <ShieldAlert className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive font-medium">
              Restricted access — Authorized personnel only
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-temple-dark border-saffron-800/40 bg-card/90 backdrop-blur">
                  <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-3">
                      <motion.div
                        initial={{ rotate: -12, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{
                          delay: 0.2,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className="w-16 h-16 rounded-full admin-shield-bg flex items-center justify-center shadow-lg"
                      >
                        <ShieldCheck className="text-white w-8 h-8" />
                      </motion.div>
                    </div>
                    <CardTitle className="font-display text-2xl text-saffron-600">
                      Admin Portal
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Authenticate with your secure digital identity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminContactInfo">Admin Email</Label>
                      <Input
                        data-ocid="admin_login.input"
                        id="adminContactInfo"
                        type="email"
                        value={contactInfo}
                        onChange={(e) => {
                          setContactInfo(e.target.value);
                          setEmailError("");
                        }}
                        placeholder="Enter your admin email"
                        className="border-saffron-800/40"
                      />
                      {emailError && (
                        <p className="text-destructive text-sm">{emailError}</p>
                      )}
                    </div>

                    <Button
                      data-ocid="admin_login.primary_button"
                      onClick={handleLogin}
                      disabled={isLoggingIn || !contactInfo.trim()}
                      className="w-full admin-gradient text-white hover:opacity-90 font-semibold py-6 text-base"
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="mr-2 h-5 w-5" /> Admin Sign In
                        </>
                      )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      Not an admin?{" "}
                      <Link
                        data-ocid="admin_login.link"
                        to="/login"
                        className="text-saffron-600 hover:underline font-medium"
                      >
                        Regular Sign In
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-temple-dark border-saffron-800/40 bg-card/90 backdrop-blur">
                  <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-3">
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 2.5,
                          ease: "easeInOut",
                        }}
                        className="w-16 h-16 rounded-full admin-shield-bg flex items-center justify-center shadow-lg"
                      >
                        <ShieldX className="text-white w-8 h-8" />
                      </motion.div>
                    </div>
                    <CardTitle className="font-display text-2xl text-saffron-600">
                      Admin OTP Verification
                    </CardTitle>
                    <CardDescription>
                      Enter the OTP sent to your phone/email
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        OTP sent to:{" "}
                        <span className="font-semibold text-foreground">
                          {contactInfo}
                        </span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminOtpInput">Enter OTP</Label>
                      <Input
                        data-ocid="admin_login.input"
                        id="adminOtpInput"
                        value={otpInput}
                        onChange={(e) => {
                          setOtpInput(e.target.value);
                          setOtpError("");
                        }}
                        placeholder="Enter the 6-digit code"
                        className="text-center text-xl tracking-widest font-mono border-saffron-800/40"
                        maxLength={6}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleVerifyOtp()
                        }
                      />
                      {otpError && (
                        <p
                          data-ocid="admin_login.error_state"
                          className="text-destructive text-sm"
                        >
                          {otpError}
                        </p>
                      )}
                    </div>

                    <Button
                      data-ocid="admin_login.submit_button"
                      onClick={handleVerifyOtp}
                      disabled={isVerifying || otpInput.length < 6}
                      className="w-full admin-gradient text-white hover:opacity-90 font-semibold py-5"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying Admin Access...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="mr-2 h-5 w-5" /> Verify Admin
                          Access
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <footer className="text-center py-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="text-saffron-600 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
