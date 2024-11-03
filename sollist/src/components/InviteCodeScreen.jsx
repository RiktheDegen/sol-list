"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function InviteCodeScreen() {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, let's use a simple hardcoded invite code
    // In production, you'd want to validate this against your backend
    if (inviteCode === "ARMSTRONG42069") {
      Cookies.set('inviteCode', inviteCode, { expires: 365 }); // Expires in 1 year
      window.location.reload(); // Reload the page to show the main content
    } else {
      setError("Invalid invite code");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold text-center mb-6">Welcome to OpenList</h1>
          <p className="text-center mb-6 text-muted-foreground">
            Please enter your invite code to continue
          </p>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full"
              />
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 