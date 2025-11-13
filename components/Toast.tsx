"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-400 text-red-900",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  }[type];

  const icon = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
  }[type];

  // Special styling for error messages - darker red/maroon
  const errorStyle = type === "error" 
    ? "bg-red-50 border-red-600 text-[#8B0000] font-semibold" 
    : "";

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg border-2 ${bgColor} ${errorStyle} flex items-center space-x-3 animate-slide-in`}
    >
      <span className={`text-xl ${type === "error" ? "text-red-700" : ""}`}>{icon}</span>
      <span className={`font-medium ${type === "error" ? "text-[#8B0000] font-bold" : ""}`}>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

  const ToastComponent = toast ? (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={() => setToast(null)}
    />
  ) : null;

  return { showToast, ToastComponent };
}


