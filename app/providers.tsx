"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

const toastStyle = {
  background: "#fff",
  color: "#2C2C2C",
  border: "1px solid #D4C5A9",
  borderRadius: "12px",
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster position="top-right" toastOptions={{ style: toastStyle }} />
    </SessionProvider>
  );
}
