import { useState } from "react";
import { useRouter } from "next/router";
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
import { apiClient } from "@/lib/api-client";

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "❌ Email Diperlukan",
        description: "Silakan masukkan email Anda",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.requestResetPassword({ email });

      toast({
        title: "✅ Kode Reset Terkirim!",
        description: response.message,
      });

      // Store email in session storage
      sessionStorage.setItem("reset_password_email", email);

      // Redirect to verify OTP page
      router.push("/verify-otp-reset");
    } catch (error) {
      console.error("Request reset password error:", error);
      toast({
        title: "❌ Gagal Mengirim Kode",
        description:
          error instanceof Error
            ? error.message
            : "Gagal mengirim kode reset. Silakan coba lagi atau hubungi support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
              Reset Password
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600">
              Masukkan email Anda untuk menerima kode reset password
              <br />
              <span className="text-xs sm:text-sm text-gray-500 mt-2 block">
                Kami akan mengirim kode verifikasi ke email Anda
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRequestReset}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Masukkan email Anda"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {loading ? "Mengirim..." : "Kirim Kode Reset"}
                  </Button>
                </div>

                <div className="text-center px-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.push("/login")}
                    className="text-xs sm:text-sm text-gray-600 hover:text-gray-500 w-full sm:w-auto"
                  >
                    ← Kembali ke login
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
