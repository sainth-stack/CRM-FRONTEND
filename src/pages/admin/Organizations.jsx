import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { adminApi } from "../../lib/api/admin";
import { isSuperAdmin } from "../../utils/roles";
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

const emptyForm = { name: "", tenant_id: "", parent_id: "", logo_url: "", logo_name: "" };

export default function Organizations() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const superAdmin = isSuperAdmin(user);
  const [items, setItems] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [allOrgs, setAllOrgs] = useState([]); // full org list (for the parent-org dropdown)
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
      const { items: rows, pagination } = await adminApi.listOrganizations(token, {
        page,
        page_size: 10,
        sort: "created_at",
        direction: "desc",
      });
      setItems(rows);
      setTotalPages(pagination.total_pages || 1);
      setTotalRecords(pagination.total_records || rows.length);
    } catch (err) {
      showToast({ tone: "error", title: "Failed to load organizations", description: adminApi.extractMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [token, page, showToast]);

  const loadTenants = useCallback(async () => {
    if (!superAdmin) return;
    try {
      const { items } = await adminApi.listTenants(token, { page: 1, page_size: 100 });
      setTenants(items);
    } catch {
      /* optional for super admin */
    }
  }, [token, superAdmin]);

  // Load every organization (not just the current page) so the parent-org dropdown
  // can show all candidates within the selected tenant.
  const loadAllOrgs = useCallback(async () => {
    try {
      const { items } = await adminApi.listOrganizations(token, { page: 1, page_size: 100 });
      setAllOrgs(items);
    } catch {
      /* non-critical: dropdown just shows no parents */
    }
  }, [token]);

  useEffect(() => {
    load();
    loadTenants();
    loadAllOrgs();
  }, [load, loadTenants, loadAllOrgs]);

  const filtered = items.filter((o) => o.name?.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setMode("add");
    setForm({
      ...emptyForm,
      tenant_id: user?.tenant?.tenant_id || tenants[0]?.id || "",
    });
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (org) => {
    setMode("edit");
    setForm({
      name: org.name || "",
      tenant_id: org.tenant?.tenant_id || "",
      parent_id: org.parent_id || "",
      logo_url: org.logo_url || "",
      logo_name: org.logo_name || "",
    });
    setEditId(org.id);
    setDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (mode === "add") {
        await adminApi.createOrganization(token, {
          name: form.name,
          tenant_id: form.tenant_id,
          parent_id: form.parent_id || null,
          logo_url: form.logo_url || null,
          logo_name: form.logo_name || null,
        });
        showToast({ tone: "success", title: "Organization created" });
      } else {
        await adminApi.updateOrganization(token, editId, {
          name: form.name,
          parent_id: form.parent_id || null,
          logo_url: form.logo_url || null,
          logo_name: form.logo_name || null,
        });
        showToast({ tone: "success", title: "Organization updated" });
      }
      setDialogOpen(false);
      load();
      loadAllOrgs();
    } catch (err) {
      showToast({ tone: "error", title: "Save failed", description: adminApi.extractMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this organization?")) return;
    try {
      await adminApi.deleteOrganization(token, id);
      showToast({ tone: "success", title: "Organization deleted" });
      load();
    } catch (err) {
      showToast({ tone: "error", title: "Delete failed", description: adminApi.extractMessage(err) });
    }
  };

  return (
    <AdminPageLayout
      title="Organizations"
      subtitle="Manage organizational units within tenants."
      user={user}
    >
      <AdminPanel
        title="Organization Registry"
        description={superAdmin ? "Full create, edit and delete access." : "View organizations in your tenant."}
        action={
          superAdmin ? (
            <AdminBtn onClick={openAdd}>
              <Plus size={16} /> Add Organization
            </AdminBtn>
          ) : null
        }
      >
        <AdminSearchBar value={search} onChange={setSearch} placeholder="Search organizations..." />
        {loading ? (
          <AdminLoading />
        ) : (
          <>
            <AdminTable
              columns={[
                { key: "name", label: "Name", render: (r) => <span className="font-bold text-slate-800">{r.name}</span> },
                { key: "tenant", label: "Tenant", render: (r) => r.tenant?.tenant_name || "—" },
                {
                  key: "created",
                  label: "Created",
                  render: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"),
                },
                ...(superAdmin
                  ? [
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
                    ]
                  : []),
              ]}
              rows={filtered.map((o) => ({ key: o.id, data: o }))}
            />
            <AdminPagination page={page} totalPages={totalPages} totalRecords={totalRecords} onPageChange={setPage} />
          </>
        )}
      </AdminPanel>

      <AdminModal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={mode === "add" ? "Add Organization" : "Edit Organization"}
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
        <form onSubmit={handleSave} className="space-y-4">
          <AdminInput label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          {mode === "add" && (
            <AdminSelect label="Tenant" value={form.tenant_id} onChange={(e) => setForm({ ...form, tenant_id: e.target.value })} required>
              <option value="">Select tenant</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </AdminSelect>
          )}
          {/* Parent Organization — dynamic dropdown showing only orgs in the selected
              tenant. Requires a tenant first (red alert otherwise). */}
          <div>
            <AdminSelect
              label="Parent Organization"
              value={form.parent_id}
              disabled={!form.tenant_id}
              onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
            >
              <option value="">None (top-level)</option>
              {allOrgs
                .filter((o) => o.tenant?.tenant_id === form.tenant_id && o.id !== editId)
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
            </AdminSelect>
            {!form.tenant_id && (
              <p className="mt-1.5 text-sm font-medium text-red-600">
                ⚠ Select a tenant first to choose a parent organization.
              </p>
            )}
          </div>
          {/* Logo URL / Logo Name intentionally hidden — they were stored but never
              rendered anywhere in the app, so collecting them served no purpose. The DB
              columns remain; wire a real upload/render flow before bringing them back. */}
        </form>
      </AdminModal>
    </AdminPageLayout>
  );
}
