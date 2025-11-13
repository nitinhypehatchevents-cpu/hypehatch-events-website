"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Basic authentication check
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        const credentials = btoa(`${username}:${password}`);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem("admin_auth", "true");
            sessionStorage.setItem("admin_credentials", credentials);
            sessionStorage.setItem("admin_username", username);
            // Set expiration (8 hours)
            sessionStorage.setItem("admin_auth_expires", String(Date.now() + 8 * 60 * 60 * 1000));
          } catch (error) {
            console.error("Error saving credentials:", error);
          }
        }
        router.push("/admin/portfolio");
      } else {
        const errorMessage = data.error || "Invalid credentials. Please check your username and password.";
        console.error("Login failed:", errorMessage, data);
        setError(errorMessage);
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-2xl border-2 border-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FA9616] to-[#E8850E] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-[#FA9616] to-[#E8850E] bg-clip-text text-transparent">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Hypehatch Events Dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
              <span>❌</span>
              <span className="font-medium">{error}</span>
            </div>
          )}
          <div className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                👤 Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent transition-all"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                🔒 Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-gradient-to-r from-[#FA9616] to-[#E8850E] hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FA9616] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </>
              ) : (
                "🚀 Sign in"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

