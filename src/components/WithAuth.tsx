import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface WithAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const WithAuth: React.FC<WithAuthProps> = ({ 
  children, 
  fallback = (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Get current URL as callback URL
      const callbackUrl = encodeURIComponent(router.asPath);
      router.push(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [status, router]);

  if (status === "loading") {
    return <>{fallback}</>;
  }

  if (status === "unauthenticated") {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
