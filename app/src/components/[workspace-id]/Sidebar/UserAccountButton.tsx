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
import { Separator } from "@/components/ui/separator";

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
        <Button
          variant="ghost"
          className="w-full h-auto p-2 justify-start gap-3 font-normal"
        >
          <Avatar className="h-8 w-8">
            {userData.avatarUrl ? (
              <AvatarImage
                src={userData.avatarUrl}
                alt={userData.fullName || userData.email || "--"}
              />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium">
              {userData.fullName || "User"}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
              {userData.email || user.email}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-0"
        side="right"
        align="end"
        sideOffset={8}
      >
        <div className="p-3 flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {userData.avatarUrl ? (
              <AvatarImage
                src={userData.avatarUrl}
                alt={userData.fullName || userData.email || "--"}
              />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium leading-none">
              {userData.fullName || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate max-w-[160px]">
              {userData.email || user.email}
            </p>
          </div>
        </div>
        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-red-600 hover:text-red-600 hover:bg-red-100/50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
