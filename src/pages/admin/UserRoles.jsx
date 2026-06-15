import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { adminApi } from "../../lib/api/admin";
import {
  AdminPageLayout,
  AdminPanel,
  AdminBtn,
  AdminInput,
  AdminSelect,
  AdminTable,
  AdminModal,
  AdminLoading,
  AdminPagination,
  AdminSearchBar,
} from "../../components/admin/AdminShell";

const emptyForm = { name: "", organization_id: "", permissions: [] };

export default function UserRoles() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [catalog, setCatalog] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ items: rows, pagination }, orgRes, permRes] = await Promise.all([
        adminApi.listRoles(token, { page, page_size: 10, sort: "created_at", direction: "desc" }),
        adminApi.listOrganizations(token, { page: 1, page_size: 100 }),
        adminApi.listPermissions(token),
      ]);
      setItems(rows);
      setOrgs(orgRes.items || []);
      setCatalog(permRes.permissions || {});
      setTotalPages(pagination.total_pages || 1);
      setTotalRecords(pagination.total_records || rows.length);
    } catch (err) {
      showToast({ tone: "error", title: "Failed to load roles", description: adminApi.extractMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [token, page, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((r) => r.name?.toLowerCase().includes(search.toLowerCase()));

  const togglePermission = (perm) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const openAdd = () => {
    setMode("add");
    setForm({ ...emptyForm, organization_id: orgs[0]?.id || "" });
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (role) => {
    setMode("edit");
    setForm({
      name: role.name || "",
      organization_id: role.organization_id || "",
      permissions: role.permissions || [],
    });
    setEditId(role.id);
    setDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (mode === "add") {
        await adminApi.createRole(token, {
          name: form.name,
          organization_id: form.organization_id,
          permissions: form.permissions,
        });
        showToast({ tone: "success", title: "Role created" });
      } else {
        await adminApi.updateRole(token, editId, {
          name: form.name,
          permissions: form.permissions,
        });
        showToast({ tone: "success", title: "Role updated" });
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      showToast({ tone: "error", title: "Save failed", description: adminApi.extractMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this role?")) return;
    try {
      await adminApi.deleteRole(token, id);
      showToast({ tone: "success", title: "Role deleted" });
      load();
    } catch (err) {
      showToast({ tone: "error", title: "Delete failed", description: adminApi.extractMessage(err) });
    }
  };

  const orgName = (orgId) => orgs.find((o) => o.id === orgId)?.name || orgId?.slice(-6) || "—";

  return (
    <AdminPageLayout title="User Roles" subtitle="Define permission sets for organization members." user={user}>
      <AdminPanel
        title="Role Registry"
        description="Create roles and assign granular permissions."
        action={
          <AdminBtn onClick={openAdd}>
            <Plus size={16} /> Add Role
          </AdminBtn>
        }
      >
        <AdminSearchBar value={search} onChange={setSearch} placeholder="Search roles..." />
        {loading ? (
          <AdminLoading />
        ) : (
          <>
            <AdminTable
              columns={[
                { key: "name", label: "Name", render: (r) => <span className="font-bold text-slate-800">{r.name}</span> },
                { key: "org", label: "Organization", render: (r) => orgName(r.organization_id) },
                { key: "perms", label: "Permissions", render: (r) => `${(r.permissions || []).length} assigned` },
                {
                  key: "actions",
                  label: "Actions",
                  align: "right",
                  render: (r) => (
                    <div className="flex justify-end gap-2">
                      <AdminBtn variant="ghost" onClick={() => openEdit(r)}>
                        <Pencil size={14} />
                      </AdminBtn>
                      <AdminBtn variant="danger" onClick={() => handleDelete(r.id)}>
                        <Trash2 size={14} />
                      </AdminBtn>
                    </div>
                  ),
                },
              ]}
              rows={filtered.map((r) => ({ key: r.id, data: r }))}
            />
            <AdminPagination page={page} totalPages={totalPages} totalRecords={totalRecords} onPageChange={setPage} />
          </>
        )}
      </AdminPanel>

      <AdminModal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={mode === "add" ? "Add Role" : "Edit Role"}
        footer={
          <>
            <AdminBtn variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </AdminBtn>
            <AdminBtn onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </AdminBtn>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4 max-h-[60vh] overflow-y-auto">
          <AdminInput label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          {mode === "add" && (
            <AdminSelect
              label="Organization"
              value={form.organization_id}
              onChange={(e) => setForm({ ...form, organization_id: e.target.value })}
              required
            >
              <option value="">Select organization</option>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </AdminSelect>
          )}
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
              Permissions
            </span>
            <div className="space-y-3">
              {Object.entries(catalog).map(([group, perms]) => (
                <div key={group} className="border border-slate-100 rounded-2xl p-3">
                  <div className="text-xs font-bold text-slate-600 mb-2">{group}</div>
                  <div className="flex flex-wrap gap-2">
                    {perms.map((perm) => (
                      <label
                        key={perm}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer border transition-colors ${
                          form.permissions.includes(perm)
                            ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={form.permissions.includes(perm)}
                          onChange={() => togglePermission(perm)}
                        />
                        {perm}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </AdminModal>
    </AdminPageLayout>
  );
}
