import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Mail } from "lucide-react";
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
  AdminBadge,
} from "../../components/admin/AdminShell";

const emptyEditForm = { email: "", is_active: true, organization_id: "", system_role: "user", role_id: "" };

export default function Users() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const superAdmin = isSuperAdmin(user);
  const [items, setItems] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [provisionOpen, setProvisionOpen] = useState(false);
  const [form, setForm] = useState(emptyEditForm);
  const [provisionEmail, setProvisionEmail] = useState("");
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ items: rows, pagination }, orgRes, roleRes] = await Promise.all([
        adminApi.listUsers(token, { page, page_size: 10, sort: "created_at", direction: "desc" }),
        adminApi.listOrganizations(token, { page: 1, page_size: 100 }),
        adminApi.listRoles(token, { page: 1, page_size: 100 }),
      ]);
      setItems(rows);
      setOrgs(orgRes.items || []);
      setRoles(roleRes.items || []);
      setTotalPages(pagination.total_pages || 1);
      setTotalRecords(pagination.total_records || rows.length);
    } catch (err) {
      showToast({ tone: "error", title: "Failed to load users", description: adminApi.extractMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [token, page, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((u) => u.email?.toLowerCase().includes(search.toLowerCase()));

  const openEdit = (u) => {
    setForm({
      email: u.email || "",
      is_active: u.is_active !== false,
      organization_id: u.organization?.organization_id || "",
      system_role: u.system_role || "user",
      role_id: u.custom_role?.id || "",
    });
    setEditId(u.id);
    setEditOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        email: form.email,
        is_active: form.is_active,
        organization_id: form.organization_id || undefined,
      };
      if (superAdmin) body.system_role = form.system_role;

      await adminApi.updateUser(token, editId, body);

      if (form.organization_id) {
        await adminApi.assignUserRole(token, {
          user_id: editId,
          organization_id: form.organization_id,
          role_id: form.role_id || null,
        });
      }

      showToast({ tone: "success", title: "User updated" });
      setEditOpen(false);
      load();
    } catch (err) {
      showToast({ tone: "error", title: "Update failed", description: adminApi.extractMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const handleProvision = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await adminApi.provisionUser(token, provisionEmail);
      showToast({
        tone: "success",
        title: "User provisioned",
        description: result.email_dispatched ? "Activation email sent." : "User created without email.",
      });
      setProvisionOpen(false);
      setProvisionEmail("");
      load();
    } catch (err) {
      showToast({ tone: "error", title: "Provision failed", description: adminApi.extractMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await adminApi.deleteUser(token, id);
      showToast({ tone: "success", title: "User deleted" });
      load();
    } catch (err) {
      showToast({ tone: "error", title: "Delete failed", description: adminApi.extractMessage(err) });
    }
  };

  const handleResend = async (id) => {
    try {
      await adminApi.resendActivation(token, id);
      showToast({ tone: "success", title: "Activation link resent" });
    } catch (err) {
      showToast({ tone: "error", title: "Resend failed", description: adminApi.extractMessage(err) });
    }
  };

  const rolesForOrg = (orgId) => roles.filter((r) => r.organization_id === orgId);

  return (
    <AdminPageLayout title="Users" subtitle="Manage identities, roles and provisioning." user={user}>
      <AdminPanel
        title="User Registry"
        description="View, edit, provision and deactivate users."
        action={
          <AdminBtn onClick={() => setProvisionOpen(true)}>
            <Plus size={16} /> Provision User
          </AdminBtn>
        }
      >
        <AdminSearchBar value={search} onChange={setSearch} placeholder="Search by email..." />
        {loading ? (
          <AdminLoading />
        ) : (
          <>
            <AdminTable
              columns={[
                { key: "email", label: "Email", render: (r) => <span className="font-bold text-slate-800">{r.email}</span> },
                { key: "role", label: "System Role", render: (r) => r.system_role },
                { key: "org", label: "Organization", render: (r) => r.organization?.organization_name || "—" },
                {
                  key: "status",
                  label: "Status",
                  render: (r) =>
                    !r.is_activated ? (
                      <AdminBadge tone="warning">Pending</AdminBadge>
                    ) : r.is_active ? (
                      <AdminBadge tone="success">Active</AdminBadge>
                    ) : (
                      <AdminBadge tone="danger">Inactive</AdminBadge>
                    ),
                },
                {
                  key: "actions",
                  label: "Actions",
                  align: "right",
                  render: (r) => (
                    <div className="flex justify-end gap-2">
                      {!r.is_activated && (
                        <AdminBtn variant="ghost" onClick={() => handleResend(r.id)} title="Resend activation">
                          <Mail size={14} />
                        </AdminBtn>
                      )}
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
              rows={filtered.map((u) => ({ key: u.id, data: u }))}
            />
            <AdminPagination page={page} totalPages={totalPages} totalRecords={totalRecords} onPageChange={setPage} />
          </>
        )}
      </AdminPanel>

      <AdminModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit User"
        footer={
          <>
            <AdminBtn variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </AdminBtn>
            <AdminBtn onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </AdminBtn>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <AdminInput label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <AdminSelect
            label="Organization"
            value={form.organization_id}
            onChange={(e) => setForm({ ...form, organization_id: e.target.value, role_id: "" })}
          >
            <option value="">None</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </AdminSelect>
          <AdminSelect
            label="Custom Role"
            value={form.role_id}
            onChange={(e) => setForm({ ...form, role_id: e.target.value })}
          >
            <option value="">None</option>
            {rolesForOrg(form.organization_id).map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </AdminSelect>
          {superAdmin && (
            <AdminSelect
              label="System Role"
              value={form.system_role}
              onChange={(e) => setForm({ ...form, system_role: e.target.value })}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
              <option value="super_admin">super_admin</option>
            </AdminSelect>
          )}
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="rounded border-slate-300"
            />
            Active
          </label>
        </form>
      </AdminModal>

      <AdminModal
        open={provisionOpen}
        onClose={() => setProvisionOpen(false)}
        title="Provision User"
        footer={
          <>
            <AdminBtn variant="secondary" onClick={() => setProvisionOpen(false)}>
              Cancel
            </AdminBtn>
            <AdminBtn onClick={handleProvision} disabled={saving}>
              {saving ? "Provisioning..." : "Provision"}
            </AdminBtn>
          </>
        }
      >
        <form onSubmit={handleProvision}>
          <AdminInput
            label="Email"
            type="email"
            value={provisionEmail}
            onChange={(e) => setProvisionEmail(e.target.value)}
            required
          />
        </form>
      </AdminModal>
    </AdminPageLayout>
  );
}
