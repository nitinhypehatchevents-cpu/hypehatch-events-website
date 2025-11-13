"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if authenticated
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem("admin_auth");
      if (auth === "true") {
        // Redirect to hero section if authenticated
        router.replace("/admin/hero");
      } else {
        // Redirect to login if not authenticated
        router.replace("/admin/login");
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA9616] mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}

