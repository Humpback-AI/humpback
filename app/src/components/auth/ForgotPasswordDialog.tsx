"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ForgotPasswordDialog() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Add your password reset logic here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSuccess(true);
    } catch {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="px-0 font-normal">
          Forgot password?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </DialogDescription>
        </DialogHeader>
        {!isSuccess ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send reset link
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                If an account exists with that email, you will receive a
                password reset link shortly.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsSuccess(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
