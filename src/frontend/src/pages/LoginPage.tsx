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
import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { TempleHeader } from "../components/TempleHeader";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type Step = "login" | "otp";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity } = useInternetIdentity();
  const { actor } = useActor();
  const [step, setStep] = useState<Step>("login");
  const [contactInfo, setContactInfo] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const isLoggingIn = loginStatus === "logging-in";

  async function handleLogin() {
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
          toast.success("Welcome back, Admin!");
          navigate({ to: "/dashboard" });
        } else {
          toast.success("Login successful!");
          navigate({ to: "/" });
        }
      }
    } catch (_e) {
      toast.error("Verification failed. Please try again.");
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
          <TempleHeader subtitle="Management Portal" compact />
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
            {step === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-temple border-border">
                  <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-3">
                      <div className="w-14 h-14 rounded-full temple-gradient flex items-center justify-center">
                        <LogIn className="text-white w-7 h-7" />
                      </div>
                    </div>
                    <CardTitle className="font-display text-2xl text-saffron-600">
                      Sign In
                    </CardTitle>
                    <CardDescription>
                      Sign in with your digital identity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactInfo">Phone Number or Email</Label>
                      <Input
                        data-ocid="login.input"
                        id="contactInfo"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        placeholder="Enter your phone or email"
                        className="border-border"
                      />
                    </div>

                    <Button
                      data-ocid="login.primary_button"
                      onClick={handleLogin}
                      disabled={isLoggingIn || !contactInfo.trim()}
                      className="w-full temple-gradient text-white hover:opacity-90 font-semibold py-6 text-base"
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <LogIn className="mr-2 h-5 w-5" /> Sign In with
                          Internet Identity
                        </>
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          New here?
                        </span>
                      </div>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Link
                        data-ocid="login.link"
                        to="/register"
                        className="text-saffron-600 hover:underline font-medium"
                      >
                        Register
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
                      OTP Verification
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
                      <Label htmlFor="otpInput">Enter OTP</Label>
                      <Input
                        data-ocid="login.input"
                        id="otpInput"
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
                          data-ocid="login.error_state"
                          className="text-destructive text-sm"
                        >
                          {otpError}
                        </p>
                      )}
                    </div>

                    <Button
                      data-ocid="login.submit_button"
                      onClick={handleVerifyOtp}
                      disabled={isVerifying || otpInput.length < 6}
                      className="w-full temple-gradient text-white hover:opacity-90 font-semibold py-5"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Verifying...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="mr-2 h-5 w-5" /> Verify &
                          Continue
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
