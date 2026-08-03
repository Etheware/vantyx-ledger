
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth/session-provider";
import { useCapabilities } from "@/hooks/use-capabilities";

/**
 * Account Menu — Top-right authenticated user dropdown
 *
 * Shows user email, org name, capability-filtered menu items, sign-out
 */
export function AccountMenu() {
  const { session } = useSession();
  const capabilities = useCapabilities();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  if (!session) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface transition-colors"
      >
        <div className="flex flex-col items-end gap-0">
          <span className="text-xs font-medium text-text-primary">{session.orgName}</span>
          <span className="text-xs text-text-muted">{session.userEmail}</span>
        </div>
        {session.orgAvatarUrl && (
          <img
            src={session.orgAvatarUrl}
            alt={session.orgName}
            className="w-8 h-8 rounded-full"
          />
        )}
        {session.userAvatarUrl && (
          <img
            src={session.userAvatarUrl}
            alt={session.userEmail}
            className="w-8 h-8 rounded-full"
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface-raised border border-border rounded-lg shadow-lg z-50">
          {/* User Section */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs text-text-secondary">Signed in as</p>
            <p className="text-sm font-medium text-text-primary truncate">
              {session.userEmail}
            </p>
            <p className="text-xs text-text-muted mt-1">{session.orgName}</p>
          </div>

          {/* Profile & Account Links */}
          <div className="py-2">
            <Link
              href="/account/profile"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            >
              Profile
            </Link>
            <Link
              href="/account/security"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            >
              Security
              {session.mfaEnabled && (
                <span className="ml-2 text-xs text-success">(MFA enabled)</span>
              )}
            </Link>
            <Link
              href="/account/notifications"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            >
              Notifications
            </Link>
          </div>

          {/* Organization Settings (if owner/admin) */}
          {capabilities.has("org:read") && (
            <>
              <div className="border-t border-border py-2">
                <Link
                  href="/org/settings"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                >
                  Organization Settings
                </Link>
              </div>
            </>
          )}

          {/* Switch Organization (if member of multiple) */}
          {session.memberOfOrgs.length > 1 && (
            <div className="border-t border-border py-2">
              <Link
                href="/org/switch"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
              >
                Switch Organization
              </Link>
            </div>
          )}

          {/* Help & Support */}
          <div className="border-t border-border py-2">
            <a
              href="https://support.vantyxledger.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            >
              Help & Support
            </a>
          </div>

          {/* Sign Out */}
          <div className="border-t border-border py-2">
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                onClick={() => setIsOpen(false)}
                className="w-full text-left px-4 py-2 text-sm text-error hover:bg-surface transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
