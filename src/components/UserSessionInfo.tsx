import React from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Calendar } from "lucide-react";

export const UserSessionInfo: React.FC = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Info</CardTitle>
          <CardDescription>Loading session information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Info</CardTitle>
          <CardDescription>No active session</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Please log in to view session information.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Session Information
        </CardTitle>
        <CardDescription>Current user session details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <User className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-gray-600">
                {session.user?.name || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-gray-600">
                {session.user?.email || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Shield className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">Status</p>
              <Badge variant={session.isVerified ? "default" : "destructive"}>
                {session.isVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium">User ID</p>
              <p className="text-sm text-gray-600 font-mono">
                {session.user?.id || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {session.accessToken && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Access Token</p>
            <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all">
              {session.accessToken.substring(0, 50)}...
            </div>
          </div>
        )}

        {session.refreshToken && (
          <div>
            <p className="text-sm font-medium mb-2">Refresh Token</p>
            <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all">
              {session.refreshToken.substring(0, 50)}...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
