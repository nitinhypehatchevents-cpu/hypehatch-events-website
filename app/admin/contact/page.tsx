"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";

interface AddressItem {
  city: string;
  address: string;
}

interface ContactInfo {
  phone: string;
  email: string;
  address: string; // Deprecated - kept for backward compatibility
  addresses: AddressItem[]; // Array of address objects with city and address
  website: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  youtube: string;
  whatsapp: string;
}

export default function AdminContact() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast, ToastComponent } = useToast();
  const [formData, setFormData] = useState<ContactInfo>({
    phone: "",
    email: "",
    address: "", // Deprecated
    addresses: [{ city: "", address: "" }], // Start with one empty address object
    website: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    youtube: "",
    whatsapp: "",
  });

  const fetchContactInfo = async () => {
    try {
      const response = await fetch("/api/contact");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Handle addresses array, fallback to single address for backward compatibility
      let addresses: AddressItem[] = [];
      if (data.addresses && Array.isArray(data.addresses) && data.addresses.length > 0) {
        // Check if it's old format (string[]) or new format (object[])
        if (typeof data.addresses[0] === 'string') {
          // Old format: convert to new format
          addresses = data.addresses.map((addr: string) => ({ city: "", address: addr }));
        } else {
          // New format: array of objects
          addresses = data.addresses;
        }
      } else if (data.address) {
        addresses = [{ city: "", address: data.address }];
      } else {
        addresses = [{ city: "", address: "" }]; // Start with one empty object
      }

      setFormData({
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "", // Keep for backward compatibility
        addresses: addresses,
        website: data.website || "",
        facebook: data.facebook || "",
        instagram: data.instagram || "",
        linkedin: data.linkedin || "",
        twitter: data.twitter || "",
        youtube: data.youtube || "",
        whatsapp: data.whatsapp || "",
      });
    } catch (error) {
      console.error("Error fetching contact info:", error);
      showToast("Failed to load contact information", "error");
      // Set default empty data on error
      setFormData({
        phone: "",
        email: "",
        address: "",
        addresses: [{ city: "", address: "" }],
        website: "",
        facebook: "",
        instagram: "",
        linkedin: "",
        twitter: "",
        youtube: "",
        whatsapp: "",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const credentials = sessionStorage.getItem("admin_credentials");
      if (!credentials) {
        showToast("Please login first", "error");
        setSaving(false);
        return;
      }

      const response = await fetch("/api/contact", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast("Contact information updated successfully!", "success");
        fetchContactInfo();
      } else {
        const data = await response.json();
        const errorMessage = data.error || "Failed to update contact information";
        const details = data.details ? ` (${data.details})` : "";
        console.error("Update failed:", data);
        showToast(`${errorMessage}${details}`, "error");
      }
    } catch (error) {
      console.error("Error updating contact info:", error);
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA9616] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {ToastComponent}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📞 Contact Information</h1>
          <p className="text-gray-600">Manage company contact details displayed on the website</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📱 Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ✉️ Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@hypehatchevents.com"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
              />
            </div>

            {/* Addresses */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📍 Addresses
              </label>
              <div className="space-y-4">
                {formData.addresses.map((addrItem, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-gray-700">
                        Address {index + 1}
                      </span>
                      {formData.addresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newAddresses = formData.addresses.filter((_, i) => i !== index);
                            setFormData({ ...formData, addresses: newAddresses });
                          }}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium"
                          title="Remove address"
                        >
                          🗑️ Remove
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          🏙️ City Name
                        </label>
                        <input
                          type="text"
                          value={addrItem.city}
                          onChange={(e) => {
                            const newAddresses = [...formData.addresses];
                            newAddresses[index] = { ...newAddresses[index], city: e.target.value };
                            setFormData({ ...formData, addresses: newAddresses });
                          }}
                          placeholder="e.g., Mumbai"
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          📍 Address
                        </label>
                        <textarea
                          value={addrItem.address}
                          onChange={(e) => {
                            const newAddresses = [...formData.addresses];
                            newAddresses[index] = { ...newAddresses[index], address: e.target.value };
                            setFormData({ ...formData, addresses: newAddresses });
                          }}
                          placeholder="e.g., 123 Event Street, Maharashtra 400001, India"
                          rows={2}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, addresses: [...formData.addresses, { city: "", address: "" }] });
                  }}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-[#FA9616] hover:text-[#FA9616] transition-all font-medium"
                >
                  ➕ Add Another Address
                </button>
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🌐 Website URL
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="www.hypehatchevents.com or https://hypehatchevents.com"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">You can enter simple addresses like "www.example.com" - https:// will be added automatically</p>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                💬 WhatsApp
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
              />
            </div>

            {/* Social Media Section */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                📱 Social Media Links
              </h3>
            </div>

            {/* Facebook */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="text-blue-600">📘</span> Facebook
              </label>
              <input
                type="text"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                placeholder="facebook.com/hypehatchevents or https://facebook.com/hypehatchevents"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="text-pink-600">📷</span> Instagram
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="instagram.com/hypehatchevents or https://instagram.com/hypehatchevents"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="text-blue-700">💼</span> LinkedIn
              </label>
              <input
                type="text"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="linkedin.com/company/hypehatchevents or https://linkedin.com/company/hypehatchevents"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
              />
            </div>

            {/* Twitter/X */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="text-blue-400">🐦</span> Twitter/X
              </label>
              <input
                type="text"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                placeholder="twitter.com/hypehatchevents or https://twitter.com/hypehatchevents"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
              />
            </div>

            {/* YouTube */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="text-red-600">📺</span> YouTube
              </label>
              <input
                type="text"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                placeholder="youtube.com/@hypehatchevents or https://youtube.com/@hypehatchevents"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA9616] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={fetchContactInfo}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all"
            >
              🔄 Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-[#FA9616] to-[#E8850E] text-white rounded-lg shadow-md hover:shadow-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "⏳ Saving..." : "✅ Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

