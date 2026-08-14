// File Path: src/app/admin/subscribers/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { 
  Users, Search, X, ChevronLeft, ChevronRight, Layers, 
  Send, CheckSquare, Square, Loader2, Bold, Italic, Link as LinkIcon
} from "lucide-react";
import { useDebounce } from "use-debounce";

// =================================================================
// 🎨 UI STORY: "The Subscribers & Newsletter Hub"
// =================================================================
export default function SubscribersPage() {
  // 🗄️ Data States
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCount, setActiveCount] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);

  // 📄 Pagination & Limits
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // 🔍 Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 300);

  // 🖱️ Selection States (Checkboxes)
  const [selectedEmails, setSelectedEmails] = useState([]);

  // 📧 Email Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState(""); 
  const [emailLink, setEmailLink] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Textarea reference for inserting formatting tags
  const textareaRef = useRef(null);

  // 📡 FETCH SUBSCRIBERS
  const fetchSubscribers = async (currentPage, currentLimit) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/subscribers?page=${currentPage}&limit=${currentLimit}`);
      const result = await res.json();
      
      if (result.success) {
        setSubscribers(result.data.subscribers);
        setActiveCount(result.data.activeSubscribers);
        setTotalDocs(result.data.totalSubscribers);
        setTotalPages(result.pagination.totalPages);
        setPage(result.pagination.page);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Subscribers load nahi ho sake!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers(page, limit);
  }, [page, limit]);

  // 🖱️ SELECTION LOGIC
  const handleSelectAll = () => {
    if (selectedEmails.length === subscribers.length) {
      setSelectedEmails([]); 
    } else {
      setSelectedEmails(subscribers.map(sub => sub.email)); 
    }
  };

  const handleSelectOne = (email) => {
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter(e => e !== email));
    } else {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  // 🗑️ RESET MODAL FORM (Jab Cancel ho)
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEmailSubject("");
    setEmailMessage("");
    setEmailLink("");
  };

  // 🔠 FORMATTING HELPER FOR TEXTAREA
  const insertFormatting = (tagStart, tagEnd) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const replacement = `${tagStart}${selectedText || "text"}${tagEnd}`;
    setEmailMessage(text.substring(0, start) + replacement + text.substring(end));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagStart.length, end + tagStart.length);
    }, 0);
  };

  // 🚀 SEND EMAIL HANDLER
  const handleSendEmail = async () => {
    if (!emailSubject || !emailMessage) {
      return toast.error("Subject aur Message dono likhna zaroori hai!");
    }

    setIsSending(true);
    const toastId = toast.loading("Email campaign bheji ja rahi hai... 🚀");

    try {
      const formattedHtmlMessage = emailMessage.replace(/\n/g, '<br>');

      const payload = {
        subject: emailSubject,
        message: formattedHtmlMessage,
        productLink: emailLink || "#",
        selectedEmails: selectedEmails 
      };

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message, { id: toastId });
        handleCloseModal(); // 🌟 Auto clear form on success
        setSelectedEmails([]); 
      } else {
        toast.error(data.error, { id: toastId });
      }
    } catch (error) {
      toast.error("Email bhejne mein fail ho gaye.", { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  // 🛠️ Dynamic Pagination Number Generator (1, 2, 3 ... 10)
  const renderPagination = () => {
    let pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        pages = [1, 2, 3, 4, 5, '...', totalPages - 1, totalPages];
      } else if (page >= totalPages - 3) {
        pages = [1, 2, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, '...', page - 1, page, page + 1, '...', totalPages];
      }
    }

    return pages.map((p, index) => {
      if (p === '...') {
        return (
          <button 
            key={index} 
            onClick={() => {
              const jumpTo = prompt(`Enter page number (1 to ${totalPages}):`);
              if (jumpTo && !isNaN(jumpTo) && jumpTo > 0 && jumpTo <= totalPages) setPage(Number(jumpTo));
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-sage-light hover:bg-cream hover:text-sage-dark transition-colors font-medium text-sm"
          >
            ...
          </button>
        );
      }
      return (
        <button
          key={index}
          onClick={() => setPage(p)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-sm transition-all ${
            page === p ? 'bg-sage text-white shadow-sm' : 'text-sage-dark hover:bg-cream border border-transparent hover:border-cream-dark'
          }`}
        >
          {p}
        </button>
      );
    });
  };

  const displayedSubscribers = debouncedSearch 
    ? subscribers.filter(s => s.email.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : subscribers;

  const startItem = totalDocs === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalDocs);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 🟢 TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-dark pb-5">
        <div>
          <h1 className="text-2xl font-bold text-sage-dark flex items-center gap-2">
            <Users size={28} className="text-sage" /> Subscribers Management
          </h1>
          <p className="text-sm text-sage-light mt-1">
            Total <span className="font-bold text-sage-dark">{totalDocs}</span> subscribers mein se <span className="font-bold text-green-500">{activeCount}</span> Active hain.
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-sage hover:bg-sage-dark text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm"
        >
          <Send size={18} />
          {selectedEmails.length > 0 ? `Send Email to ${selectedEmails.length} Selected` : "Send Email to ALL Active"}
        </button>
      </div>

      {/* 🟢 CONTROLS BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-cream-dark shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-cream/50 border border-cream-dark rounded-xl focus-within:ring-2 focus-within:ring-sage transition-all">
            <Search size={18} className="text-sage-light" />
            <input 
              type="text"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none text-sage-dark placeholder-sage-light text-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-sage-light hover:text-red-500">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-sm text-sage-light flex items-center gap-1">
            <Layers size={16} /> Show:
          </span>
          <select 
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="bg-cream/50 border border-cream-dark text-sage-dark text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage"
          >
            {[10, 20, 50, 100].map(num => (
              <option key={num} value={num}>{num} rows</option>
            ))}
          </select>
        </div>
      </div>

      {/* 🟢 TABLE */}
      <div className="bg-white border border-cream-dark rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-cream border-b border-cream-dark text-sage-dark text-sm">
                <th className="px-6 py-4 font-semibold w-12">
                  <button onClick={handleSelectAll} className="text-sage hover:text-sage-dark">
                    {selectedEmails.length > 0 && selectedEmails.length === displayedSubscribers.length ? (
                      <CheckSquare size={20} />
                    ) : (
                      <Square size={20} className="text-sage-light" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 font-semibold">Email Address</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Subscribed Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="p-10 text-center text-sage-light animate-pulse">Loading subscribers...</td></tr>
              ) : displayedSubscribers.length > 0 ? (
                displayedSubscribers.map((sub) => (
                  <tr key={sub._id} className={`border-b border-cream-dark/50 hover:bg-cream/30 transition-colors ${selectedEmails.includes(sub.email) ? "bg-sage/5" : ""}`}>
                    <td className="px-6 py-4">
                      <button onClick={() => handleSelectOne(sub.email)} className="text-sage">
                        {selectedEmails.includes(sub.email) ? <CheckSquare size={20} /> : <Square size={20} className="text-sage-light" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-medium text-sage-dark">{sub.email}</td>
                    <td className="px-6 py-4">
                      {sub.isActive ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">Active</span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">Unsubscribed</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sage-light text-sm text-right">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="p-10 text-center text-sage-light">No subscribers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🟢 PAGINATION NUMBERS */}
        {!searchQuery && totalDocs > 0 && (
          <div className="p-4 border-t border-cream-dark flex flex-col sm:flex-row items-center justify-between gap-4 bg-cream/30">
            <div className="text-sm text-sage-light text-center sm:text-left">
              Showing <span className="font-semibold text-sage-dark">{startItem}</span> to <span className="font-semibold text-sage-dark">{endItem}</span> of <span className="font-semibold text-sage-dark">{totalDocs}</span> subscribers
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-cream-dark rounded-lg text-sage-dark hover:bg-cream disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex items-center gap-1">
                {renderPagination()}
              </div>

              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-cream-dark rounded-lg text-sage-dark hover:bg-cream disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🟢 EMAIL COMPOSER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 flex items-center justify-between border-b border-cream-dark bg-cream/30">
              <div>
                <h2 className="text-xl font-bold text-sage-dark flex items-center gap-2">
                  <Send size={20} className="text-sage" /> Compose Newsletter
                </h2>
                <p className="text-xs text-sage-light mt-1">
                  {selectedEmails.length > 0 ? `Sending to ${selectedEmails.length} selected users.` : "Sending to ALL active subscribers."}
                </p>
              </div>
              <button onClick={handleCloseModal} className="text-sage-light hover:text-red-500 transition-colors p-1 rounded-md">
                <X size={24} />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-sage-dark mb-1">Email Subject *</label>
                <input 
                  type="text" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g. Exclusive Amazon Deals Just For You!" 
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-dark focus:ring-2 focus:ring-sage focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-dark mb-1">Product Link (Call-to-Action)</label>
                <input 
                  type="url" 
                  value={emailLink}
                  onChange={(e) => setEmailLink(e.target.value)}
                  placeholder="https://amazon.com/dp/..." 
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-dark focus:ring-2 focus:ring-sage focus:outline-none" 
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-sage-dark">Email Message Body *</label>
                  <div className="flex items-center gap-1 bg-cream border border-cream-dark rounded-lg p-1">
                    <button type="button" onClick={() => insertFormatting("<strong>", "</strong>")} title="Bold" className="p-1.5 hover:bg-white rounded text-sage-dark"><Bold size={14} /></button>
                    <button type="button" onClick={() => insertFormatting("<em>", "</em>")} title="Italic" className="p-1.5 hover:bg-white rounded text-sage-dark"><Italic size={14} /></button>
                    <button type="button" onClick={() => insertFormatting("<a href='#' style='color: #059669;'>", "</a>")} title="Link" className="p-1.5 hover:bg-white rounded text-sage-dark"><LinkIcon size={14} /></button>
                  </div>
                </div>

                <textarea 
                  ref={textareaRef}
                  rows={6}
                  value={emailMessage} 
                  onChange={(e) => setEmailMessage(e.target.value)} 
                  placeholder="Write your email message here... (You can use HTML tags or the formatting buttons above)"
                  className="w-full px-4 py-3 rounded-xl border border-cream-dark focus:ring-2 focus:ring-sage focus:outline-none text-sm resize-none font-sans"
                />
              </div>
            </div>

            <div className="p-5 border-t border-cream-dark bg-cream/30 flex items-center justify-end gap-3">
              <button 
                onClick={handleCloseModal}
                className="px-5 py-2.5 text-sm font-medium text-sage-dark hover:bg-cream-dark rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendEmail}
                disabled={isSending}
                className="flex items-center gap-2 bg-sage hover:bg-sage-dark text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-70"
              >
                {isSending ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <><Send size={18} /> Send Campaign</>}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}