import type { Metadata } from "next";
import { Style_Script, Poppins } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { seed } from "../../prisma/seed";
import { Toaster } from "sonner";
import { Provider } from "./provider";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Style_Script({
  weight: ["400"],
  variable: "--font-header",
  subsets: ["latin"],
});

const geistMono = Poppins({
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Activation",
  description: "Activation",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await seed();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider>
            <Provider>{children}</Provider>
            <Toaster />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
