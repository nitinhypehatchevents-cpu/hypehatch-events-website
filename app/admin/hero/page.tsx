"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

interface HeroImage {
  id: number;
  url: string;
  createdAt: string;
}

export default function AdminHero() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/hero");
      const data = await response.json();
      console.log("Hero images fetched:", data.images);
      if (data.images && data.images.length > 0) {
        console.log("First image URL:", data.images[0].url);
      }
      setImages(data.images || []);
    } catch (error) {
      console.error("Error fetching hero images:", error);
      showToast("Failed to load hero images", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast("Invalid file type. Only JPG, PNG, and WebP are allowed.", "error");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      showToast("File size exceeds 20MB limit.", "error");
      return;
    }

    // Check current count
    if (images.length >= 5) {
      showToast("Maximum 5 hero images allowed. Please delete one first.", "error");
      return;
    }

    setUploading(true);
    try {
      const credentials = sessionStorage.getItem("admin_credentials");
      if (!credentials) {
        showToast("Please login first", "error");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/hero", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
        body: formData,
      });

      if (response.ok) {
        showToast("Hero image uploaded successfully!", "success");
        fetchImages();
        // Reset file input
        e.target.value = "";
      } else {
        const data = await response.json();
        showToast(data.error || "Failed to upload image", "error");
      }
    } catch (error) {
      console.error("Error uploading hero image:", error);
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this hero image?")) return;

    try {
      const credentials = sessionStorage.getItem("admin_credentials");
      if (!credentials) {
        showToast("Please login first", "error");
        return;
      }

      const response = await fetch(`/api/hero/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (response.ok) {
        showToast("Hero image deleted successfully!", "success");
        fetchImages();
      } else {
        showToast("Failed to delete image", "error");
      }
    } catch (error) {
      console.error("Error deleting hero image:", error);
      showToast("An error occurred. Please try again.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA9616] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hero images...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {ToastComponent}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🎬 Hero Section Management</h1>
            <p className="text-gray-600">
              Manage hero background images. Maximum 5 images allowed.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {images.length} / 5 images
            </div>
            <label
              className={`px-6 py-3 rounded-lg font-medium transition-all cursor-pointer ${
                uploading || images.length >= 5
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#FA9616] to-[#E8850E] text-white shadow-md hover:shadow-lg transform hover:scale-105"
              }`}
            >
              {uploading ? "⏳ Uploading..." : "+ Upload Image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleUpload}
                disabled={uploading || images.length >= 5}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {images.length >= 5 && (
          <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">
              ⚠️ Maximum limit reached. Delete an image to upload a new one.
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {images.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hero images yet
            </h3>
            <p className="text-gray-600 mb-6">
              Upload your first hero background image to get started
            </p>
            <label className="inline-block px-6 py-3 bg-gradient-to-r from-[#FA9616] to-[#E8850E] text-white rounded-lg shadow-md hover:shadow-lg font-medium transition-all cursor-pointer">
              + Upload First Image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Preview
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Image URL
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {images.map((image) => (
                  <tr key={image.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative w-32 h-20 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={image.url}
                          alt={`Hero image ${image.id}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error("❌ Failed to load hero image:", image.url);
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                            const parent = img.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-red-50 border-2 border-red-200">
                                  <div class="text-center p-2">
                                    <div class="text-2xl mb-1">❌</div>
                                    <p class="text-xs text-red-600">Failed</p>
                                  </div>
                                </div>
                              `;
                            }
                          }}
                          onLoad={() => {
                            console.log("✅ Hero image loaded:", image.url);
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md truncate" title={image.url}>
                        {image.url}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-medium"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

