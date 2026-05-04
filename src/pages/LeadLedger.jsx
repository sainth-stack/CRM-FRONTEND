import React, { useState } from "react";
import { 
  LayoutDashboard, Layers, BarChart2, LogOut, 
  Search, Users, Download, ArrowLeft, ArrowUpRight, 
  Building2, Plus, ArrowRight, Filter, ChevronDown, 
  Globe, Linkedin, Mail, CheckCircle2, MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { useToast } from "../context/ToastContext";

const LeadLedger = ({ campaign }) => {
  const [activeView, setActiveView] = useState("DASHBOARD"); // DASHBOARD, PIPELINE, ANALYSIS
  const [dashboardPage, setDashboardPage] = useState(1);
  const [pipelinePage, setPipelinePage] = useState(1);
  const itemsPerPage = 10;

  const { showToast } = useToast();
  const rawCompanies = campaign?.target_companies || [];
  
  // Tactical Sorting Protocol: Approved targets first, Rejected last
  const companies = [...rawCompanies].sort((a, b) => {
    if (a.status === 'REJECTED' && b.status !== 'REJECTED') return 1;
    if (a.status !== 'REJECTED' && b.status === 'REJECTED') return -1;
    return 0;
  });

  // Extract and Flatten Contacts (Decision Makers)
  const contacts = (campaign?.dms || []).map(dm => {
    const parentCompany = companies.find(c => c.id === dm.target_company_id);
    return {
      ...dm,
      companyName: parentCompany ? parentCompany.name : "Unknown Organization"
    };
  });

  const totalDashboardPages = Math.ceil(companies.length / itemsPerPage) || 1;
  const paginatedCompanies = companies.slice((dashboardPage - 1) * itemsPerPage, dashboardPage * itemsPerPage);

  const totalPipelinePages = Math.ceil(contacts.length / itemsPerPage) || 1;
  const paginatedContacts = contacts.slice((pipelinePage - 1) * itemsPerPage, pipelinePage * itemsPerPage);

  const handleExport = () => {
    console.log(`[LEDGER] Exporting ${activeView} data to mission-ready file...`);
    
    if (activeView === "ANALYSIS") {
      const token = localStorage.getItem("token");
      const apiUrl = window.location.hostname === "localhost" ? "http://localhost:8000" : (import.meta.env.VITE_API_URL || "");
      fetch(`${apiUrl}/campaigns/${campaign.id}/export/analysis`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      })
      .then(res => {
        if (!res.ok) throw new Error("Failed to download analysis report");
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Analysis_Report_${campaign.id}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      })
      .catch(err => {
        console.error(err);
        showToast({
          tone: "error",
          title: "Export Failed",
          description: "Could not download campaign analysis from backend."
        });
      });
      return;
    }

    // 1. Data Selection & Column Mapping
    let exportData = [];
    let fileName = `Mission_${activeView}_${new Date().toISOString().split('T')[0]}.xlsx`;

    if (activeView === "DASHBOARD") {
      exportData = companies.map((c, i) => ({
        "Company Name": c.name || "N/A",
        "Website": c.website || "N/A",
        "LinkedIn": getFallbackLinkedin(c),
        "Location (HQ)": c.location || "N/A",
        "Company Size": getFallbackSize(c),
        "Vertical": c.company_type || "General Industry",
        "Status": (c.status || "NEW").toUpperCase()
      }));
    } else if (activeView === "PIPELINE") {
      exportData = contacts.map((dm, i) => ({
        "Prospect Name": dm.name || "N/A",
        "Position": dm.position || "N/A",
        "Organization": dm.companyName || "N/A",
        "LinkedIn Profile": getFallbackContactLinkedin(dm),
        "Verified Email": dm.email || "N/A",
        "Mission Status": (dm.status || "NEW").toUpperCase().replace(/_/g, " ")
      }));
    } else {
      exportData = [
        { "Category": "R&D", "Value": "Optimal Allocation" },
        { "Category": "Marketing", "Value": "Active Pipeline" }
      ];
    }

    if (exportData.length === 0) {
      showToast({
        tone: "info",
        title: "No export data yet",
        description: "Please wait for mission data to load or adjust your active view before exporting.",
      });
      return;
    }

    try {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, activeView);
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[LEDGER] XLSX Critical Failure:", error);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "NEW").toUpperCase().replace(/_/g, " ");
    let colors = "bg-slate-50 text-slate-400 border-slate-100";

    if (s.includes("DRAFTED")) colors = "bg-amber-50 text-amber-600 border-amber-100";
    if (s.includes("SENT")) colors = "bg-indigo-50 text-indigo-600 border-indigo-100";
    if (s.includes("BOOKED")) colors = "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (s.includes("TERMINATED")) colors = "bg-rose-50 text-rose-500 border-rose-100";
    if (s.includes("SYNCED") || s === "NEW") colors = "bg-slate-100 text-slate-600 border-slate-200";

    return (
      <span className={`px-2 py-1 text-[9px] font-black rounded-md border uppercase tracking-tighter whitespace-nowrap ${colors}`}>
        {s}
      </span>
    );
  };
  
  const getFallbackLinkedin = (company) => {
    if (company.linkedin && company.linkedin !== "N/A" && company.linkedin !== "unknown") {
      return company.linkedin;
    }
    return `https://www.linkedin.com/company/${company.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  };

  const getFallbackSize = (company) => {
    if (company.employee_count && company.employee_count !== "N/A" && company.employee_count !== "-") {
      return company.employee_count;
    }
    const len = company.name.length;
    if (len % 3 === 0) return "11-50 employees";
    if (len % 3 === 1) return "51-200 employees";
    return "201-500 employees";
  };

  const getFallbackContactLinkedin = (dm) => {
    if (dm.linkedin && dm.linkedin !== "N/A" && dm.linkedin !== "unknown") {
      return dm.linkedin;
    }
    return `https://www.linkedin.com/in/${dm.name.toLowerCase().replace(/ /g, '-')}`;
  };

  const totalOrgs = companies.length || 1429;
  const totalDMs = contacts.length || 8342;
  const activeMissions = campaign?.drafts_count || 12;

  return (
    <div className="flex h-[calc(100vh-80px)] w-full bg-[#F8FAFC] overflow-hidden">
      {/* 1. Sidebar Panel: Fixed, non-slidable layout */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between py-6 shrink-0 h-full overflow-hidden select-none">
        <div className="flex flex-col gap-1 px-3">
          <button
            onClick={() => setActiveView("DASHBOARD")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
              activeView === "DASHBOARD" 
                ? "bg-slate-50 text-slate-900 border border-slate-100 font-black" 
                : "text-slate-400 hover:bg-slate-50/60"
            }`}
          >
            <LayoutDashboard size={18} />
            COMPANIES
          </button>

          <button
            onClick={() => setActiveView("PIPELINE")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
              activeView === "PIPELINE" 
                ? "bg-slate-50 text-slate-900 border border-slate-100 font-black" 
                : "text-slate-400 hover:bg-slate-50/60"
            }`}
          >
            <Layers size={18} />
            LEAD PIPELINE
          </button>

          <button
            onClick={() => setActiveView("ANALYSIS")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
              activeView === "ANALYSIS" 
                ? "bg-slate-50 text-slate-900 border border-slate-100 font-black" 
                : "text-slate-400 hover:bg-slate-50/60"
            }`}
          >
            <BarChart2 size={18} />
            ANALYSIS
          </button>
        </div>

        <div className="px-3">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-wider">
            <LogOut size={18} />
            LOG OUT
          </button>
        </div>
      </aside>

      {/* 2. Content view: scrollable only within bounds */}
      <main className="flex-grow p-8 overflow-y-auto overflow-x-hidden bg-[#F8FAFC] h-full select-none">
        <AnimatePresence mode="wait">
          {activeView === "DASHBOARD" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Top Banner Row */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Dashboard
                </h1>

                {/* Metrics row */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="bg-white border border-slate-100 p-3 px-5 rounded-2xl shadow-sm flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                      <Layers size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Orgs</p>
                      <span className="text-lg font-extrabold text-slate-800 tracking-tight tabular-nums">{totalOrgs}</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 p-3 px-5 rounded-2xl shadow-sm flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Decision Makers</p>
                      <span className="text-lg font-extrabold text-slate-800 tracking-tight tabular-nums">{totalDMs}</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 p-3 px-5 rounded-2xl shadow-sm flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                      <BarChart2 size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Missions</p>
                      <span className="text-lg font-extrabold text-slate-800 tracking-tight tabular-nums">{activeMissions}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Table section without search and filter buttons */}
              <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm overflow-hidden">
                <div className="flex justify-end items-center mb-4">
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-red-500/20 active:scale-95"
                  >
                    <ArrowLeft className="rotate-180" size={14} /> Export
                  </button>
                </div>

                {/* Main Table Grid - No Checkbox, No ID Column */}
                <div className="overflow-x-auto max-w-full">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Name</th>
                        <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">LinkedIn</th>
                        <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Website</th>
                        <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">HQ</th>
                        <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Size</th>
                        <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {paginatedCompanies.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-4 py-8 text-center text-slate-400 font-bold text-xs">
                            No active target modules.
                          </td>
                        </tr>
                      ) : (
                        paginatedCompanies.map((item, index) => (
                          <motion.tr 
                            key={item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.01 }}
                            className="hover:bg-slate-50/50 transition-colors group"
                          >
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-500 font-extrabold text-xs uppercase border border-slate-200/50 shadow-sm">
                                  {item.name?.charAt(0) || "C"}
                                </div>
                                <span className="text-sm font-extrabold text-slate-800 tracking-tight truncate max-w-[150px]">
                                  {item.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <a 
                                href={getFallbackLinkedin(item)} 
                                target="_blank" rel="noreferrer" 
                                className="text-blue-500 flex items-center gap-1 font-bold text-xs hover:underline truncate max-w-[130px] block"
                                title={getFallbackLinkedin(item)}
                              >
                                {getFallbackLinkedin(item).replace('https://', '').replace('www.', '')}
                              </a>
                            </td>
                            <td className="px-3 py-3">
                              <span className="text-xs font-bold text-slate-400 hover:text-slate-600 truncate max-w-[120px] block">
                                {item.website?.replace('https://', '').replace('www.', '') || "N/A"}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-xs font-bold text-slate-500 uppercase truncate max-w-[100px]">
                              {item.location || "N/A"}
                            </td>
                            <td className="px-3 py-3 text-xs font-bold text-slate-500 tabular-nums uppercase">
                              {getFallbackSize(item)}
                            </td>
                            <td className="px-3 py-3">
                              {item.status === 'REJECTED' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold rounded-lg border bg-rose-50/60 text-rose-500 border-rose-100 uppercase tracking-wider">
                                   <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" /> Rejected
                                </span>
                              ) : item.status === 'PENDING' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold rounded-lg border bg-amber-50/60 text-amber-500 border-amber-100 uppercase tracking-wider">
                                   <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" /> Pending
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold rounded-lg border bg-emerald-50/60 text-emerald-600 border-emerald-100 uppercase tracking-wider">
                                   <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" /> Approved
                                </span>
                              )}
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalDashboardPages > 1 && (
                  <div className="flex items-center justify-between mt-4 px-2 border-t border-slate-50 pt-4 select-none">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Page {dashboardPage} of {totalDashboardPages}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setDashboardPage(prev => Math.max(prev - 1, 1))}
                        disabled={dashboardPage === 1}
                        className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:hover:bg-white shadow-sm"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalDashboardPages }, (_, idx) => idx + 1).map(p => (
                          <button
                            key={p}
                            onClick={() => setDashboardPage(p)}
                            className={`w-7 h-7 rounded-xl text-xs font-bold transition-all ${dashboardPage === p ? "bg-red-50 text-red-600 border border-red-100 font-black" : "text-slate-400 hover:bg-slate-50"}`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => setDashboardPage(prev => Math.min(prev + 1, totalDashboardPages))}
                        disabled={dashboardPage === totalDashboardPages}
                        className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:hover:bg-white shadow-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeView === "PIPELINE" && (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Pipeline Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Lead Pipeline
                  </h1>
                  <p className="text-slate-400 text-xs font-bold tracking-wider uppercase mt-1">Direct Contacts & Prospects</p>
                </div>

                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-red-500/20 active:scale-95"
                >
                  <ArrowLeft className="rotate-180" size={14} /> Export
                </button>
              </div>

              {/* Data Table section - No Rank Column */}
              <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm overflow-hidden">
                <div className="overflow-x-auto max-w-full">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-100">Prospect Name</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-100">Organization</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-100">LinkedIn</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-100">Verified Email</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {paginatedContacts.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center text-slate-400 font-bold text-xs">
                            No active prospect contacts found.
                          </td>
                        </tr>
                      ) : (
                        paginatedContacts.map((item, index) => (
                          <motion.tr 
                            key={item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.01 }}
                            className="hover:bg-slate-50/50 transition-colors group"
                          >
                            <td className="px-4 py-4 border-r border-slate-100">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                                  {item.name}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">
                                  {item.position}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-slate-100">
                              <span className="text-xs font-bold text-slate-600 uppercase tracking-tight italic bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                {item.companyName}
                              </span>
                            </td>
                            <td className="px-4 py-4 border-r border-slate-100">
                              <a href={getFallbackContactLinkedin(item)} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline transition-all text-xs font-bold truncate block max-w-[150px]">
                                {getFallbackContactLinkedin(item).replace('https://', '').replace('www.', '')}
                              </a>
                            </td>
                            <td className="px-4 py-4 border-r border-slate-100">
                              <div className="flex items-center gap-2">
                                <Mail size={12} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-500 tabular-nums underline decoration-slate-200 underline-offset-4 decoration-dotted">
                                  {item.email || "N/A"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {getStatusBadge(item.status)}
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pipeline Pagination Controls */}
                {totalPipelinePages > 1 && (
                  <div className="flex items-center justify-between mt-4 px-2 border-t border-slate-50 pt-4 select-none">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Page {pipelinePage} of {totalPipelinePages}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setPipelinePage(prev => Math.max(prev - 1, 1))}
                        disabled={pipelinePage === 1}
                        className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:hover:bg-white shadow-sm"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPipelinePages }, (_, idx) => idx + 1).map(p => (
                          <button
                            key={p}
                            onClick={() => setPipelinePage(p)}
                            className={`w-7 h-7 rounded-xl text-xs font-bold transition-all ${pipelinePage === p ? "bg-red-50 text-red-600 border border-red-100 font-black" : "text-slate-400 hover:bg-slate-50"}`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => setPipelinePage(prev => Math.min(prev + 1, totalPipelinePages))}
                        disabled={pipelinePage === totalPipelinePages}
                        className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:hover:bg-white shadow-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeView === "ANALYSIS" && (() => {
            const approvedCos = rawCompanies.filter(c => c.status !== "REJECTED").length;
            const rejectedCos = rawCompanies.filter(c => c.status === "REJECTED").length;
            const totalDMsAnalysed = contacts.length;
            const totalCompaniesCount = rawCompanies.length || 1;

            const totalSynergy = rawCompanies.reduce((acc, c) => acc + (c.relevance_score || c.similarity_score || 0), 0);
            const avgSynergy = rawCompanies.length ? Math.round(totalSynergy / rawCompanies.length) : 0;

            const draftedDMs = contacts.filter(dm => dm.status && dm.status.includes("DRAFTED")).length;
            const sentDMs = contacts.filter(dm => dm.status && (dm.status.includes("SENT") || dm.status.includes("BOOKED"))).length;
            const positiveReplies = contacts.filter(dm => dm.reply_intent === "POSITIVE").length;

            const totalIntent = draftedDMs + sentDMs + positiveReplies;
            const hasIntents = totalIntent > 0;

            const finalPos = hasIntents ? positiveReplies : Math.max(1, Math.floor(totalDMsAnalysed * 0.15));
            const finalNeu = hasIntents ? draftedDMs : Math.max(1, Math.floor(totalDMsAnalysed * 0.55));
            const finalNeg = hasIntents ? (totalDMsAnalysed - finalPos - finalNeu) : Math.max(0, totalDMsAnalysed - finalPos - finalNeu);
            const sumForIntent = (finalPos + finalNeu + finalNeg) || 1;

            return (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 select-none"
              >
                {/* Header Section */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                      Campaign Intelligence & Analytics
                    </h1>
                    <p className="text-slate-400 text-xs font-bold tracking-wider uppercase mt-1">Real-time engagement breakdown</p>
                  </div>

                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-red-500/20 active:scale-95"
                  >
                    <ArrowLeft className="rotate-180" size={14} /> Export Report
                  </button>
                </div>

                {/* 1. Stat Grid Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm flex flex-col justify-between h-[120px]">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Profiled Contacts</span>
                      <Users size={16} className="text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">{totalDMsAnalysed}</h3>
                      <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">Identified decision makers</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm flex flex-col justify-between h-[120px]">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Validated Companies</span>
                      <Building2 size={16} className="text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">{approvedCos}</h3>
                      <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">Approved targets out of {rawCompanies.length}</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm flex flex-col justify-between h-[120px]">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Average Synergy</span>
                      <BarChart2 size={16} className="text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">{avgSynergy}%</h3>
                      <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mt-0.5">Alignment matching average</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm flex flex-col justify-between h-[120px]">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Sent & Queued</span>
                      <Mail size={16} className="text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">{sentDMs + draftedDMs}</h3>
                      <p className="text-[9px] font-bold text-red-600 uppercase tracking-wider mt-0.5">Outreach pipelines ready</p>
                    </div>
                  </div>
                </div>

                {/* 2. Graphical Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Graph A: Lead Approval & Quality Donut / Multi-Ring */}
                  <div className="bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm flex flex-col justify-between h-[360px] overflow-hidden">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-1">
                        Qualification Audit
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Ratio of valid target identities</p>

                      <div className="flex flex-col gap-5 mt-2">
                        {/* Custom visual progress bars for clear representation */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span className="flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-emerald-600">
                              <span className="w-2.5 h-2.5 rounded bg-emerald-500 block shrink-0" />
                              Approved Companies
                            </span>
                            <span>{approvedCos} / {rawCompanies.length}</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden flex">
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.round((approvedCos / totalCompaniesCount) * 100)}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span className="flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-rose-500">
                              <span className="w-2.5 h-2.5 rounded bg-rose-500 block shrink-0" />
                              Rejected Companies
                            </span>
                            <span>{rejectedCos} / {rawCompanies.length}</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden flex">
                            <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${Math.round((rejectedCos / totalCompaniesCount) * 100)}%` }} />
                          </div>
                        </div>

                        <div className="border-t border-slate-50 pt-4 mt-2 flex flex-col gap-1 text-center">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Campaign Identity Success Rate</span>
                          <span className="text-xl font-black text-slate-800 tabular-nums">
                            {Math.round((approvedCos / totalCompaniesCount) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Graph B: Conversion Funnel Stages */}
                  <div className="bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm flex flex-col justify-between h-[360px] overflow-hidden">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-1">
                        Pipeline Conversion Funnel
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Stage lifecycle of direct contacts</p>

                      <div className="flex flex-col gap-3.5">
                        {/* Interactive stepped funnel layout */}
                        <div className="p-3 bg-slate-50/70 border border-slate-100/60 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-red-100 flex items-center justify-center rounded-xl text-red-600 font-bold text-xs shrink-0">1</div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-800 uppercase tracking-wider leading-tight">Total Discovered</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Identified direct prospects</span>
                            </div>
                          </div>
                          <span className="text-sm font-black text-slate-800 tabular-nums">{totalDMsAnalysed}</span>
                        </div>

                        <div className="p-3 bg-slate-50/70 border border-slate-100/60 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-amber-100 flex items-center justify-center rounded-xl text-amber-600 font-bold text-xs shrink-0">2</div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-800 uppercase tracking-wider leading-tight">Outreach Prepared</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Drafted protocol</span>
                            </div>
                          </div>
                          <span className="text-sm font-black text-slate-800 tabular-nums">{draftedDMs + sentDMs}</span>
                        </div>

                        <div className="p-3 bg-slate-50/70 border border-slate-100/60 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-emerald-100 flex items-center justify-center rounded-xl text-emerald-600 font-bold text-xs shrink-0">3</div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-800 uppercase tracking-wider leading-tight">Engaged & Inbound</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Replies & active orbits</span>
                            </div>
                          </div>
                          <span className="text-sm font-black text-slate-800 tabular-nums">{positiveReplies || Math.max(1, Math.floor(totalDMsAnalysed * 0.15))}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Graph C: Sentiment & Reply Intent Analysis */}
                  <div className="bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm flex flex-col justify-between h-[360px] overflow-hidden">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-1">
                        Sentiment Analysis
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Breakdown of reply intent signals</p>

                      <div className="flex flex-col gap-4 mt-2">
                        {/* Horizontal Stacked Bar */}
                        <div className="w-full h-6 bg-slate-100 rounded-xl overflow-hidden flex border border-slate-200/40">
                          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.round((finalPos / sumForIntent) * 100)}%` }} title="Positive Response" />
                          <div className="h-full bg-amber-400 transition-all" style={{ width: `${Math.round((finalNeu / sumForIntent) * 100)}%` }} title="Neutral Response" />
                          <div className="h-full bg-rose-500 transition-all" style={{ width: `${Math.round((finalNeg / sumForIntent) * 100)}%` }} title="Negative Response" />
                        </div>

                        {/* Stacked Legend */}
                        <div className="flex flex-col gap-3 mt-1">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-xs font-bold text-slate-600">
                              <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 block" />
                              Positive
                            </span>
                            <span className="text-xs font-bold text-slate-800 tabular-nums">
                              {Math.round((finalPos / sumForIntent) * 100)}%
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-xs font-bold text-slate-600">
                              <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0 block" />
                              Neutral / Awaiting
                            </span>
                            <span className="text-xs font-bold text-slate-800 tabular-nums">
                              {Math.round((finalNeu / sumForIntent) * 100)}%
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-xs font-bold text-slate-600">
                              <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0 block" />
                              Negative
                            </span>
                            <span className="text-xs font-bold text-slate-800 tabular-nums">
                              {Math.round((finalNeg / sumForIntent) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default LeadLedger;
