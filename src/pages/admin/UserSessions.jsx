import { useCallback, useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { adminApi } from "../../lib/api/admin";
import {
  AdminPageLayout,
  AdminPanel,
  AdminBtn,
  AdminTable,
  AdminLoading,
  AdminPagination,
  AdminBadge,
} from "../../components/admin/AdminShell";

export default function UserSessions() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [activeSessions, setActiveSessions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { items: rows, pagination, activeSessions: active } = await adminApi.listSessions(token, {
        page,
        page_size: 10,
        sort: "login_time",
        direction: "desc",
      });
      setItems(rows);
      setActiveSessions(active);
      setTotalPages(pagination.total_pages || 1);
      setTotalRecords(pagination.total_records || rows.length);
    } catch (err) {
      showToast({ tone: "error", title: "Failed to load sessions", description: adminApi.extractMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [token, page, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRevoke = async (id) => {
    if (!window.confirm("Revoke this session and terminate user tokens?")) return;
    try {
      await adminApi.revokeSession(token, id);
      showToast({ tone: "success", title: "Session revoked" });
      load();
    } catch (err) {
      showToast({ tone: "error", title: "Revoke failed", description: adminApi.extractMessage(err) });
    }
  };

  return (
    <AdminPageLayout
      title="User Sessions"
      subtitle="Audit login activity and manage active sessions."
      user={user}
    >
      <div className="mb-6 bg-white rounded-3xl border border-slate-100/80 shadow-sm p-6 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Sessions</div>
          <div className="text-3xl font-extrabold text-slate-800">{activeSessions}</div>
        </div>
      </div>

      <AdminPanel title="Session Audit Log" description="Review and revoke user login sessions.">
        {loading ? (
          <AdminLoading />
        ) : (
          <>
            <AdminTable
              columns={[
                { key: "email", label: "User", render: (r) => <span className="font-bold text-slate-800">{r.user_email}</span> },
                { key: "ip", label: "IP", render: (r) => r.ip_address || "—" },
                {
                  key: "login",
                  label: "Login",
                  render: (r) => (r.login_time ? new Date(r.login_time).toLocaleString() : "—"),
                },
                {
                  key: "duration",
                  label: "Duration",
                  render: (r) => (r.duration_minutes != null ? `${r.duration_minutes} min` : "—"),
                  align: "center",
                },
                {
                  key: "status",
                  label: "Status",
                  render: (r) => (
                    <AdminBadge tone={r.status === "active" ? "success" : "default"}>{r.status || "—"}</AdminBadge>
                  ),
                  align: "center",
                },
                {
                  key: "actions",
                  label: "Actions",
                  align: "right",
                  render: (r) =>
                    r.status === "active" ? (
                      <AdminBtn variant="danger" onClick={() => handleRevoke(r.id)}>
                        <LogOut size={14} /> Revoke
                      </AdminBtn>
                    ) : (
                      "—"
                    ),
                },
              ]}
              rows={items.map((s) => ({ key: s.id, data: s }))}
            />
            <AdminPagination page={page} totalPages={totalPages} totalRecords={totalRecords} onPageChange={setPage} />
          </>
        )}
      </AdminPanel>
    </AdminPageLayout>
  );
}
