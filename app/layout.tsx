import { Header } from "@/components";
import NavBar from "@/components/NavBar"; // Imports the main navigation, likely a Client Component due to interactivity/hooks
import Providers from "@/Providers"; // Imports Providers (e.g., for Toaster), likely a Client Component
import SessionProvider from "@/utils/SessionProvider"; // Client Component wrapper for next-auth session state
import type { Metadata } from "next";
import { getServerSession } from "next-auth"; // Fetches session server-side efficiently
import { Inter, Russo_One } from "next/font/google"; // Optimized font loading via next/font
import "svgmap/dist/svgMap.min.css"; // Global CSS import for svgmap - ensure this is needed globally
import "./globals.css"; // Global styles

// Initialize optimized font loader
const inter = Inter({ subsets: ["latin"] });

// Standard Next.js metadata
export const metadata: Metadata = {
  title: "47ak", // TODO: Update with actual app title
  description:
    "47ak лучший бренд в истории. Мы продаем всё, связанное с оруженой тематикой", // TODO: Update with actual app description
};
const russoOne = Russo_One({
  weight: "400", // Russo One имеет только вес 400
  subsets: ["latin", "cyrillic"], // Укажите нужные подмножества
});

// RootLayout is a Server Component by default
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch session data on the server - efficient way to pass initial state
  const session = await getServerSession();

  return (
    // Standard HTML structure
    <html lang="en" data-theme="light" className={`${russoOne.className}`}>
      {" "}
      {/* Consider` dynamic theme switching if needed */}
      <body className={inter.className}>
        {" "}
        {/* Applies optimized font class */}
        {/* SessionProvider MUST be a Client Component to manage session state via React Context */}
        <SessionProvider session={session}>
          <Header />
          {/* Providers likely wraps Client Components like Toaster */}
          <Providers>
            {/* Main page content is rendered here */}
            {children}
          </Providers>
          {/* NavBar is likely a Client Component due to hooks (useState, usePathname, etc.) and interactivity */}
          <NavBar />
        </SessionProvider>
      </body>
    </html>
  );
}
