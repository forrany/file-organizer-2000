import { ClerkProvider, SignedIn, SignedOut, SignIn, UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";
import { PHProvider } from "./providers";
import Logo from "@/components/ui/logo";
import { Toaster } from "react-hot-toast";
import { NavigationBar } from "@/components/navigation-bar";

import "./globals.css";
import Link from "next/link";
import ExtraUserSettings from "@/components/user-management";

export const metadata: Metadata = {
  title: "Note Companion - Dashboard",
  description: "Manage your account",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return process.env.ENABLE_USER_MANAGEMENT == "true" ? (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <html lang="en" className="light">
        <PHProvider>
          <SignedIn>
            <body className="light">
              <Toaster />
              <header className="p-4 bg-white sticky top-0 z-50 max-w-6xl mx-auto">
                <nav className="max-w-9xl mx-auto flex items-center space-x-6 justify-between w-full">
                  <div className="flex items-center space-x-6">
                    <Link href="/" className="flex-shrink-0">
                      <Logo />
                    </Link>
                    <NavigationBar />
                  </div>
                  <div className="flex items-center gap-2">
                    <ExtraUserSettings />
                    <UserButton />
                  </div>
                </nav>
              </header>
              <main className="min-h-screen text-stone-900 font-sans">
                {children}
              </main>
            </body>
          </SignedIn>
          <SignedOut>
            <body className="light">
              <Toaster />
              <main className="min-h-screen text-stone-900 font-sans">
                <div className="flex items-center justify-center h-screen">
                  <SignIn />
                </div>
              </main>
            </body>
          </SignedOut>
        </PHProvider>
      </html>
    </ClerkProvider>
  ) : (
    <html lang="en" className="light">
      <body className="light">{children}</body>
    </html>
  );
}

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body>
//         {/* <Toaster /> */}
//         <header className="p-4 border-b border-stone-300">
//           <nav className="max-w-9xl mx-auto flex items-center space-x-6 justify-between w-full">
//             {/* <Logo /> */}
//           </nav>
//         </header>
//         <main className="min-h-screen text-stone-900 font-sans">{children}</main>
//       </body>
//     </html>
//   );
// }