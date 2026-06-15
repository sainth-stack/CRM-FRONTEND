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
  AdminTable,
  AdminModal,
  AdminLoading,
  AdminPagination,
  AdminSearchBar,
} from "../../components/admin/AdminShell";

const emptyForm = { name: "", type: "", timeout: "30" };

export default function Tenants() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
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
      const { items: rows, pagination } = await adminApi.listTenants(token, {
        page,
        page_size: 10,
        sort: "created_at",
        direction: "desc",
      });
      setItems(rows);
      setTotalPages(pagination.total_pages || 1);
      setTotalRecords(pagination.total_records || rows.length);
    } catch (err) {
      showToast({ tone: "error", title: "Failed to load tenants", description: adminApi.extractMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [token, page, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      (t.type || "").toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setMode("add");
    setForm(emptyForm);
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (tenant) => {
    setMode("edit");
    setForm({
      name: tenant.name || "",
      type: tenant.type || "",
      timeout: String(tenant.timeout ?? 30),
    });
    setEditId(tenant.id);
    setDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: form.name,
        type: form.type || null,
        timeout: form.timeout ? Number(form.timeout) : null,
      };
      if (mode === "add") {
        await adminApi.createTenant(token, body);
        showToast({ tone: "success", title: "Tenant created" });
      } else {
        await adminApi.updateTenant(token, editId, body);
        showToast({ tone: "success", title: "Tenant updated" });
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
    if (!window.confirm("Delete this tenant? Remove all organizations first.")) return;
    try {
      await adminApi.deleteTenant(token, id);
      showToast({ tone: "success", title: "Tenant deleted" });
      load();
    } catch (err) {
      showToast({ tone: "error", title: "Delete failed", description: adminApi.extractMessage(err) });
    }
  };

  return (
    <AdminPageLayout
      title="Tenants"
      subtitle="Manage multi-tenant boundaries and session policies."
      user={user}
    >
      <AdminPanel
        title="Tenant Registry"
        description="Create and manage tenant sectors."
        action={
          <AdminBtn onClick={openAdd}>
            <Plus size={16} /> Add Tenant
          </AdminBtn>
        }
      >
        <AdminSearchBar value={search} onChange={setSearch} placeholder="Search tenants..." />
        {loading ? (
          <AdminLoading />
        ) : (
          <>
            <AdminTable
              columns={[
                { key: "name", label: "Name", render: (r) => <span className="font-bold text-slate-800">{r.name}</span> },
                { key: "type", label: "Type", render: (r) => r.type || "—" },
                { key: "timeout", label: "Timeout (min)", render: (r) => r.timeout ?? "—", align: "center" },
                {
                  key: "created",
                  label: "Created",
                  render: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"),
                },
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
              rows={filtered.map((t) => ({ key: t.id, data: t }))}
            />
            <AdminPagination page={page} totalPages={totalPages} totalRecords={totalRecords} onPageChange={setPage} />
          </>
        )}
      </AdminPanel>

      <AdminModal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={mode === "add" ? "Add Tenant" : "Edit Tenant"}
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
          <AdminInput label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="e.g. customer" />
          <AdminInput label="Session Timeout (minutes)" type="number" value={form.timeout} onChange={(e) => setForm({ ...form, timeout: e.target.value })} />
        </form>
      </AdminModal>
    </AdminPageLayout>
  );
}
