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
import { Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { TempleHeader } from "../components/TempleHeader";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveProfile } from "../hooks/useQueries";

type Step = "register" | "otp";

export function RegisterPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity } = useInternetIdentity();
  const { actor } = useActor();
  const saveProfile = useSaveProfile();
  const [step, setStep] = useState<Step>("register");
  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const isLoggingIn = loginStatus === "logging-in";

  const handlePostLogin = async () => {
    if (identity && step === "register") {
      setIsSendingOtp(true);
      try {
        if (actor) {
          await (actor as any).sendOtp(contactInfo);
        }
        setStep("otp");
        toast.info(
          `OTP sent to ${contactInfo}. Enter it to complete registration.`,
        );
      } catch (_e) {
        toast.error("Failed to send OTP. Please try again.");
      } finally {
        setIsSendingOtp(false);
      }
    }
  };

  if (
    identity &&
    step === "register" &&
    loginStatus === "success" &&
    !isSendingOtp
  ) {
    handlePostLogin();
  }

  async function handleRegister() {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!contactInfo.trim()) {
      toast.error("Please enter your phone number or email");
      return;
    }
    await login();
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
        await saveProfile.mutateAsync(name.trim() || "Temple Member");
        toast.success("Registration complete! Welcome to the temple.");
        navigate({ to: "/" });
      }
    } catch (_e) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div
        className="w-full h-48 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/assets/generated/temple-hero.dim_1200x400.jpg')",
        }}
      >
        <div className="w-full h-full bg-saffron-900/40 flex items-end justify-center pb-4">
          <TempleHeader subtitle="Member Registration" compact />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <AnimatePresence mode="wait">
            {step === "register" ? (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-temple border-border">
                  <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-3">
                      <div className="w-14 h-14 rounded-full temple-gradient flex items-center justify-center">
                        <UserPlus className="text-white w-7 h-7" />
                      </div>
                    </div>
                    <CardTitle className="font-display text-2xl text-saffron-600">
                      Register
                    </CardTitle>
                    <CardDescription>Join the temple community</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        data-ocid="register.input"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="border-border"
                        onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactInfo">Phone Number or Email</Label>
                      <Input
                        data-ocid="register.input"
                        id="contactInfo"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        placeholder="Enter your phone or email"
                        className="border-border"
                        onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                      />
                    </div>

                    <Button
                      data-ocid="register.primary_button"
                      onClick={handleRegister}
                      disabled={
                        isLoggingIn || !name.trim() || !contactInfo.trim()
                      }
                      className="w-full temple-gradient text-white hover:opacity-90 font-semibold py-6 text-base"
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Connecting...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-5 w-5" /> Register with
                          Internet Identity
                        </>
                      )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Link
                        data-ocid="register.link"
                        to="/login"
                        className="text-saffron-600 hover:underline font-medium"
                      >
                        Sign In
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
                <Card className="shadow-temple border-border">
                  <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-3">
                      <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
                        <ShieldCheck className="text-saffron-700 w-7 h-7" />
                      </div>
                    </div>
                    <CardTitle className="font-display text-2xl text-saffron-600">
                      Verify Identity
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
                      <Label htmlFor="otpVerify">Enter OTP</Label>
                      <Input
                        data-ocid="register.input"
                        id="otpVerify"
                        value={otpInput}
                        onChange={(e) => {
                          setOtpInput(e.target.value);
                          setOtpError("");
                        }}
                        placeholder="Enter the 6-digit code"
                        className="text-center text-xl tracking-widest font-mono border-border"
                        maxLength={6}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleVerifyOtp()
                        }
                      />
                      {otpError && (
                        <p
                          data-ocid="register.error_state"
                          className="text-destructive text-sm"
                        >
                          {otpError}
                        </p>
                      )}
                    </div>

                    <Button
                      data-ocid="register.submit_button"
                      onClick={handleVerifyOtp}
                      disabled={isVerifying || otpInput.length < 6}
                      className="w-full temple-gradient text-white hover:opacity-90 font-semibold py-5"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Registering...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="mr-2 h-5 w-5" /> Complete
                          Registration
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
