import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Pulse | AI-Powered Campus Intelligence Platform",
  description: "Transform unstructured announcements into organised, searchable, and actionable campus intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        {children}
      </body>
    </html>
  );
}
