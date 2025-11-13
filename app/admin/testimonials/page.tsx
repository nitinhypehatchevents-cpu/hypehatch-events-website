"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
  isActive: boolean;
  order: number;
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast, ToastComponent } = useToast();
  const [formData, setFormData] = useState({
    quote: "",
    author: "",
    role: "",
    company: "",
    avatar: "",
    rating: 5,
    order: 0,
    isActive: true,
  });

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/testimonials");
      const data = await response.json();
      setTestimonials(data.testimonials || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
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
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast("Testimonial added successfully!", "success");
        setShowAddForm(false);
        setFormData({
          quote: "",
          author: "",
          role: "",
          company: "",
          avatar: "",
          rating: 5,
          order: 0,
          isActive: true,
        });
        fetchTestimonials();
      } else {
        const data = await response.json();
        showToast(data.error || "Failed to add testimonial", "error");
      }
    } catch (error) {
      console.error("Error adding testimonial:", error);
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      const credentials = sessionStorage.getItem("admin_credentials");
      if (!credentials) {
        showToast("Please login first", "error");
        return;
      }
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (response.ok) {
        showToast("Testimonial deleted successfully!", "success");
        fetchTestimonials();
      } else {
        showToast("Failed to delete testimonial", "error");
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      showToast("An error occurred. Please try again.", "error");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const credentials = sessionStorage.getItem("admin_credentials");
      if (!credentials) {
        showToast("Please login first", "error");
        return;
      }
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        showToast(`Testimonial ${!currentStatus ? "activated" : "deactivated"} successfully!`, "success");
        fetchTestimonials();
      } else {
        showToast("Failed to update testimonial status", "error");
      }
    } catch (error) {
      console.error("Error updating testimonial:", error);
      showToast("An error occurred. Please try again.", "error");
    }
  };

  const filteredTestimonials = testimonials.filter((test) =>
    test.quote.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (test.company && test.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA9616] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading testimonials...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">💬 Testimonials Management</h1>
            <p className="text-gray-600">Manage client testimonials displayed on the website</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              showAddForm
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-gradient-to-r from-[#FA9616] to-[#E8850E] text-white shadow-md hover:shadow-lg transform hover:scale-105"
            }`}
          >
            {showAddForm ? "✕ Cancel" : "+ Add New Testimonial"}
          </button>
        </div>

        {testimonials.length > 0 && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="🔍 Search testimonials by quote, author, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
            />
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-[#FA9616]">
          <h2 className="text-xl font-bold text-gray-900 mb-4">➕ Add New Testimonial</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                💬 Quote <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
                placeholder="Enter the testimonial quote..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👤 Author Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  💼 Role/Title
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., CEO"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏢 Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g., TechCorp India"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ⭐ Rating (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🖼️ Avatar Path (Optional)
                </label>
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="/avatars/john.jpg"
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
                {isSubmitting ? "⏳ Adding..." : "✅ Add Testimonial"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Testimonials ({filteredTestimonials.length})
            </h3>
            <div className="text-sm text-gray-600">
              {testimonials.filter((t) => t.isActive).length} Active •{" "}
              {testimonials.filter((t) => !t.isActive).length} Inactive
            </div>
          </div>
        </div>
        {filteredTestimonials.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? "No testimonials found" : "No testimonials yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by adding your first testimonial"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#FA9616] to-[#E8850E] text-white rounded-lg shadow-md hover:shadow-lg font-medium transition-all"
              >
                + Add First Testimonial
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Quote
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Rating
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
                {filteredTestimonials.map((testimonial) => (
                  <tr key={testimonial.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {testimonial.author}
                      </div>
                      {testimonial.role && (
                        <div className="text-xs text-gray-500 mt-1">{testimonial.role}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md line-clamp-2">
                        "{testimonial.quote}"
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {testimonial.company || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {testimonial.rating ? (
                        <div className="text-lg">
                          {"⭐".repeat(testimonial.rating)}
                          <span className="text-xs text-gray-500 ml-1">({testimonial.rating}/5)</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(testimonial.id, testimonial.isActive)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                          testimonial.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {testimonial.isActive ? "✅ Active" : "⏸️ Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(testimonial.id)}
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

