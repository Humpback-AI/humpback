"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Exchange the code for a session
    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        // Let the middleware handle the redirect
        router.push("/");
      }
    });
  }, [router]);

  return (
    <div className="w-full flex justify-center items-center h-[calc(100vh-80px)]">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}
