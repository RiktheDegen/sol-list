"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Cookies from 'js-cookie';

export default function InviteCodeScreen() {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inviteCode === "ARMSTRONG42069") {
      Cookies.set('inviteCode', inviteCode, { expires: 365 });
      window.location.reload();
    } else {
      setError("Invalid invite code");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden md:min-h-screen">
      {/* Background Semicircles */}
      <div className="absolute bottom-0 w-full">
        <div className="relative h-[30vh] md:h-[30vh]">
          {/* Largest semicircle */}
          <div 
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[200vw] md:w-[100vw] h-[250vw] md:h-[100vw] rounded-t-full bg-[#5FA2FF]"
            style={{
              transform: 'translateX(-50%) translateY(50%)',
            }}
          />
          {/* Medium semicircle */}
          <div 
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[150vw] md:w-[75vw] h-[150vw] md:h-[75vw] rounded-t-full bg-[#4374BA]"
            style={{
              transform: 'translateX(-50%) translateY(50%)',
            }}
          />
          {/* Smallest semicircle */}
          <div 
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[100vw] md:w-[50vw] h-[100vw] md:h-[50vw] rounded-t-full bg-[#223E65]"
            style={{
              transform: 'translateX(-50%) translateY(50%)',
            }}
          />
        </div>
      </div>

      {/* Content */}
      <Card className="w-full max-w-[1022px] mt-96 relative z-10 my-auto md:min-h-[565px] md:my-auto">
        <CardContent className="pt-16">
          <h1 className="text-xl font-bold text-center mb-2 italic text-bold md:text-2xl" style={{WebkitTextStroke: '2px black'}}>WELCOME TO OPENLIST</h1>
          <p className="text-center mb-6 text-muted-foreground">
          Buy and sell anything from your twitter friends. DM @0xHiraishin for invites.
          </p>
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