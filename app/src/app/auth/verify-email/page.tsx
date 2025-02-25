"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleResendEmail = async () => {
    setIsLoading(true);
    setError("");
    setResendSuccess(false);

    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email as string,
      });

      if (resendError) {
        throw resendError;
      }

      setResendSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to resend verification email"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent you a verification link to{" "}
            {email ? email : "your email address"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Click the link in your email to verify your account. If you
            don&apos;t see the email, check your spam folder.
          </p>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {resendSuccess && (
            <Alert>
              <AlertDescription>
                Verification email has been resent!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={handleResendEmail}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Resend verification email
          </Button>
          <Button
            onClick={() => router.push("/auth/signin")}
            variant="ghost"
            className="w-full"
          >
            Back to sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
