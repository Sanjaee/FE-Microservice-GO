import React from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  callbackUrl?: string;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = "ghost",
  size = "default",
  className = "",
  children,
  callbackUrl = "/login",
}) => {
  const handleLogout = async () => {
    await signOut({ callbackUrl });
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
    >
      {children || (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </>
      )}
    </Button>
  );
};
