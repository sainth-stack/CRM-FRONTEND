import React from "react";
import { 
  FileBarChart, Target, Users, Send, Trash, ArrowLeft, Globe, Linkedin, PieChart, Bot, Search, CheckCircle2, Loader2, ShieldCheck
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../config";

const ensureAbsoluteUrl = (url) => {
  if (!url || url === "#" || url === "N/A") return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

const ResearchTabs = ({
  campaign,
  researchTab,
  setResearchTab,
  setSelectedCompany,
  setSelectedDraft,
  setDraftEditData,
  setActiveTab
}) => {
  const handleExport = (type, filenameExt) => {
    const token = localStorage.getItem("token");
    axios.get(`${API_BASE_URL}/campaigns/${campaign.id}/export/${type}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      responseType: "blob"
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}-${campaign.id}.${filenameExt}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }).catch(err => alert("Failed to export: " + (err.response?.data?.detail || err.message)));
  };

  return (
    <div className="flex bg-[#f8fafc] h-full overflow-hidden">
      {/* Sidebar section */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between py-8 shrink-0">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setResearchTab("mission_briefing")}
            className={`relative flex items-center gap-3 px-8 py-3.5 text-sm font-semibold transition-all ${researchTab === "mission_briefing" ? "text-slate-900 bg-slate-50 font-bold" : "text-slate-500 hover:bg-slate-50"}`}
          >
            {researchTab === "mission_briefing" && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-red-500 rounded-r-lg" />}
            <FileBarChart size={18} className={researchTab === "mission_briefing" ? "text-red-500" : "text-slate-400"} />
            Briefing
          </button>
          <button
            onClick={() => setResearchTab("lead_pipeline")}
            className={`relative flex items-center gap-3 px-8 py-3.5 text-sm font-semibold transition-all ${researchTab === "lead_pipeline" ? "text-slate-900 bg-slate-50 font-bold" : "text-slate-500 hover:bg-slate-50"}`}
          >
            {researchTab === "lead_pipeline" && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-red-500 rounded-r-lg" />}
            <Target size={18} className={researchTab === "lead_pipeline" ? "text-red-500" : "text-slate-400"} />
            Targets
          </button>
          <button
            onClick={() => setResearchTab("stakeholder_intel")}
            className={`relative flex items-center gap-3 px-8 py-3.5 text-sm font-semibold transition-all ${researchTab === "stakeholder_intel" ? "text-slate-900 bg-slate-50 font-bold" : "text-slate-500 hover:bg-slate-50"}`}
          >
            {researchTab === "stakeholder_intel" && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-red-500 rounded-r-lg" />}
            <Users size={18} className={researchTab === "stakeholder_intel" ? "text-red-500" : "text-slate-400"} />
            Contacts
          </button>
          <button
            onClick={() => setResearchTab("outreach_protocol")}
            className={`relative flex items-center gap-3 px-8 py-3.5 text-sm font-semibold transition-all ${researchTab === "outreach_protocol" ? "text-slate-900 bg-slate-50 font-bold" : "text-slate-500 hover:bg-slate-50"}`}
          >
            {researchTab === "outreach_protocol" && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-red-500 rounded-r-lg" />}
            <Send size={18} className={researchTab === "outreach_protocol" ? "text-red-500" : "text-slate-400"} />
            Drafts
          </button>
          <button
            onClick={() => setResearchTab("rejected_artifacts")}
            className={`relative flex items-center gap-3 px-8 py-3.5 text-sm font-semibold transition-all ${researchTab === "rejected_artifacts" ? "text-slate-900 bg-slate-50 font-bold" : "text-slate-500 hover:bg-slate-50"}`}
          >
            {researchTab === "rejected_artifacts" && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-red-500 rounded-r-lg" />}
            <Trash size={18} className={researchTab === "rejected_artifacts" ? "text-red-500" : "text-slate-400"} />
            Disqualified
          </button>
        </div>


      </div>

      {/* Content area */}
      <div className="flex-grow p-10 overflow-y-auto h-full">
        {researchTab === "mission_briefing" && (
          <div className="flex flex-col gap-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-slate-900">
                  {campaign.user_intel?.company_name || "Company Profile"}
                </h2>
                <p className="text-sm text-slate-400 font-medium">
                  Analytical identity breakdown and strategic market posture
                </p>
              </div>

              <button
                onClick={() => handleExport("mission-briefing", "md")}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-red-500/10"
              >
                <ArrowLeft className="rotate-180" size={16} /> Export
              </button>
            </div>
            
            {/* Mission Context Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <Search size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Target Criteria</p>
                  <p className="text-sm font-bold text-slate-700">
                    {[campaign.target_industry, campaign.target_location].filter(Boolean).join(" • ") || "N/A"}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                  <Bot size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Strategic Intent (Prompt)</p>
                  <p className="text-sm font-bold text-slate-700">{campaign.prompt || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Card 1: Company Summary - Full Width Row */}
            <div className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm flex flex-col">
              <div className="flex items-center gap-2.5 mb-5">
                <PieChart className="text-slate-400" size={18} />
                <h3 className="text-base font-bold text-slate-900">Company Intelligence Summary</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium flex-1">
                {campaign.user_intel?.company_summary || campaign.user_intel?.deep_research || "Conducting corporate intelligence logs..."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Card 2: Core Offerings & Industries */}
              <div className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm flex flex-col h-full">
                <div className="flex items-center gap-2.5 mb-5">
                  <Target className="text-slate-400" size={18} />
                  <h3 className="text-base font-bold text-slate-900">Services & Market Footprint</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Core Services</p>
                    <div className="flex flex-wrap gap-2">
                      {(typeof campaign.user_intel?.offerings === 'string' ? JSON.parse(campaign.user_intel.offerings || '[]') : campaign.user_intel?.offerings || []).map((s, i) => (
                        <span key={i} className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-[10px] font-semibold text-slate-600">{s}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Customer Profiles</p>
                    <div className="flex flex-wrap gap-2">
                      {(campaign.user_intel?.target_customers || []).map((ind, i) => (
                        <span key={i} className="bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg text-[10px] font-semibold text-emerald-600">{ind}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Competitive Edge & Tone */}
              <div className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm flex flex-col h-full">
                <div className="flex items-center gap-2.5 mb-5">
                  <ShieldCheck className="text-slate-400" size={18} />
                  <h3 className="text-base font-bold text-slate-900">Strategic Posture</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Brand Mission</p>
                    <p className="text-sm font-bold text-slate-700">{campaign.user_intel?.motto || "High-Fidelity Outreach Operation"}</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Competitive Advantages</p>
                    <ul className="space-y-2">
                      {(campaign.user_intel?.competitive_advantages || []).slice(0, 4).map((adv, i) => (
                        <li key={i} className="text-xs font-bold text-slate-600 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0" />
                          {adv}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Proof Points & Pains Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Card 4: Proof Points */}
               <div className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5">
                  <CheckCircle2 className="text-emerald-500" size={18} />
                  <h3 className="text-base font-bold text-slate-900">Validation & Proof Points</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {(campaign.user_intel?.proof_points || []).map((point, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
                        <CheckCircle2 size={14} />
                      </div>
                      <p className="text-xs font-bold text-slate-700">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 5: Capability-to-Pain Strategy */}
              <div className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5">
                  <Users className="text-rose-500" size={18} />
                  <h3 className="text-base font-bold text-slate-900">Surgical Pain-Map Intelligence</h3>
                </div>
                <div className="space-y-4">
                  {(campaign.user_intel?.capability_to_pain_map || []).slice(0, 3).map((item, i) => (
                    <div key={i} className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                      <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Target Pain</p>
                      <p className="text-xs font-bold text-slate-800 mb-2">{item.pain}</p>
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Strategy</p>
                      <p className="text-[10px] font-medium text-slate-600 italic">{item.solution}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {researchTab === "lead_pipeline" && (
          <div className="flex flex-col gap-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-slate-900">Targets</h2>
                <p className="text-sm text-slate-400 font-medium">
                  Approved corporate intelligence artifacts for target organizations
                </p>
              </div>

              <button
                onClick={() => handleExport("lead-pipeline", "csv")}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-red-500/10"
              >
                <ArrowLeft className="rotate-180" size={16} /> Export
              </button>
            </div>

            {campaign.target_companies?.filter(co => co.status !== 'REJECTED').length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4 bg-slate-50 rounded-[24px] border border-dashed border-slate-200">
                <Loader2 size={32} className="text-red-500 animate-spin" />
                <p className="text-slate-400 font-bold text-sm tracking-wide">Looking for lead artifacts...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaign.target_companies?.filter(co => co.status !== 'REJECTED').map((company) => (
                  <div
                    key={company.id}
                    onClick={() => setSelectedCompany(company)}
                    className="bg-white rounded-[24px] border border-slate-200 p-6 cursor-pointer hover:shadow-xl hover:shadow-slate-100 transition-all flex flex-col justify-between min-h-[280px] h-full"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="text-lg font-bold text-slate-900 tracking-tight leading-snug min-w-0 break-words flex-1">
                          {company.name}
                        </h4>
                        <span className={`shrink-0 px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                          company.status === 'RESEARCHED' ? 'bg-surgical-navy text-white border-surgical-navy' : 'bg-blue-50 text-surgical-cobalt border-blue-200'
                        }`}>
                          {company.status === 'RESEARCHED' ? 'Deep Dossier' : 'Accepted'}
                        </span>
                      </div>

                      <div className="space-y-3">
                         <div className="p-3 bg-slate-50 rounded-xl border border-surgical-border">
                            <p className="text-[9px] font-black text-surgical-navy uppercase tracking-widest mb-1">AI Reasoning</p>
                            <p className="text-[11px] font-bold text-slate-700 line-clamp-3 italic leading-relaxed">
                               "{company.relevance_explanation || "Strategic match based on industry alignment and capabilities."}"
                            </p>
                         </div>
                         {company.research_summary && (
                            <div className="p-3 bg-white rounded-xl border border-surgical-border shadow-sm">
                               <p className="text-[9px] font-black text-surgical-cobalt uppercase tracking-widest mb-1">Deep Intelligence</p>
                               <p className="text-[10px] font-bold text-slate-600 line-clamp-2">
                                  {company.research_summary}
                               </p>
                            </div>
                         )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 mt-auto pt-4">
                      <div className="grid grid-cols-2 gap-3">
                        <a
                          href={ensureAbsoluteUrl(company.website)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-semibold text-xs transition-all"
                        >
                          <Globe size={14} /> Website
                        </a>
                        <a
                          href={ensureAbsoluteUrl(company.linkedin)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-semibold text-xs transition-all"
                        >
                          <Linkedin size={14} /> LinkedIn
                        </a>
                      </div>

                      <button className="text-center font-bold text-red-500 text-sm hover:text-red-600 transition-colors flex items-center justify-center gap-1">
                        Show More →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {researchTab === "stakeholder_intel" && (
          <div className="flex flex-col gap-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-slate-900">Contacts</h2>
                <p className="text-sm text-slate-400 font-medium">
                  Analyzing key decision-makers and their corporate influence
                </p>
              </div>

              <button
                onClick={() => handleExport("stakeholders", "csv")}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-red-500/10"
              >
                <ArrowLeft className="rotate-180" size={16} /> Export
              </button>
            </div>

            {campaign.dms?.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4 bg-slate-50 rounded-[24px] border border-dashed border-slate-200">
                <Loader2 size={32} className="text-red-500 animate-spin" />
                <p className="text-slate-400 font-bold text-sm tracking-wide">Identifying high-value stakeholders...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaign.dms?.map((dm) => {
                  const company = campaign.target_companies?.find(c => c.id === dm.target_company_id);
                  return (
                    <div
                      key={dm.id}
                      className="bg-white rounded-[24px] border border-slate-200 p-6 flex flex-col justify-between min-h-[300px] h-full"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-base border border-slate-200 shrink-0">
                            {dm.name ? dm.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "S"}
                          </div>
                          <div className="flex flex-col">
                            <h4 className="text-base font-bold text-slate-900 leading-tight">
                              {dm.name}
                            </h4>
                            <p className="text-xs font-semibold text-slate-400 leading-tight">
                              {dm.position || "Decision Maker"}, {company?.name || "Target Company"}
                            </p>
                            {dm.email && (
                              <p className="text-xs font-medium text-slate-500 mt-0.5 select-all">
                                {dm.email} {dm.is_email_verified && <span className="text-emerald-500 font-bold ml-1 text-[10px] uppercase">✓ Verified</span>}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                              Persona Fit
                            </span>
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{Math.round(dm.relevance_score || 0)}%</span>
                          </div>
                          <p className="text-slate-600 font-bold text-xs leading-relaxed line-clamp-3 italic">
                            "{dm.relevance_explanation || "Strategic decision-maker match."}"
                          </p>
                        </div>

                        {/* Tenure Intelligence Well */}
                        <div className="grid grid-cols-2 gap-4 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 shrink-0">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">Role Tenure</span>
                            <span className="text-xs font-bold text-slate-700 truncate mt-1">
                              {dm.time_in_role && dm.time_in_role !== "N/A" ? dm.time_in_role : "N/A"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">Company Tenure</span>
                            <span className="text-xs font-bold text-slate-700 truncate mt-1">
                              {dm.time_at_company && dm.time_at_company !== "N/A" ? dm.time_at_company : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center pt-3 border-t border-slate-50 mt-4">
                        <a
                          href={ensureAbsoluteUrl(dm.linkedin)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center gap-2 py-2 w-full bg-[#0077b5] hover:bg-[#005c8a] text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-blue-500/10"
                        >
                          <Linkedin size={14} /> LinkedIn
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {researchTab === "outreach_protocol" && (
          <div className="flex flex-col gap-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-slate-900">Drafts</h2>
                <p className="text-sm text-slate-400 font-medium">
                  Strategic engagement modules for key decision-makers
                </p>
              </div>

              <button
                onClick={() => handleExport("outreach-protocols", "csv")}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-red-500/10"
              >
                <ArrowLeft className="rotate-180" size={16} /> Export
              </button>
            </div>

            {campaign.drafts?.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4 bg-slate-50 rounded-[24px] border border-dashed border-slate-200">
                <Loader2 size={32} className="text-red-500 animate-spin" />
                <p className="text-slate-400 font-bold text-sm tracking-wide">Generating personalized outreach protocols...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaign.drafts?.map((draft) => {
                  const dm = campaign.dms?.find(d => d.id === draft.decision_maker_id);
                  const company = campaign.target_companies?.find(c => c.id === dm?.target_company_id);
                  return (
                    <div
                      key={draft.id}
                      onClick={() => {
                        setActiveTab("monitor");
                        const email = dm?.email || `${dm?.name.toLowerCase().replace(/ /g, ".")}@${company?.website?.replace(/(https?:\/\/|www\.|\/)/g, "")}`;
                        setDraftEditData({ subject: draft.subject, body: draft.body, email: email });
                        setSelectedDraft(draft);
                      }}
                      className="bg-white rounded-[24px] border border-slate-200 p-6 cursor-pointer hover:shadow-xl hover:shadow-slate-100 transition-all flex flex-col justify-between min-h-[300px] h-full"
                    >
                      <div className="flex flex-col gap-3 h-full overflow-hidden">
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-base border border-slate-200 shrink-0">
                            {dm?.name ? dm.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "S"}
                          </div>
                          <div className="flex flex-col">
                            <h4 className="text-base font-bold text-slate-900 leading-tight">
                              {dm?.name || "Decision Maker"}
                            </h4>
                            <p className="text-xs font-semibold text-slate-400 leading-tight">
                              {dm?.position || "Head of Department"}, {company?.name || "Target"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 shrink-0">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Engagement Subject Line
                          </span>
                          <p className="text-slate-900 font-bold text-sm tracking-tight line-clamp-1">
                            {draft.subject}
                          </p>
                        </div>

                        <div className="flex flex-col gap-1 flex-grow overflow-hidden">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Draft Content
                          </span>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex-grow mt-0.5 max-h-[120px] overflow-y-auto custom-scrollbar">
                            <p className="text-slate-600 font-medium text-xs leading-relaxed whitespace-pre-wrap">
                              {draft.body}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-50 mt-4 text-center shrink-0">
                        <button className="font-bold text-red-500 text-sm hover:text-red-600 transition-colors inline-flex items-center justify-center gap-1">
                          Review Engagement Protocol →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {researchTab === "rejected_artifacts" && (
          <div className="flex flex-col gap-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-slate-900">Disqualified</h2>
                <p className="text-sm text-slate-400 font-medium">
                  Organizations that did not meet the strategic alignment criteria
                </p>
              </div>

              <button
                onClick={() => handleExport("rejected-artifacts", "csv")}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-red-500/10"
              >
                <ArrowLeft className="rotate-180" size={16} /> Export
              </button>
            </div>

            {campaign.target_companies?.filter(co => co.status === 'REJECTED').length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4 bg-slate-50 rounded-[24px] border border-dashed border-slate-200">
                <CheckCircle2 size={32} className="text-emerald-500" />
                <p className="text-slate-400 font-bold text-sm tracking-wide">No rejected artifacts found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaign.target_companies?.filter(co => co.status === 'REJECTED').map((company) => (
                  <div
                    key={company.id}
                    className="bg-slate-50/50 rounded-[24px] border border-slate-200 p-6 cursor-pointer hover:shadow-xl hover:shadow-slate-100 transition-all flex flex-col justify-between min-h-[270px] h-full opacity-85 hover:opacity-100 grayscale hover:grayscale-0"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="text-lg font-bold text-slate-400 tracking-tight leading-snug">
                          {company.name}
                        </h4>
                        <span className="px-2.5 py-0.5 bg-red-50 text-red-500 rounded-full border border-red-200 text-xs font-bold whitespace-nowrap">
                          Rejected
                        </span>
                      </div>

                      <div className="p-4 bg-red-50/30 rounded-xl border border-red-100/50">
                        <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Disqualification Logic</p>
                        <p className="text-slate-500 font-bold text-xs leading-relaxed italic">
                          "{company.relevance_explanation || "Structural mismatch identified during ICP audit."}"
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 mt-auto pt-4">
                      <div className="grid grid-cols-2 gap-3">
                        <a
                          href={ensureAbsoluteUrl(company.website)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-xl text-slate-500 font-semibold text-xs transition-all"
                        >
                          <Globe size={14} /> Website
                        </a>
                        <a
                          href={ensureAbsoluteUrl(company.linkedin)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 rounded-xl text-slate-500 font-semibold text-xs transition-all"
                        >
                          <Linkedin size={14} /> LinkedIn
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchTabs;
