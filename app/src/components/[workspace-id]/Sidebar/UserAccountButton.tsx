"use client";

import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Props {
  user: User;
}

interface UserData {
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
}

export function UserAccountButton({ user }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    fullName: null,
    email: null,
    avatarUrl: null,
  });
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("users")
        .select("full_name, email, avatar_image_url")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setUserData({
          fullName: data.full_name,
          email: data.email,
          avatarUrl: data.avatar_image_url,
        });
      }
    };

    fetchUserData();
  }, [user.id]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/signin");
  };

  const initials = userData.fullName
    ? userData.fullName
        .split(" ")
        .map((name: string) => name[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
          <Avatar className="h-8 w-8">
            {user.user_metadata?.avatar_url ? (
              <AvatarImage
                src={userData.avatarUrl || ""}
                alt={userData.fullName || userData.email || "--"}
              />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-3">
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-medium">
              {userData.fullName || userData.email || "--"}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-8"
              onClick={handleLogout}
            >
              <LogOut />
              Logout
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
