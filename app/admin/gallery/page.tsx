"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  thumbnailUrl: string;
  createdAt: string;
}

export default function AdminGalleryPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    image: null as File | null,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Check if already authenticated
    try {
      const auth = sessionStorage.getItem("admin_auth");
      if (auth === "true") {
        setAuthenticated(true);
        fetchGallery();
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Store credentials for API calls
    const credentials = btoa(`${username}:${password}`);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem("admin_credentials", credentials);
      } catch (error) {
        console.error("Error saving credentials:", error);
      }
    }

    // Test authentication with a simple API call
    try {
      const response = await fetch("/api/gallery?limit=1", {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (response.ok || response.status === 401) {
        // If 401, credentials are wrong
        if (response.status === 401) {
          setError("Invalid username or password");
          return;
        }
        setAuthenticated(true);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem("admin_auth", "true");
          } catch (error) {
            console.error("Error saving auth:", error);
          }
        }
        fetchGallery();
      }
    } catch {
      setError("Authentication failed");
    }
  };

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const credentials = sessionStorage.getItem("admin_credentials");
      const response = await fetch("/api/gallery", {
        headers: credentials
          ? {
              Authorization: `Basic ${credentials}`,
            }
          : {},
      });

      if (response.ok) {
        const data = await response.json();
        setGalleryItems(data.images);
      }
    } catch {
      // Error already handled by state
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image || !formData.title || !formData.category) {
      setError("Please fill in all fields");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const credentials = sessionStorage.getItem("admin_credentials");
      const uploadFormData = new FormData();
      uploadFormData.append("image", formData.image);
      uploadFormData.append("title", formData.title);
      uploadFormData.append("category", formData.category);

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: credentials
          ? {
              Authorization: `Basic ${credentials}`,
            }
          : {},
        body: uploadFormData,
      });

      if (response.ok) {
        setFormData({ title: "", category: "", image: null });
        fetchGallery();
      } else {
        const data = await response.json();
        setError(data.error || "Upload failed");
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      const credentials = sessionStorage.getItem("admin_credentials");
      const response = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
        headers: credentials
          ? {
              Authorization: `Basic ${credentials}`,
            }
          : {},
      });

      if (response.ok) {
        fetchGallery();
      } else {
        setError("Failed to delete image");
      }
    } catch {
      setError("Delete failed. Please try again.");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-heading font-bold text-ink mb-6 text-center">
            Admin Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-ink font-body font-medium mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-brandMuted rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616]"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-ink font-body font-medium mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-brandMuted rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616]"
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm font-body">{error}</div>
            )}
            <button
              type="submit"
              className="w-full bg-brand text-white px-8 py-4 rounded-full font-medium font-body hover:bg-[#D87A0F] transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="max-w-container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-ink">
            Gallery Management
          </h1>
          <button
            onClick={() => {
              sessionStorage.removeItem("admin_auth");
              sessionStorage.removeItem("admin_credentials");
              setAuthenticated(false);
            }}
            className="text-brandMuted hover:text-ink font-body"
          >
            Logout
          </button>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-heading font-semibold text-ink mb-6">
            Upload New Image
          </h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-ink font-body font-medium mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 border border-brandMuted rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616]"
                required
                maxLength={200}
              />
            </div>
            <div>
              <label
                htmlFor="category"
                className="block text-ink font-body font-medium mb-2"
              >
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 border border-brandMuted rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616]"
                required
              >
                <option value="">Select category</option>
                <option value="BTL Activation">BTL Activation</option>
                <option value="Exhibition">Exhibition</option>
                <option value="Corporate Event">Corporate Event</option>
                <option value="Retail Branding">Retail Branding</option>
                <option value="Fabrication">Fabrication</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="image"
                className="block text-ink font-body font-medium mb-2"
              >
                Image (max 2MB, JPEG/PNG/WebP)
              </label>
              <input
                type="file"
                id="image"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    image: e.target.files?.[0] || null,
                  })
                }
                className="w-full px-4 py-3 border border-brandMuted rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616]"
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm font-body">{error}</div>
            )}
            <button
              type="submit"
              disabled={uploading}
              className="bg-brand text-white px-8 py-4 rounded-full font-medium font-body hover:bg-[#D87A0F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
          </form>
        </div>

        {/* Gallery List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-heading font-semibold text-ink mb-6">
            Uploaded Images ({galleryItems.length})
          </h2>
          {loading ? (
            <div className="text-center py-12 text-brandMuted font-body">
              Loading...
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="text-center py-12 text-brandMuted font-body">
              No images uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-brandMuted/20 rounded-lg overflow-hidden"
                >
                  <div className="aspect-video bg-paper relative">
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-semibold text-ink mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-brandMuted font-body mb-3">
                      {item.category}
                    </p>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded font-body text-sm hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

