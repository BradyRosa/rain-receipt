import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { BASE_APP_ID, TALENTAPP_PROJECT_VERIFICATION } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Rain Receipt",
  description: "A three-action onchain weather receipt for Base."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="talentapp:project_verification" content={TALENTAPP_PROJECT_VERIFICATION} />
        <meta name="base:app_id" content={BASE_APP_ID} />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
