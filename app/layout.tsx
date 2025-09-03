import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers"; // SessionProvider wrapper (simple component)
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getDataMode } from "@/lib/dataMode";
import { DataModeSwitch } from "@/components/DataModeSwitch";


const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "OpenBoard — Find & Join Open‑Source Projects",
  description: "A discovery & collaboration hub for maintainers and contributors.",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const mode = getDataMode();
  return (
    <html lang="en" className="dark">
      <body className={inter.className + " bg-black text-white"}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}