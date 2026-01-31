"use client";

import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters";

const baseURL =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/auth`
    : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}`.replace(
        /\/$/,
        ""
      ) + "/api/auth";

export const authClient = createAuthClient(baseURL, {
  adapter: BetterAuthReactAdapter(),
});
