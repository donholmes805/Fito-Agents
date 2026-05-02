"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";

const formatAppDate = (seconds: number) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(seconds * 1000));
};

const statuses = [
  "new", 
  "reviewing", 
  "interview_requested", 
  "interviewed", 
  "kyc_requested", 
  "approved", 
  "rejected", 
  "inactive"
];

export default function AdminSalesApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "salesApplications"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(apps);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "salesApplications", id), { status });
      if (selectedApp?.id === id) {
        setSelectedApp({ ...selectedApp, status });
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    try {
      await updateDoc(doc(db, "salesApplications", id), { adminNotes: notes });
    } catch (err) {
      console.error("Error updating notes:", err);
    }
  };

  const handleUpdateLinks = async (id: string, field: string, value: string) => {
    try {
      await updateDoc(doc(db, "salesApplications", id), { [field]: value });
    } catch (err) {
      console.error("Error updating link:", err);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-500/20 text-blue-400";
      case "reviewing": return "bg-purple-500/20 text-purple-400";
      case "interview_requested": return "bg-yellow-500/20 text-yellow-400";
      case "interviewed": return "bg-orange-500/20 text-orange-400";
      case "kyc_requested": return "bg-cyan-500/20 text-cyan-400";
      case "approved": return "bg-green-500/20 text-green-400";
      case "rejected": return "bg-red-500/20 text-red-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-on-surface">Sales Applications</h1>
          <p className="text-on-surface-variant">Review and manage potential sales partners.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full bg-surface-container border border-outline-variant rounded-xl pl-12 pr-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s.replace("_", " ").toUpperCase()}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Application List */}
        <div className="xl:col-span-2 space-y-4">
          {loading ? (
            <div className="text-center py-20 text-on-surface-variant">
              <span className="animate-spin inline-block mr-2">refresh</span> Loading...
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center text-on-surface-variant">
              No applications found matching your criteria.
            </div>
          ) : (
            filteredApps.map((app) => (
              <div 
                key={app.id} 
                onClick={() => setSelectedApp(app)}
                className={`glass-panel p-6 rounded-2xl rim-light cursor-pointer hover:bg-slate-900 transition-all border-2 ${selectedApp?.id === app.id ? "border-secondary" : "border-transparent"}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-on-surface">{app.fullName}</h3>
                    <p className="text-sm text-on-surface-variant">{app.email} • {app.phone}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(app.status)}`}>
                    {app.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex gap-6 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {app.city}, {app.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {app.createdAt?.seconds ? formatAppDate(app.createdAt.seconds) : "Just now"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Details Panel */}
        <div className="relative">
          {selectedApp ? (
            <div className="glass-panel rounded-2xl p-8 rim-light sticky top-24 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-start">
                <h2 className="font-heading text-2xl font-bold text-on-surface">Details</h2>
                <button 
                  onClick={() => setSelectedApp(null)}
                  className="text-on-surface-variant hover:text-white"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">Current Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {statuses.map(s => (
                      <button
                        key={s}
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(selectedApp.id, s)}
                        className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${selectedApp.status === s ? getStatusColor(s) + " border border-" + getStatusColor(s).split(" ")[1] : "bg-surface-container border border-outline-variant text-on-surface-variant hover:text-white"}`}
                      >
                        {s.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">LinkedIn/Web</label>
                    <a 
                      href={selectedApp.website} 
                      target="_blank" 
                      className="text-secondary text-sm hover:underline break-all block"
                    >
                      {selectedApp.website || "Not provided"}
                    </a>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">Industries</label>
                    <p className="text-on-surface text-sm">{selectedApp.industries}</p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">Sales Experience</label>
                  <p className="text-on-surface text-sm bg-surface-container-low p-4 rounded-xl border border-outline-variant leading-relaxed">
                    {selectedApp.salesExperience}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">Why Fito Agents?</label>
                  <p className="text-on-surface text-sm bg-surface-container-low p-4 rounded-xl border border-outline-variant leading-relaxed">
                    {selectedApp.reason}
                  </p>
                </div>

                <div className="flex items-center gap-3 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant">
                  <div className={`w-2 h-2 rounded-full ${selectedApp.commissionComfortable ? "bg-green-500" : "bg-red-500"}`}></div>
                  <span className="text-xs text-on-surface font-medium">
                    {selectedApp.commissionComfortable ? "Comfortable with commission" : "NOT comfortable with commission"}
                  </span>
                </div>

                <div className="space-y-4 pt-4 border-t border-outline-variant">
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">Interview Link</label>
                    <input 
                      type="url"
                      placeholder="https://meet.google.com/..."
                      defaultValue={selectedApp.interviewLink}
                      onBlur={(e) => handleUpdateLinks(selectedApp.id, "interviewLink", e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-secondary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">KYC Link</label>
                    <input 
                      type="url"
                      placeholder="https://kyc-provider.com/..."
                      defaultValue={selectedApp.kycLink}
                      onBlur={(e) => handleUpdateLinks(selectedApp.id, "kycLink", e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-secondary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">Internal Admin Notes</label>
                    <textarea 
                      rows={3}
                      placeholder="Add private notes here..."
                      defaultValue={selectedApp.adminNotes}
                      onBlur={(e) => handleUpdateNotes(selectedApp.id, e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-secondary resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                   <button 
                    onClick={() => handleUpdateStatus(selectedApp.id, "approved")}
                    className="flex-grow bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedApp.id, "rejected")}
                    className="flex-grow bg-red-900/50 hover:bg-red-800 text-red-200 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors border border-red-500/30"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-12 rim-light text-center flex flex-col items-center justify-center min-h-[400px]">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 opacity-20">person_search</span>
              <p className="text-on-surface-variant text-sm">Select an application to view details and take action.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
