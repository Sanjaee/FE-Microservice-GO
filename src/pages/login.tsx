import React, { useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { LoginForm } from "../components/LoginForm";
import { toast } from "@/hooks/use-toast";

const LoginPage = () => {
  const router = useRouter();

  // Handle OAuth errors from URL parameters
  useEffect(() => {
    const { error } = router.query;

    if (error) {
      let errorMessage = "An error occurred during authentication";

      switch (error) {
        case "AccessDenied":
          errorMessage =
            "This email is already registered with credentials. Please use email/password login instead.";
          break;
        case "Configuration":
          errorMessage = "There is a problem with the server configuration.";
          break;
        case "Verification":
          errorMessage =
            "The verification token has expired or has already been used.";
          break;
        case "CredentialsSignin":
          errorMessage =
            "This account was created with Google. Please use Google sign-in instead.";
          break;
        default:
          errorMessage = `Authentication error: ${error}`;
      }

      toast({
        title: "❌ Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Clean up the URL by removing the error parameter
      router.replace("/login", undefined, { shallow: true });
    }
  }, [router]);

  // Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        // Get callback URL from query params or default to dashboard
        const callbackUrl =
          (router.query.callbackUrl as string) || "/dashboard";
        router.push(callbackUrl);
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
