'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getRealtorProfile, updateRealtorPassword } from '../actions';

interface RealtorProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  brokerage: string;
  state: string;
  agentCode: string;
}

export function RealtorProfile() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<RealtorProfileData | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (session) {
    //   fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const profileData = await getRealtorProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching realtor profile:', error);
      toast.error("Failed to fetch profile. Please try again.");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      await updateRealtorPassword(newPassword);
      toast.success("Password updated successfully.");
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error("Failed to update password. Please try again.");
    }
  };


  return (
    <div className="space-y-6">
      {/* <Card>
        <CardHeader>
          <CardTitle>Realtor Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input value={profile.firstName} readOnly />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input value={profile.lastName} readOnly />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={profile.email} readOnly />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input value={profile.phoneNumber} readOnly />
            </div>
            <div>
              <Label>Brokerage</Label>
              <Input value={profile.brokerage} readOnly />
            </div>
            <div>
              <Label>State</Label>
              <Input value={profile.state} readOnly />
            </div>
            <div>
              <Label>Agent Code</Label>
              <Input value={profile.agentCode} readOnly />
            </div>
          </div>
        </CardContent>
      </Card> */}

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Update Password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}