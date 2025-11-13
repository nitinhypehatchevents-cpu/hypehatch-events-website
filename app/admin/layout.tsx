"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Simplified auth check - no loading state, instant check
    if (typeof window === 'undefined') return;
    
    try {
      const auth = sessionStorage.getItem("admin_auth");
      setIsAuthenticated(auth === "true");
      
      // If not authenticated and not on login/setup page, redirect
      if (auth !== "true" && pathname && pathname !== "/admin/login" && pathname !== "/admin/setup") {
        router.replace("/admin/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
      if (pathname && pathname !== "/admin/login" && pathname !== "/admin/setup") {
        router.replace("/admin/login");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // If not authenticated and not on login/setup page, show nothing (will redirect)
  if (!isAuthenticated && pathname !== "/admin/login" && pathname !== "/admin/setup") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {pathname !== "/admin/login" && pathname !== "/admin/setup" && (
        <nav className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FA9616] to-[#E8850E] rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-lg">H</span>
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-[#FA9616] to-[#E8850E] bg-clip-text text-transparent">
                    Hypehatch Events
                  </h1>
                </div>
                <div className="hidden md:flex items-center space-x-1">
                  <Link
                    href="/admin/hero"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      pathname === "/admin/hero"
                        ? "bg-[#FA9616] text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    🎬 Hero
                  </Link>
                  <Link
                    href="/admin/portfolio"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      pathname === "/admin/portfolio"
                        ? "bg-[#FA9616] text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    📸 Portfolio
                  </Link>
                  <Link
                    href="/admin/brands"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      pathname === "/admin/brands"
                        ? "bg-[#FA9616] text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    🏢 Brands
                  </Link>
                  <Link
                    href="/admin/testimonials"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      pathname === "/admin/testimonials"
                        ? "bg-[#FA9616] text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    💬 Testimonials
                  </Link>
                  <Link
                    href="/admin/contact"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      pathname === "/admin/contact"
                        ? "bg-[#FA9616] text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    📞 Contact
                  </Link>
                  <Link
                    href="/admin/messages"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                      pathname === "/admin/messages"
                        ? "bg-[#FA9616] text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    💬 Messages
                  </Link>
                  <Link
                    href="/admin/settings"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      pathname === "/admin/settings"
                        ? "bg-[#FA9616] text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    ⚙️ Settings
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    try {
                      if (typeof window !== 'undefined') {
                        sessionStorage.removeItem("admin_auth");
                        sessionStorage.removeItem("admin_credentials");
                      }
                      router.push("/admin/login");
                    } catch (error) {
                      console.error("Logout error:", error);
                      router.push("/admin/login");
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all border border-gray-200 hover:border-red-200"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}

