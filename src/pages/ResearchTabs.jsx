import React from "react";
import { 
  FileBarChart, Target, Users, Send, Trash, ArrowLeft, Globe, Linkedin, PieChart, Bot, Search, CheckCircle2, Loader2
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
            Mission Briefing
          </button>
          <button
            onClick={() => setResearchTab("lead_pipeline")}
            className={`relative flex items-center gap-3 px-8 py-3.5 text-sm font-semibold transition-all ${researchTab === "lead_pipeline" ? "text-slate-900 bg-slate-50 font-bold" : "text-slate-500 hover:bg-slate-50"}`}
          >
            {researchTab === "lead_pipeline" && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-red-500 rounded-r-lg" />}
            <Target size={18} className={researchTab === "lead_pipeline" ? "text-red-500" : "text-slate-400"} />
            Lead Pipeline
          </button>
          <button
            onClick={() => setResearchTab("stakeholder_intel")}
            className={`relative flex items-center gap-3 px-8 py-3.5 text-sm font-semibold transition-all ${researchTab === "stakeholder_intel" ? "text-slate-900 bg-slate-50 font-bold" : "text-slate-500 hover:bg-slate-50"}`}
          >
            {researchTab === "stakeholder_intel" && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-red-500 rounded-r-lg" />}
            <Users size={18} className={researchTab === "stakeholder_intel" ? "text-red-500" : "text-slate-400"} />
            Stakeholder Intel
          </button>
          <button
            onClick={() => setResearchTab("outreach_protocol")}
            className={`relative flex items-center gap-3 px-8 py-3.5 text-sm font-semibold transition-all ${researchTab === "outreach_protocol" ? "text-slate-900 bg-slate-50 font-bold" : "text-slate-500 hover:bg-slate-50"}`}
          >
            {researchTab === "outreach_protocol" && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-red-500 rounded-r-lg" />}
            <Send size={18} className={researchTab === "outreach_protocol" ? "text-red-500" : "text-slate-400"} />
            Outreach Protocol
          </button>
          <button
            onClick={() => setResearchTab("rejected_artifacts")}
            className={`relative flex items-center gap-3 px-8 py-3.5 text-sm font-semibold transition-all ${researchTab === "rejected_artifacts" ? "text-slate-900 bg-slate-50 font-bold" : "text-slate-500 hover:bg-slate-50"}`}
          >
            {researchTab === "rejected_artifacts" && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-red-500 rounded-r-lg" />}
            <Trash size={18} className={researchTab === "rejected_artifacts" ? "text-red-500" : "text-slate-400"} />
            Rejected Artifacts
          </button>
        </div>

        <div className="px-8 flex flex-col gap-4">
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="flex items-center gap-3 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-all"
          >
            <ArrowLeft size={18} className="text-slate-400" />
            Log Out
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm h-full flex flex-col">
                <div className="flex items-center gap-2.5 mb-5">
                  <PieChart className="text-slate-400" size={18} />
                  <h3 className="text-base font-bold text-slate-900">Market Presence Analytics</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium flex-1">
                  {campaign.user_intel?.deep_research || "Conducting corporate intelligence logs..."}
                </p>
              </div>

              <div className="flex flex-col gap-8 h-full">
                <div className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm flex flex-col h-auto flex-1">
                  <div className="flex items-center gap-2.5 mb-5">
                    <Target className="text-slate-400" size={18} />
                    <h3 className="text-base font-bold text-slate-900">Core Offerings</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {campaign.user_intel?.offerings ? (
                      (() => {
                        try {
                          return JSON.parse(campaign.user_intel.offerings).map((o, idx) => (
                            <span key={idx} className="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600">
                              {o}
                            </span>
                          ));
                        } catch (e) {
                          return <p className="text-slate-400 italic">No offerings found.</p>;
                        }
                      })()
                    ) : (
                      <p className="text-slate-400 italic">No offerings found.</p>
                    )}
                    {campaign.user_intel?.core_focus && (
                      <span className="bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-lg text-xs font-bold text-red-500">
                        Core Focus: {campaign.user_intel?.core_focus}
                      </span>
                    )}
                  </div>
                </div>

                {/* Campaign Inputs Card */}
                <div className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm flex flex-col h-auto flex-1">
                  <div className="flex items-center gap-2.5 mb-5">
                    <Bot className="text-slate-400" size={18} />
                    <h3 className="text-base font-bold text-slate-900">Campaign Inputs</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Persona / Query</p>
                      <p className="text-sm font-bold text-slate-700">{campaign.query || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Industry</p>
                      <p className="text-sm font-bold text-slate-700">{campaign.target_industry || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Location</p>
                      <p className="text-sm font-bold text-slate-700">{campaign.target_location || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {researchTab === "lead_pipeline" && (
          <div className="flex flex-col gap-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-slate-900">Lead Pipeline</h2>
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
                    className="bg-white rounded-[24px] border border-slate-200 p-6 cursor-pointer hover:shadow-xl hover:shadow-slate-100 transition-all flex flex-col justify-between h-[280px]"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                          {company.name}
                        </h4>
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-500 rounded-full border border-emerald-200 text-xs font-bold whitespace-nowrap">
                          Approved
                        </span>
                      </div>

                      <p className="text-slate-500 font-medium text-sm leading-relaxed line-clamp-3">
                        {company.deep_research || "No deep research data."}
                      </p>
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
                <h2 className="text-3xl font-bold text-slate-900">Stakeholder Intel</h2>
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
                      onClick={() => setSelectedCompany(company)}
                      className="bg-white rounded-[24px] border border-slate-200 p-6 cursor-pointer hover:shadow-xl hover:shadow-slate-100 transition-all flex flex-col justify-between h-[260px]"
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
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Corporate Influence
                          </span>
                          <p className="text-slate-600 font-medium text-sm leading-relaxed line-clamp-2">
                            {dm.relevance_explanation || dm.similarity_score?.reason || "High-priority corporate decision maker."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-center pt-3 border-t border-slate-50 mt-auto">
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
                <h2 className="text-3xl font-bold text-slate-900">Outreach Protocol Development</h2>
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
                      className="bg-white rounded-[24px] border border-slate-200 p-6 cursor-pointer hover:shadow-xl hover:shadow-slate-100 transition-all flex flex-col justify-between h-[380px]"
                    >
                      <div className="flex flex-col gap-4 h-full overflow-hidden">
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
                            Narrative Snippet
                          </span>
                          <p className="text-slate-600 font-medium text-sm leading-relaxed italic line-clamp-3">
                            "{draft.body}"
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-50 mt-auto text-center shrink-0">
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
                <h2 className="text-3xl font-bold text-slate-900">Rejected Artifacts</h2>
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
                    className="bg-slate-50/50 rounded-[24px] border border-slate-200 p-6 cursor-pointer hover:shadow-xl hover:shadow-slate-100 transition-all flex flex-col justify-between h-[270px] opacity-85 hover:opacity-100 grayscale hover:grayscale-0"
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

                      <p className="text-slate-500 font-medium text-sm leading-relaxed line-clamp-3">
                        {company.deep_research || "Strategic alignment criteria not met."}
                      </p>
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
