import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ghostwriter — Say it messy. Post it clearly.",
  description: "Turn spoken thoughts into social content worth posting.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
