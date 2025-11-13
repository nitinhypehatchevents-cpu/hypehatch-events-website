"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

interface Brand {
  id: string;
  name: string;
  logo: string;
  website?: string;
  order: number;
  isActive: boolean;
}

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState({ current: 0, total: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast, ToastComponent } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    website: "",
    order: 0,
    isActive: true,
  });

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/brands");
      const data = await response.json();
      setBrands(data.brands || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
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
        uploadFormData.append("logo", file);
        uploadFormData.append("name", formData.name);
        if (formData.website) uploadFormData.append("website", formData.website);
        uploadFormData.append("order", formData.order.toString());
        uploadFormData.append("isActive", formData.isActive.toString());

        response = await fetch("/api/brands", {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
          },
          body: uploadFormData,
        });
      } else if (formData.logo) {
        // Manual path entry (backward compatibility)
        response = await fetch("/api/brands", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${credentials}`,
          },
          body: JSON.stringify(formData),
        });
      } else {
        showToast("Please upload a logo or enter a logo path", "error");
        setIsSubmitting(false);
        return;
      }

      if (response.ok) {
        showToast("Brand added successfully!", "success");
        setShowAddForm(false);
        setFormData({
          name: "",
          logo: "",
          website: "",
          order: 0,
          isActive: true,
        });
        fetchBrands();
      } else {
        const data = await response.json();
        showToast(data.error || "Failed to add brand", "error");
      }
    } catch (error) {
      console.error("Error adding brand:", error);
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;

    try {
      const credentials = sessionStorage.getItem("admin_credentials");
      if (!credentials) {
        showToast("Please login first", "error");
        return;
      }
      const response = await fetch(`/api/brands/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (response.ok) {
        showToast("Brand deleted successfully!", "success");
        fetchBrands();
        setSelectedBrands(new Set());
      } else {
        showToast("Failed to delete brand", "error");
      }
    } catch (error) {
      console.error("Error deleting brand:", error);
      showToast("An error occurred. Please try again.", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBrands.size === 0) {
      showToast("Please select at least one brand to delete", "error");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedBrands.size} brand(s)?`)) return;

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

      for (const id of selectedBrands) {
        try {
          const response = await fetch(`/api/brands/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Basic ${credentials}`,
            },
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Error deleting brand ${id}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        showToast(
          `Successfully deleted ${successCount} brand${successCount > 1 ? 's' : ''}${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
          successCount === selectedBrands.size ? "success" : "error"
        );
        setSelectedBrands(new Set());
        fetchBrands();
      } else {
        showToast("Failed to delete brands", "error");
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);
      showToast("An error occurred during bulk delete", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedBrands.size === filteredBrands.length) {
      setSelectedBrands(new Set());
    } else {
      setSelectedBrands(new Set(filteredBrands.map((b) => b.id)));
    }
  };

  const handleSelectBrand = (id: string) => {
    const newSelected = new Set(selectedBrands);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedBrands(newSelected);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const credentials = sessionStorage.getItem("admin_credentials");
      if (!credentials) {
        showToast("Please login first", "error");
        return;
      }
      const response = await fetch(`/api/brands/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        showToast(`Brand ${!currentStatus ? "activated" : "deactivated"} successfully!`, "success");
        fetchBrands();
      } else {
        showToast("Failed to update brand status", "error");
      }
    } catch (error) {
      console.error("Error updating brand:", error);
      showToast("An error occurred. Please try again.", "error");
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.logo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA9616] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading brands...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🏢 Brand Management</h1>
            <p className="text-gray-600">Manage client brand logos displayed on the website</p>
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
              {showAddForm ? "✕ Cancel" : "+ Add Single Brand"}
            </button>
          </div>
        </div>

        {brands.length > 0 && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="🔍 Search brands by name or logo path..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
            />
          </div>
        )}
      </div>

      {showBulkUpload && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-blue-500">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📦 Bulk Upload Brand Logos</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const files = formData.getAll("logos") as File[];

              if (files.length === 0) {
                showToast("Please select at least one logo", "error");
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

                for (let i = 0; i < files.length; i++) {
                  const file = files[i];
                  
                  if (!['image/png', 'image/webp'].includes(file.type)) {
                    errorCount++;
                    continue;
                  }

                  if (file.size > 10 * 1024 * 1024) {
                    errorCount++;
                    continue;
                  }

                  const uploadFormData = new FormData();
                  uploadFormData.append("logo", file);
                  uploadFormData.append("name", file.name.replace(/\.[^/.]+$/, ""));

                  try {
                    const response = await fetch("/api/brands", {
                      method: "POST",
                      headers: {
                        Authorization: `Basic ${credentials}`,
                      },
                      body: uploadFormData,
                    });

                    if (response.ok) {
                      successCount++;
                    } else {
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
                    `Successfully uploaded ${successCount} logo${successCount > 1 ? 's' : ''}${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
                    successCount === files.length ? "success" : "error"
                  );
                  setShowBulkUpload(false);
                  fetchBrands();
                } else {
                  showToast("Failed to upload logos. Please try again.", "error");
                }
              } catch (error) {
                console.error("Error in bulk upload:", error);
                showToast("An error occurred during bulk upload", "error");
              } finally {
                setIsBulkUploading(false);
                setBulkUploadProgress({ current: 0, total: 0 });
                (e.target as HTMLFormElement).reset();
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🖼️ Select Multiple Logos <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  name="logos"
                  accept="image/png,image/webp"
                  multiple
                  required
                  disabled={isBulkUploading}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Select multiple logos at once. PNG or WebP only. Max 10MB per logo. High quality preserved.
                </p>
              </div>
              {isBulkUploading && (
                <div className="md:col-span-2">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-blue-900">
                        Uploading logos...
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
                  : "✅ Upload All Logos"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-[#FA9616]">
          <h2 className="text-xl font-bold text-gray-900 mb-4">➕ Add New Brand</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏷️ Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Airtel"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🖼️ Upload Logo <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      (formData as any).file = file;
                      setFormData({ ...formData, logo: file.name });
                    }
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">PNG or WebP only. Max 10MB. High quality preserved.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🌐 Website (Optional)
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
                />
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
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Alternative:</strong> You can also manually enter a logo path if the logo already exists in the public folder.
                </p>
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="/Clients /Brands /Brand.png (optional if uploading file)"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-[#FA9616] border-gray-300 rounded focus:ring-[#FA9616]"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active (visible on website)
              </label>
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
                {isSubmitting ? "⏳ Adding..." : "✅ Add Brand"}
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
                Brands ({filteredBrands.length})
              </h3>
              {selectedBrands.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "⏳ Deleting..." : `🗑️ Delete Selected (${selectedBrands.size})`}
                </button>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {brands.filter((b) => b.isActive).length} Active •{" "}
              {brands.filter((b) => !b.isActive).length} Inactive
            </div>
          </div>
        </div>
        {filteredBrands.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? "No brands found" : "No brands yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by adding your first brand"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#FA9616] to-[#E8850E] text-white rounded-lg shadow-md hover:shadow-lg font-medium transition-all"
              >
                + Add First Brand
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
                      checked={selectedBrands.size === filteredBrands.length && filteredBrands.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-[#FA9616] border-gray-300 rounded focus:ring-[#FA9616]"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Logo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Brand Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Logo Path
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedBrands.has(brand.id)}
                        onChange={() => handleSelectBrand(brand.id)}
                        className="w-4 h-4 text-[#FA9616] border-gray-300 rounded focus:ring-[#FA9616]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative group">
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="h-16 w-16 object-contain bg-white p-2 rounded-lg border-2 border-gray-200 shadow-sm group-hover:shadow-md transition-shadow"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Logo%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{brand.name}</div>
                      {brand.website && (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#FA9616] hover:underline"
                        >
                          🌐 Visit Website
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-md truncate">{brand.logo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                      #{brand.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(brand.id, brand.isActive)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                          brand.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {brand.isActive ? "✅ Active" : "⏸️ Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(brand.id)}
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

