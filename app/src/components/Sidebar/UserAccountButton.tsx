"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserData } from "@/contexts/AuthContext";

interface Props {
  user: UserData;
}

export function UserAccountButton({ user }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/signin");
  };

  const initials = user.full_name
    ? user.full_name
        .split(" ")
        .map((name: string) => name[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full h-auto p-2 justify-start gap-3 font-normal"
        >
          <Avatar className="h-8 w-8">
            {user.avatar_image_url ? (
              <AvatarImage
                src={user.avatar_image_url}
                alt={user.full_name || user.email || "--"}
              />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col items-start text-left w-full">
            <span className="text-sm font-medium">
              {user.full_name || "User"}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
              {user.email}
            </span>
          </div>
          <ChevronsUpDown className="text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64"
        side="right"
        align="end"
        sideOffset={8}
      >
        <div className="p-2 flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {user.avatar_image_url ? (
              <AvatarImage
                src={user.avatar_image_url}
                alt={user.full_name || user.email || "--"}
              />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium leading-none">
              {user.full_name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate max-w-[160px]">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="w-full justify-start gap-2 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
