"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ApiKeyCellProps {
  value: string;
}

export function ApiKeyCell({ value }: ApiKeyCellProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("API key copied to clipboard");
    } catch {
      toast.error("Failed to copy API key");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type={isVisible ? "text" : "password"}
        value={value}
        readOnly
        className="font-mono cursor-pointer"
        style={{
          fontFamily: "monospace",
          letterSpacing: "0.1em",
        }}
        onClick={handleCopy}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
