import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";
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
import { toast } from "@/hooks/use-toast";
import { Mail, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function VerifyOtp() {
  const router = useRouter();
  const { userId } = router.query;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // No countdown initially
  const [canResend, setCanResend] = useState(true); // Can resend immediately
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastVerificationTime, setLastVerificationTime] = useState(0);
  const [userEmail, setUserEmail] = useState("");

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // No initial countdown - user can resend immediately

  // Redirect if no userId and get email
  useEffect(() => {
    if (!userId && router.isReady) {
      router.push("/register");
    } else if (userId && router.isReady) {
      // Get email from query params or session storage
      const emailFromQuery = router.query.email as string;
      const emailFromStorage = sessionStorage.getItem("registration_email");

      if (emailFromQuery) {
        setUserEmail(emailFromQuery);
        sessionStorage.setItem("registration_email", emailFromQuery);
      } else if (emailFromStorage) {
        setUserEmail(emailFromStorage);
      }
    }
  }, [userId, router.isReady, router.query.email]);

  const formatTime = (seconds: number) => {
    return `${seconds}s`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value.replace(/[^0-9]/g, ""); // Only allow numbers
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (value && index === 5) {
      const updatedOtp = [...newOtp];
      updatedOtp[index] = value.replace(/[^0-9]/g, "");
      const otpString = updatedOtp.join("");

      if (otpString.length === 6 && !isVerifying) {
        const now = Date.now();
        // Prevent multiple rapid verifications (debounce)
        if (now - lastVerificationTime > 1000) {
          setLastVerificationTime(now);
          // Small delay to ensure the last digit is set
          setTimeout(() => {
            verifyOtp(otpString);
          }, 100);
        }
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    // Auto-verify if 6 digits are pasted
    if (pastedData.length === 6 && !isVerifying) {
      const now = Date.now();
      // Prevent multiple rapid verifications (debounce)
      if (now - lastVerificationTime > 1000) {
        setLastVerificationTime(now);
        setTimeout(() => {
          verifyOtp(pastedData);
        }, 100);
      }
    }
  };

  const verifyOtp = async (otpString: string) => {
    if (!userId) {
      toast({
        title: "❌ Sesi Tidak Valid",
        description: "Sesi verifikasi tidak valid. Silakan daftar ulang.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    setLoading(true);

    try {
      const data = (await api.verifyOTP({
        email: userEmail,
        otp_code: otpString,
      })) as any;

      toast({
        title: "🎉 Berhasil!",
        description:
          "Email berhasil diverifikasi! Selamat datang di ZACloth. Mengalihkan ke dashboard...",
      });

      // Auto-login using the JWT tokens from verification
      try {
        const loginResult = await signIn("credentials", {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          redirect: false,
        });

        if (loginResult?.ok) {
          // Login successful, redirect to dashboard
          router.push("/dashboard");
        } else {
          // If auto-login fails, redirect to login page
          toast({
            title: "⚠️ Verifikasi Berhasil",
            description:
              "Email berhasil diverifikasi. Silakan login untuk melanjutkan.",
          });
          router.push("/login");
        }
      } catch (loginError) {
        console.error("Auto-login failed:", loginError);
        // If auto-login fails, redirect to login page
        toast({
          title: "⚠️ Verifikasi Berhasil",
          description:
            "Email berhasil diverifikasi. Silakan login untuk melanjutkan.",
        });
        router.push("/login");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast({
        title: "❌ Verifikasi Gagal",
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat verifikasi. Silakan coba lagi atau hubungi support.",
        variant: "destructive",
      });
      // Clear OTP on error and reset verification state
      setOtp(["", "", "", "", "", ""]);
      setIsVerifying(false);
      setLastVerificationTime(0);
      // Focus on first input
      const firstInput = document.getElementById("otp-0");
      firstInput?.focus();
    } finally {
      setLoading(false);
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast({
        title: "❌ OTP Tidak Valid",
        description: "Silakan masukkan 6 digit kode OTP yang valid",
        variant: "destructive",
      });
      return;
    }

    await verifyOtp(otpString);
  };

  const handleResendOtp = async () => {
    if (!canResend || !userId) return;

    setResendLoading(true);

    // Start countdown after clicking resend
    setTimeLeft(30);
    setCanResend(false);

    try {
      const data = await api.resendOTP({
        email: userEmail,
      });

      toast({
        title: "✅ OTP Terkirim!",
        description: `Kode OTP baru sedang dikirim ke ${userEmail}. Silakan periksa email Anda.`,
      });
      // Timer already set above, no need to reset here
      setOtp(["", "", "", "", "", ""]); // Clear current OTP
      setLastVerificationTime(0); // Reset verification time
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast({
        title: "❌ Gagal Mengirim",
        description:
          error instanceof Error
            ? error.message
            : "Gagal mengirim ulang OTP. Silakan coba lagi atau hubungi support.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
              Verifikasi Email
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600">
              {userEmail ? (
                <>
                  OTP sudah dikirim ke{" "}
                  <span className="font-semibold text-blue-600 break-all">
                    {userEmail}
                  </span>
                </>
              ) : (
                "Kode verifikasi telah dikirim ke email Anda"
              )}
              <br />
              <span className="text-xs sm:text-sm text-gray-500 mt-2 block">
                Verifikasi email diperlukan untuk mengakses akun Anda
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <div
                    className="flex gap-2 items-center justify-center"
                    onPaste={handlePaste}
                  >
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={`w-10 h-10 sm:w-12 sm:h-12 text-center text-base sm:text-lg font-semibold ${
                          isVerifying ? "opacity-50" : ""
                        }`}
                        disabled={loading || isVerifying}
                      />
                    ))}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 text-center flex items-center justify-center gap-2">
                    {isVerifying && (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    )}
                    <span className="text-center">
                      {isVerifying
                        ? "Memverifikasi kode..."
                        : "Masukkan 6 digit kode yang dikirim ke email Anda"}
                    </span>
                  </div>
                  {otp.join("").length === 6 && !isVerifying && (
                    <p className="text-xs text-blue-600 text-center">
                      ✨ Kode akan diverifikasi secara otomatis
                    </p>
                  )}
                  {userEmail && (
                    <p className="text-xs text-gray-500 text-center mt-2 px-2">
                      Periksa folder spam jika email tidak ditemukan
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      loading || isVerifying || otp.join("").length !== 6
                    }
                  >
                    {(loading || isVerifying) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {loading || isVerifying
                      ? "Memverifikasi..."
                      : "Verifikasi Email"}
                  </Button>
                </div>

                <div className="text-center px-2">
                  {!canResend ? (
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm text-gray-600">
                        Kirim ulang kode dalam {formatTime(timeLeft)}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm text-gray-600">
                        Tidak menerima email?
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResendOtp}
                        disabled={resendLoading}
                        className="text-xs sm:text-sm w-full sm:w-auto"
                      >
                        {resendLoading ? "Mengirim..." : "Kirim Ulang OTP"}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="text-center px-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.push("/register")}
                    className="text-xs sm:text-sm text-gray-600 hover:text-gray-500 w-full sm:w-auto"
                  >
                    ← Kembali ke pendaftaran
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
