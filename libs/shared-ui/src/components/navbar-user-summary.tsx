"use client";

import React from "react";
import { Avatar } from "@heroui/react";

export interface NavbarUserSummaryProps {
  userName?: string;
  userImage?: string;
  userEmail: string;
  className?: string;
}

export const NavbarUserSummary: React.FC<NavbarUserSummaryProps> = ({
  userName,
  userImage,
  userEmail,
  className,
}) => {
  const userInitials = userName
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div
      data-testid="navbar-user-summary"
      className={`flex items-center gap-3 rounded-[8px] border border-default-200 px-3 py-2 ${className ?? ""}`.trim()}
    >
      <Avatar size="sm">
        {userImage ? <Avatar.Image src={userImage} alt={userName ?? userEmail} /> : null}
        <Avatar.Fallback>{userInitials || userEmail.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </Avatar>
      <div className="min-w-0">
        {userName && (
          <p className="truncate text-sm font-medium text-foreground">
            {userName}
          </p>
        )}
        <p className="truncate text-xs text-default-500">
          {userEmail}
        </p>
      </div>
      {!userImage && userInitials && (
        <span className="sr-only">{userInitials}</span>
      )}
    </div>
  );
};

export default NavbarUserSummary;
