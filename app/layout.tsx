import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Ritewheel Autos | Discover your next vehicle", template: "%s | Ritewheel Autos" },
  description: "Discover, compare and personalise your next vehicle with Ritewheel Autos.",
  applicationName: "Ritewheel Autos",
  appleWebApp: { capable: true, title: "Ritewheel Autos", statusBarStyle: "black-translucent" }
};

export const viewport: Viewport = {
  themeColor: "#080909",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}