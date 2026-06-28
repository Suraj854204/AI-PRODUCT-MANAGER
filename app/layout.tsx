import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI PM Agent — Your idea becomes a product plan in 5 minutes",
  description:
    "Seven specialized AI agents research, plan, and validate your product idea — market research, PRD, user stories, roadmap, market analysis, personas, and risk assessment, all generated automatically.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface text-slate-100 antialiased">
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e293b",
              border: "1px solid #334155",
              color: "#f1f5f9",
            },
          }}
        />
      </body>
    </html>
  );
}
