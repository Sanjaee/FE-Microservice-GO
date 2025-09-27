import React, { useState, useEffect } from 'react';
import { useApi } from '@/components/ApiProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { User, Save, Loader2 } from 'lucide-react';

interface UserProfileProps {
  userId?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { apiClient, isAuthenticated, accessToken } = useApi();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [username, setUsername] = useState('');

  // Fetch user profile
  const fetchProfile = async () => {
    if (!isAuthenticated || !accessToken) {
      toast({
        title: "Error",
        description: "You need to be logged in to view profile",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.getProfile();
      setUser(response.user);
      setUsername(response.user.username);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async () => {
    if (!isAuthenticated || !accessToken) {
      toast({
        title: "Error",
        description: "You need to be logged in to update profile",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      const response = await apiClient.updateProfile({ username });
      setUser(response.user);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, accessToken]);

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Please log in to view your profile</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Loading your profile...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

 
};
