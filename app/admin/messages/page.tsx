"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const isReadParam = filter === "all" ? null : filter === "read";
      const url = `/api/contact-messages${isReadParam !== null ? `?isRead=${isReadParam}` : ""}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        showToast("Failed to load messages", "error");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      showToast("Failed to load messages", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    try {
      const response = await fetch(`/api/contact-messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead }),
      });

      if (response.ok) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, isRead } : msg))
        );
        showToast(isRead ? "Marked as read" : "Marked as unread", "success");
      } else {
        showToast("Failed to update message", "error");
      }
    } catch (error) {
      console.error("Error updating message:", error);
      showToast("Failed to update message", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const response = await fetch(`/api/contact-messages/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
        setSelectedMessages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        showToast("Message deleted", "success");
      } else {
        showToast("Failed to delete message", "error");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      showToast("Failed to delete message", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMessages.size === 0) return;
    if (!confirm(`Delete ${selectedMessages.size} message(s)?`)) return;

    try {
      const deletePromises = Array.from(selectedMessages).map((id) =>
        fetch(`/api/contact-messages/${id}`, { method: "DELETE" })
      );
      await Promise.all(deletePromises);
      setMessages((prev) => prev.filter((msg) => !selectedMessages.has(msg.id)));
      setSelectedMessages(new Set());
      showToast(`${selectedMessages.size} message(s) deleted`, "success");
    } catch (error) {
      console.error("Error deleting messages:", error);
      showToast("Failed to delete messages", "error");
    }
  };

  const handleBulkMarkAsRead = async (isRead: boolean) => {
    if (selectedMessages.size === 0) return;

    try {
      const updatePromises = Array.from(selectedMessages).map((id) =>
        fetch(`/api/contact-messages/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead }),
        })
      );
      await Promise.all(updatePromises);
      setMessages((prev) =>
        prev.map((msg) =>
          selectedMessages.has(msg.id) ? { ...msg, isRead } : msg
        )
      );
      setSelectedMessages(new Set());
      showToast(`Marked ${selectedMessages.size} message(s) as ${isRead ? "read" : "unread"}`, "success");
    } catch (error) {
      console.error("Error updating messages:", error);
      showToast("Failed to update messages", "error");
    }
  };

  const handleSelectAll = () => {
    if (selectedMessages.size === messages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(messages.map((msg) => msg.id)));
    }
  };

  const handleSelectMessage = (id: string) => {
    setSelectedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadCount = messages.filter((msg) => !msg.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA9616] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600 mt-1">
            {messages.length} total message{messages.length !== 1 ? "s" : ""}
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "all"
                ? "bg-[#FA9616] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
              filter === "unread"
                ? "bg-[#FA9616] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "read"
                ? "bg-[#FA9616] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Read
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedMessages.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-blue-700 font-medium">
            {selectedMessages.size} message{selectedMessages.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkMarkAsRead(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
            >
              Mark as Read
            </button>
            <button
              onClick={() => handleBulkMarkAsRead(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-all"
            >
              Mark as Unread
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-600">
            {filter === "unread"
              ? "No unread messages"
              : filter === "read"
              ? "No read messages"
              : "Contact form messages will appear here"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedMessages.size === messages.length && messages.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-[#FA9616] rounded focus:ring-[#FA9616]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  From
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {messages.map((message) => (
                <tr
                  key={message.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    !message.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedMessages.has(message.id)}
                      onChange={() => handleSelectMessage(message.id)}
                      className="w-4 h-4 text-[#FA9616] rounded focus:ring-[#FA9616]"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {!message.isRead && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{message.name}</div>
                        {message.subject && (
                          <div className="text-xs text-gray-500">{message.subject}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{message.email}</div>
                    {message.phone && (
                      <div className="text-xs text-gray-500">{message.phone}</div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-700 max-w-md line-clamp-2">
                      {message.message}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {formatDate(message.createdAt)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleMarkAsRead(message.id, !message.isRead)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                          message.isRead
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        }`}
                        title={message.isRead ? "Mark as unread" : "Mark as read"}
                      >
                        {message.isRead ? "✓ Read" : "Unread"}
                      </button>
                      <button
                        onClick={() => handleDelete(message.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-all"
                        title="Delete message"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


