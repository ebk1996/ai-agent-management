import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Operations Console",
  description: "A simulation-first, auditable agent operations foundation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
