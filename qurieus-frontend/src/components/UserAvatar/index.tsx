"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface UserAvatarProps {
  name: string;
  /** Full URL (e.g. from OAuth) or undefined when using userId + S3 */
  image?: string | null;
  /** When image is an S3 key, we use /api/user/avatar/[userId] */
  userId?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

function getInitials(name: string): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Reusable avatar component: shows user image when available, else initials.
 * Use image for OAuth URLs; use userId when image is stored in our DB (S3).
 */
export function UserAvatar({ name, image, userId, className, size = "md" }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  // Use image URL directly if it's a full URL (OAuth); otherwise use our avatar API when we have userId + image (S3 key)
  const src = image
    ? image.startsWith("http")
      ? image
      : userId
        ? `/api/user/avatar/${userId}`
        : undefined
    : undefined;

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback className="bg-muted text-muted-foreground">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;
