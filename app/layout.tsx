import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ritewheel Autos | Discover your next vehicle",
    template: "%s | Ritewheel Autos",
  },
  description: "Discover, compare and personalise your next vehicle with Ritewheel Autos.",
  applicationName: "Ritewheel Autos",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://ritewheel-autos.vercel.app"),
  openGraph: {
    title: "Ritewheel Autos",
    description: "Discover confidently. Personalise thoughtfully.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#080909",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
