"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { createClient } from "@/lib/supabase/client";
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

const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ForgotPasswordDialog() {
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: ResetPasswordFormValues) {
    setError(null);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        values.email,
        {
          redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password`,
        }
      );

      if (resetError) {
        throw resetError;
      }

      setIsSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send reset email. Please try again."
      );
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          form.reset();
          setError(null);
          setIsSuccess(false);
        }
      }}
    >
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isSubmitting}
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
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
                onClick={() => {
                  setIsSuccess(false);
                  setIsOpen(false);
                  form.reset();
                }}
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
