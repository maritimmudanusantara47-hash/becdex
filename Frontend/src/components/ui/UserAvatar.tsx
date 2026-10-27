"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface UserAvatarProps {
  image?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  fallbackClassName?: string;
  alt?: string;
  fallbackIcon?: React.ReactNode;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  image,
  name,
  size = "md",
  className,
  fallbackClassName,
  alt,
  fallbackIcon,
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state if image URL changes (e.g. after user uploads a new avatar)
  useEffect(() => {
    setHasError(false);
  }, [image]);

  const sizeClasses: Record<"sm" | "md" | "lg" | "xl", string> = {
    sm: "w-8 h-8 text-xs rounded-xl",
    md: "w-9 h-9 text-xs rounded-xl",
    lg: "w-12 h-12 text-base rounded-xl",
    xl: "w-24 h-24 text-2xl rounded-2xl",
  };

  const initial = (name?.trim()?.[0] || "U").toUpperCase();

  const getFullImageUrl = (path: string) => {
    if (
      path.startsWith("http://") ||
      path.startsWith("https://") ||
      path.startsWith("blob:") ||
      path.startsWith("data:")
    ) {
      return path;
    }
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api\/?$/, "");
    return `${baseUrl}/storage/${path.replace(/^\//, "")}`;
  };

  if (!image || hasError) {
    return (
      <div
        className={cn(
          "bg-linear-to-tr from-[#0c2340] to-blue-600 text-white font-bold flex items-center justify-center shrink-0 shadow-xs border border-slate-200/60 dark:border-slate-800 select-none",
          sizeClasses[size],
          className,
          fallbackClassName
        )}
        title={name || undefined}
        aria-label={name || "User Avatar"}
      >
        {fallbackIcon || initial}
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={getFullImageUrl(image)}
      alt={alt || name || "User Avatar"}
      onError={() => setHasError(true)}
      className={cn(
        "object-cover shrink-0 shadow-xs border border-slate-200/60 dark:border-slate-800 bg-slate-100 dark:bg-slate-800",
        sizeClasses[size],
        className
      )}
    />
  );
};

export default UserAvatar;
