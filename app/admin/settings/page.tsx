"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

export default function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const { showToast } = useToast();
  const router = useRouter();

  // Get username from session or environment
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Try to get from sessionStorage or use default
      const stored = sessionStorage.getItem("admin_username");
      if (stored) {
        setUsername(stored);
      } else {
        // Default username (user should know this)
        setUsername("admin");
      }
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!currentPassword) {
      newErrors.push("Current password is required");
    }

    if (!newPassword) {
      newErrors.push("New password is required");
    } else {
      if (newPassword.length < 8) {
        newErrors.push("Password must be at least 8 characters long");
      }
      if (newPassword.length > 128) {
        newErrors.push("Password must be less than 128 characters");
      }
      if (!/[A-Z]/.test(newPassword)) {
        newErrors.push("Password must contain at least one uppercase letter");
      }
      if (!/[a-z]/.test(newPassword)) {
        newErrors.push("Password must contain at least one lowercase letter");
      }
      if (!/[0-9]/.test(newPassword)) {
        newErrors.push("Password must contain at least one number");
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
        newErrors.push("Password must contain at least one special character");
      }
    }

    if (newPassword !== confirmPassword) {
      newErrors.push("New password and confirm password do not match");
    }

    if (currentPassword === newPassword) {
      newErrors.push("New password must be different from current password");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast("Password changed successfully! Please login again.", "success");
        // Clear session and redirect to login
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("admin_auth");
          sessionStorage.removeItem("admin_credentials");
        }
        setTimeout(() => {
          router.push("/admin/login");
        }, 2000);
      } else {
        if (data.details && Array.isArray(data.details)) {
          setErrors(data.details);
        } else {
          setErrors([data.error || "Failed to change password"]);
        }
        showToast(data.error || "Failed to change password", "error");
      }
    } catch (error) {
      console.error("Password change error:", error);
      setErrors(["Failed to change password. Please try again."]);
      showToast("Failed to change password", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Change Password</h1>
        <p className="text-gray-600 mb-6">
          Update your admin dashboard password. Use a strong, unique password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
              placeholder="Enter your username"
            />
          </div>

          {/* Current Password */}
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Current Password
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showPassword.current ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent pr-12"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => ({ ...prev, current: !prev.current }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword.current ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword.new ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent pr-12"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => ({ ...prev, new: !prev.new }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword.new ? "🙈" : "👁️"}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Must be 8+ characters with uppercase, lowercase, number, and special character
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPassword.confirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent pr-12"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword.confirm ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FA9616] to-[#E8850E] text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? "Changing Password..." : "Change Password"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Security Tips */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">🔒 Security Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use a unique password that you don't use elsewhere</li>
            <li>• Change your password regularly (every 90 days)</li>
            <li>• Never share your password with anyone</li>
            <li>• Log out when finished using the dashboard</li>
            <li>• Use a password manager to store your password securely</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

