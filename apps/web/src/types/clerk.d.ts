declare module "@clerk/nextjs" {
  import * as React from "react";
  export const ClerkProvider: React.FC<{ children?: React.ReactNode }>;
  export const SignIn: React.FC<any>;
  export const SignUp: React.FC<any>;
}

declare module "@clerk/nextjs/server" {
  export const clerkMiddleware: (...args: any[]) => any;
}
