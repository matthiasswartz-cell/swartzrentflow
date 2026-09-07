import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "RentFlow Pro",
  description: "Rent-to-own operations — demo and staging",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClerkProvider appearance={{ baseTheme: dark }} signInUrl="/sign-in" signUpUrl="/sign-up" signInFallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/onboarding">
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
