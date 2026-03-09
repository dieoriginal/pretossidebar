/**
 * useUser hook — wraps Clerk's useUser and provides userId + profile info.
 * Falls back to "demo-user" when Clerk is not configured.
 */

"use client";

import { useUser as useClerkUser } from "@clerk/nextjs";

export function useCurrentUser() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { user, isLoaded, isSignedIn } = useClerkUser();

    if (!isLoaded) {
      return {
        userId: null,
        isLoaded: false,
        isSignedIn: false,
        displayName: null,
        email: null,
        avatarUrl: null,
      };
    }

    if (!isSignedIn || !user) {
      return {
        userId: null,
        isLoaded: true,
        isSignedIn: false,
        displayName: null,
        email: null,
        avatarUrl: null,
      };
    }

    return {
      userId: user.id,
      isLoaded: true,
      isSignedIn: true,
      displayName: user.fullName || user.firstName || null,
      email: user.primaryEmailAddress?.emailAddress || null,
      avatarUrl: user.imageUrl || null,
    };
  } catch {
    // Clerk not available (not configured)
    return {
      userId: null,
      isLoaded: true,
      isSignedIn: false,
      displayName: null,
      email: null,
      avatarUrl: null,
    };
  }
}
