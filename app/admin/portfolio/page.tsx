"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

interface PortfolioImage {
  id: string;
  src: string;
  alt: string;
  category: string;
  width: number;
  height: number;
  order: number;
}

export default function AdminPortfolio() {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState({ current: 0, total: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "events" | "activations">("all");
  const { showToast, ToastComponent } = useToast();
  const [formData, setFormData] = useState({
    src: "",
    alt: "Portfolio image",
    category: "events",
    width: 800,
    height: 600,
    order: 0,
  });

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/portfolio");
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const credentials = sessionStorage.getItem("admin_credentials");
      if (!credentials) {
        showToast("Please login first", "error");
        setIsSubmitting(false);
        return;
      }

      const formDataToSend = formData as any;
      const file = formDataToSend.file;

      let response;
      if (file) {
        // File upload
        const uploadFormData = new FormData();
        uploadFormData.append("image", file);
        if (formData.alt) uploadFormData.append("title", formData.alt);
        uploadFormData.append("category", formData.category);
        if (formData.alt) uploadFormData.append("alt", formData.alt);
        uploadFormData.append("order", formData.order.toString());

        response = await fetch("/api/portfolio", {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
          },
          body: uploadFormData,
        });
      } else if (formData.src) {
        // Manual path entry (backward compatibility)
        response = await fetch("/api/portfolio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${credentials}`,
          },
          body: JSON.stringify(formData),
        });
      } else {
        showToast("Please upload an image or enter an image path", "error");
        setIsSubmitting(false);
        return;
      }

      if (response.ok) {
        showToast("Image added successfully!", "success");
        setShowAddForm(false);
        setFormData({
          src: "",
          alt: "Portfolio image",
          category: "events",
          width: 800,
          height: 600,
          order: 0,
        });
        fetchImages();
      } else {
        const data = await response.json();
        const errorMsg = data.error || data.details || "Failed to add image";
        console.error("Portfolio upload error:", data);
        showToast(errorMsg, "error");
      }
    } catch (error) {
      console.error("Error adding portfolio item:", error);
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const credentials = sessionStorage.getItem("admin_credentials");
      if (!credentials) {
        showToast("Please login first", "error");
        return;
      }
      const response = await fetch(`/api/portfolio/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (response.ok) {
        showToast("Image deleted successfully!", "success");
        fetchImages();
        setSelectedImages(new Set());
      } else {
        const data = await response.json().catch(() => ({}));
        const errorMsg = data.error || data.details || "Failed to delete image";
        console.error("Delete error:", data);
        showToast(errorMsg, "error");
      }
    } catch (error) {
      console.error("Error deleting portfolio item:", error);
      showToast("An error occurred. Please try again.", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) {
      showToast("Please select at least one image to delete", "error");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedImages.size} image(s)?`)) return;

    setIsDeleting(true);
    try {
      const credentials = sessionStorage.getItem("admin_credentials");
      if (!credentials) {
        showToast("Please login first", "error");
        setIsDeleting(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const id of selectedImages) {
        try {
          const response = await fetch(`/api/portfolio/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Basic ${credentials}`,
            },
          });

          if (response.ok) {
            successCount++;
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error(`Error deleting image ${id}:`, errorData);
            errorCount++;
          }
        } catch (error) {
          console.error(`Error deleting image ${id}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        showToast(
          `Successfully deleted ${successCount} image${successCount > 1 ? 's' : ''}${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
          successCount === selectedImages.size ? "success" : "error"
        );
        setSelectedImages(new Set());
        fetchImages();
      } else {
        showToast("Failed to delete images", "error");
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);
      showToast("An error occurred during bulk delete", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedImages.size === filteredImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(filteredImages.map((img) => img.id)));
    }
  };

  const handleSelectImage = (id: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedImages(newSelected);
  };

  const filteredImages = images.filter((img) => {
    const matchesCategory = selectedCategory === "all" || img.category === selectedCategory;
    const matchesSearch = 
      img.src.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.alt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA9616] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio images...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📸 Portfolio Management</h1>
            <p className="text-gray-600">Manage your portfolio images for Events and Activations</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowBulkUpload(!showBulkUpload);
                setShowAddForm(false);
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                showBulkUpload
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transform hover:scale-105"
              }`}
            >
              {showBulkUpload ? "✕ Cancel" : "📦 Bulk Upload"}
            </button>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setShowBulkUpload(false);
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                showAddForm
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-gradient-to-r from-[#FA9616] to-[#E8850E] text-white shadow-md hover:shadow-lg transform hover:scale-105"
              }`}
            >
              {showAddForm ? "✕ Cancel" : "+ Add Single Image"}
            </button>
          </div>
        </div>

        {images.length > 0 && (
          <div className="mb-4 space-y-3">
            {/* Category Filter Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === "all"
                    ? "bg-gradient-to-r from-[#FA9616] to-[#E8850E] text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                📋 All ({images.length})
              </button>
              <button
                onClick={() => setSelectedCategory("events")}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === "events"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                📅 Events ({images.filter((img) => img.category === "events").length})
              </button>
              <button
                onClick={() => setSelectedCategory("activations")}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === "activations"
                    ? "bg-purple-500 text-white shadow-md"
                    : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                }`}
              >
                🎯 Activations ({images.filter((img) => img.category === "activations").length})
              </button>
            </div>
            {/* Search Bar */}
            <input
              type="text"
              placeholder="🔍 Search images by path, alt text, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
            />
          </div>
        )}
      </div>

      {showBulkUpload && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-blue-500">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📦 Bulk Upload Portfolio Images</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const fileInput = document.getElementById("bulk-upload-images") as HTMLInputElement;
              const files = fileInput?.files ? Array.from(fileInput.files) : [];
              const category = formData.get("category") as string;

              if (files.length === 0) {
                showToast("Please select at least one image", "error");
                return;
              }

              if (!category) {
                showToast("Please select a category", "error");
                return;
              }

              setIsBulkUploading(true);
              setBulkUploadProgress({ current: 0, total: files.length });

              try {
                const credentials = sessionStorage.getItem("admin_credentials");
                if (!credentials) {
                  showToast("Please login first", "error");
                  setIsBulkUploading(false);
                  return;
                }

                let successCount = 0;
                let errorCount = 0;

                // Upload files one by one to show progress
                for (let i = 0; i < files.length; i++) {
                  const file = files[i];
                  
                  // Validate file
                  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                    errorCount++;
                    continue;
                  }

                  if (file.size > 20 * 1024 * 1024) {
                    errorCount++;
                    continue;
                  }

                  const uploadFormData = new FormData();
                  uploadFormData.append("image", file);
                  uploadFormData.append("category", category);
                  uploadFormData.append("title", file.name.replace(/\.[^/.]+$/, ""));

                  try {
                    const response = await fetch("/api/portfolio", {
                      method: "POST",
                      headers: {
                        Authorization: `Basic ${credentials}`,
                      },
                      body: uploadFormData,
                    });

                    if (response.ok) {
                      successCount++;
                    } else {
                      const errorData = await response.json().catch(() => ({}));
                      console.error(`Error uploading ${file.name}:`, errorData);
                      errorCount++;
                    }
                  } catch (error) {
                    console.error(`Error uploading ${file.name}:`, error);
                    errorCount++;
                  }

                  setBulkUploadProgress({ current: i + 1, total: files.length });
                }

                if (successCount > 0) {
                  showToast(
                    `Successfully uploaded ${successCount} image${successCount > 1 ? 's' : ''}${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
                    successCount === files.length ? "success" : "error"
                  );
                  setShowBulkUpload(false);
                  fetchImages();
                } else {
                  showToast("Failed to upload images. Please try again.", "error");
                }
              } catch (error) {
                console.error("Error in bulk upload:", error);
                showToast("An error occurred during bulk upload", "error");
              } finally {
                setIsBulkUploading(false);
                setBulkUploadProgress({ current: 0, total: 0 });
                // Reset form
                (e.target as HTMLFormElement).reset();
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📷 Select Multiple Images <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  name="images"
                  id="bulk-upload-images"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  required
                  disabled={isBulkUploading}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Select multiple images at once. JPG, PNG, or WebP. Max 20MB per image. High quality preserved.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏷️ Category for All Images <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  id="bulk-upload-category"
                  required
                  disabled={isBulkUploading}
                  defaultValue="events"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="events">📅 Events</option>
                  <option value="activations">🎯 Activations</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  All selected images will be added to this category
                </p>
              </div>
              {isBulkUploading && (
                <div className="md:col-span-2">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-blue-900">
                        Uploading images...
                      </span>
                      <span className="text-sm font-bold text-blue-700">
                        {bulkUploadProgress.current} / {bulkUploadProgress.total}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${(bulkUploadProgress.current / bulkUploadProgress.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowBulkUpload(false);
                  setIsBulkUploading(false);
                }}
                disabled={isBulkUploading}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBulkUploading}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBulkUploading
                  ? `⏳ Uploading... (${bulkUploadProgress.current}/${bulkUploadProgress.total})`
                  : "✅ Upload All Images"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-[#FA9616]">
          <h2 className="text-xl font-bold text-gray-900 mb-4">➕ Add New Portfolio Image</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📷 Upload Image <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Store file for upload
                      (formData as any).file = file;
                      // Also set src for preview/display
                      setFormData({ ...formData, src: file.name });
                    }
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">JPG, PNG, or WebP. Max 20MB. High quality preserved. Thumbnail will be generated automatically.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📝 Title (Optional)
                </label>
                <input
                  type="text"
                  value={formData.alt}
                  onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                  placeholder="Image title or description"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏷️ Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
                >
                  <option value="events">📅 Events</option>
                  <option value="activations">🎯 Activations</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔢 Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
              </div>
              <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600">
                  <strong>Alternative:</strong> You can also manually enter an image path if the image already exists in the public folder.
                </p>
                <input
                  type="text"
                  value={formData.src}
                  onChange={(e) => setFormData({ ...formData, src: e.target.value })}
                  placeholder="/portfolio/Events/image.jpg (optional if uploading file)"
                  className="mt-2 w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-[#FA9616] to-[#E8850E] text-white rounded-lg shadow-md hover:shadow-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "⏳ Adding..." : "✅ Add Image"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Portfolio Images ({filteredImages.length})
              </h3>
              {selectedImages.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "⏳ Deleting..." : `🗑️ Delete Selected (${selectedImages.size})`}
                </button>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {images.filter((img) => img.category === "events").length} Events •{" "}
              {images.filter((img) => img.category === "activations").length} Activations
            </div>
          </div>
        </div>
        {filteredImages.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? "No images found" : "No portfolio images yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by adding your first portfolio image"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#FA9616] to-[#E8850E] text-white rounded-lg shadow-md hover:shadow-lg font-medium transition-all"
              >
                + Add First Image
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedImages.size === filteredImages.length && filteredImages.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-[#FA9616] border-gray-300 rounded focus:ring-[#FA9616]"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Preview
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Image Path
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredImages.map((image) => (
                  <tr key={image.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedImages.has(image.id)}
                        onChange={() => handleSelectImage(image.id)}
                        className="w-4 h-4 text-[#FA9616] border-gray-300 rounded focus:ring-[#FA9616]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative group">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm group-hover:shadow-md transition-shadow"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-md truncate">
                        {image.src}
                      </div>
                      {image.alt && (
                        <div className="text-xs text-gray-500 mt-1">{image.alt}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          image.category === "events"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {image.category === "events" ? "📅 Events" : "🎯 Activations"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                      #{image.order}
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

