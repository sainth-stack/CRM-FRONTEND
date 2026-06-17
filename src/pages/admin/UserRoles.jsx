// "User Roles" page — now the single user-provisioning surface for the admin panel.
// Replaces the old permission-set editor + the separate Users page: one form takes
// role (user/admin/super_admin) + email + tenant + organization and hits the unified
// /auth/management/provision endpoint, which creates the account and dispatches the
// onboarding email. The legacy permission-set logic is intentionally gone.
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

const emptyForm = { system_role: "user", email: "", tenant_id: "", organization_id: "" };

const ROLE_LABEL = { user: "User", admin: "Admin", super_admin: "Super Admin" };

export default function UserRoles() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const superAdmin = isSuperAdmin(user);

  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Edit modal — separate state from the Add modal so the two flows don't trample.
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ system_role: "user", organization_id: "", is_active: true });
  const [updating, setUpdating] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { items, pagination } = await adminApi.listUsers(token, {
        page, page_size: 10, sort: "created_at", direction: "desc",
      });
      setUsers(items);
      setTotalPages(pagination.total_pages || 1);
      setTotalRecords(pagination.total_records || items.length);
    } catch (err) {
      showToast({ tone: "error", title: "Failed to load users", description: adminApi.extractMessage(err) });
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
      /* admins won't see the tenants list — that's fine, they live in their own tenant */
    }
  }, [token, superAdmin]);

  const loadOrgs = useCallback(async () => {
    try {
      const { items } = await adminApi.listOrganizations(token, { page: 1, page_size: 100 });
      setOrgs(items);
    } catch {
      /* non-critical: the org dropdown just stays empty */
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
    loadTenants();
    loadOrgs();
  }, [loadUsers, loadTenants, loadOrgs]);

  // Roles the current actor is allowed to mint (matches backend guard):
  //   * super_admin -> user / admin / super_admin
  //   * admin       -> user only
  const allowedRoles = superAdmin
    ? [["user", "User"], ["admin", "Admin"], ["super_admin", "Super Admin"]]
    : [["user", "User"]];

  const openAdd = () => {
    setForm({
      ...emptyForm,
      // Admins live in their own tenant — preselect it and they can't change it.
      tenant_id: superAdmin ? "" : (user?.tenant?.tenant_id || ""),
    });
    setDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.email || !form.tenant_id || !form.organization_id) {
      showToast({ tone: "error", title: "Missing fields", description: "Email, tenant and organization are required." });
      return;
    }
    setSaving(true);
    try {
      const res = await adminApi.provisionMember(token, {
        email: form.email,
        system_role: form.system_role,
        tenant_id: form.tenant_id,
        organization_id: form.organization_id,
      });
      showToast({
        tone: "success",
        title: `${ROLE_LABEL[form.system_role] || "User"} created`,
        description: res?.email_dispatched ? "Onboarding email sent." : "Created (onboarding email not dispatched).",
      });
      setDialogOpen(false);
      loadUsers();
    } catch (err) {
      showToast({ tone: "error", title: "Provision failed", description: adminApi.extractMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  // Filter the org dropdown to the chosen tenant (same UX as Organizations page).
  // For non-super-admins the tenant is pinned, so this still does the right thing.
  const orgsForTenant = orgs.filter((o) => !form.tenant_id || o.tenant?.tenant_id === form.tenant_id);

  // ---- Edit member -----------------------------------------------------------
  // Reuses PATCH /admin/users/{id}. The org dropdown stays inside the user's
  // current tenant (the backend rejects cross-tenant org moves). system_role can
  // only be changed by a super admin (the backend enforces this too).
  const openEdit = (member) => {
    setEditingUser(member);
    setEditForm({
      system_role: member.system_role || "user",
      organization_id: member.organization?.organization_id || "",
      is_active: member.is_active !== false,
    });
    setEditDialogOpen(true);
  };

  // Org options for the editing user — scoped to that user's tenant (admins only
  // see their own tenant's orgs anyway, but this guards super admins too).
  const editingUserTenantId = editingUser?.tenant?.tenant_id || null;
  const orgsForEditingUser = orgs.filter(
    (o) => !editingUserTenantId || o.tenant?.tenant_id === editingUserTenantId,
  );

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setUpdating(true);
    try {
      // Only send fields that actually changed — keeps the audit log honest and
      // avoids spurious revoke_sessions calls server-side.
      const body = {};
      if (editForm.organization_id && editForm.organization_id !== editingUser.organization?.organization_id) {
        body.organization_id = editForm.organization_id;
      }
      if (editForm.is_active !== (editingUser.is_active !== false)) {
        body.is_active = editForm.is_active;
      }
      if (superAdmin && editForm.system_role && editForm.system_role !== editingUser.system_role) {
        body.system_role = editForm.system_role;
      }
      if (Object.keys(body).length === 0) {
        showToast({ tone: "info", title: "Nothing to update" });
        setEditDialogOpen(false);
        return;
      }
      await adminApi.updateUser(token, editingUser.id, body);
      showToast({ tone: "success", title: "Member updated" });
      setEditDialogOpen(false);
      loadUsers();
    } catch (err) {
      showToast({ tone: "error", title: "Update failed", description: adminApi.extractMessage(err) });
    } finally {
      setUpdating(false);
    }
  };

  // ---- Delete member ---------------------------------------------------------
  const handleDelete = async (member) => {
    if (member.id === user?.id) {
      showToast({ tone: "error", title: "Cannot delete yourself" });
      return;
    }
    if (!window.confirm(`Delete ${member.email}? This cannot be undone.`)) return;
    try {
      await adminApi.deleteUser(token, member.id);
      showToast({ tone: "success", title: "Member deleted" });
      loadUsers();
    } catch (err) {
      showToast({ tone: "error", title: "Delete failed", description: adminApi.extractMessage(err) });
    }
  };

  const filtered = users.filter((u) => u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminPageLayout
      title="User Roles"
      subtitle="Provision users, admins and super admins, and place them in an organization."
      user={user}
    >
      <AdminPanel
        title="Members"
        description="Each provisioned member receives a one-time onboarding email to set their password."
        action={
          <AdminBtn onClick={openAdd}>
            <Plus size={16} /> Add Member
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
                { key: "role", label: "Role", render: (r) => ROLE_LABEL[r.system_role] || r.system_role || "—" },
                { key: "org", label: "Organization", render: (r) => r.organization?.organization_name || "—" },
                {
                  key: "status",
                  label: "Status",
                  render: (r) =>
                    r.is_active === false ? (
                      <span className="text-red-600 text-xs font-bold">DISABLED</span>
                    ) : (
                      <span className="text-emerald-600 text-xs font-bold">ACTIVE</span>
                    ),
                },
                {
                  key: "actions",
                  label: "Actions",
                  align: "right",
                  render: (r) => {
                    const isSelf = r.id === user?.id;
                    return (
                      <div className="flex justify-end gap-2">
                        <AdminBtn variant="ghost" onClick={() => openEdit(r)} title="Edit member">
                          <Pencil size={14} />
                        </AdminBtn>
                        <AdminBtn
                          variant="danger"
                          onClick={() => handleDelete(r)}
                          disabled={isSelf}
                          title={isSelf ? "You can't delete yourself" : "Delete member"}
                        >
                          <Trash2 size={14} />
                        </AdminBtn>
                      </div>
                    );
                  },
                },
              ]}
              rows={filtered.map((u) => ({ key: u.id, data: u }))}
            />
            <AdminPagination page={page} totalPages={totalPages} totalRecords={totalRecords} onPageChange={setPage} />
          </>
        )}
      </AdminPanel>

      <AdminModal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Add Member"
        footer={
          <>
            <AdminBtn variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</AdminBtn>
            <AdminBtn onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </AdminBtn>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Role — defaults to "user"; super-admin sees all three options. */}
          <AdminSelect
            label="Role"
            value={form.system_role}
            onChange={(e) => setForm({ ...form, system_role: e.target.value })}
            required
          >
            {allowedRoles.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </AdminSelect>

          <AdminInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="person@company.com"
            required
          />

          {/* Tenant — super-admins choose, others are pinned to their own tenant. */}
          {superAdmin ? (
            <AdminSelect
              label="Tenant"
              value={form.tenant_id}
              onChange={(e) => setForm({ ...form, tenant_id: e.target.value, organization_id: "" })}
              required
            >
              <option value="">Select tenant</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </AdminSelect>
          ) : (
            <AdminInput label="Tenant" value={user?.tenant?.tenant_name || "—"} disabled />
          )}

          {/* Organization — dynamic, tenant-scoped, with red alert when tenant unset. */}
          <div>
            <AdminSelect
              label="Organization"
              value={form.organization_id}
              disabled={!form.tenant_id}
              onChange={(e) => setForm({ ...form, organization_id: e.target.value })}
              required
            >
              <option value="">Select organization</option>
              {orgsForTenant.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </AdminSelect>
            {!form.tenant_id && (
              <p className="mt-1.5 text-sm font-medium text-red-600">
                ⚠ Select a tenant first to choose an organization.
              </p>
            )}
          </div>
        </form>
      </AdminModal>

      {/* Edit member modal — change role (super-admin only), organization, status. */}
      <AdminModal
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        title={editingUser ? `Edit ${editingUser.email}` : "Edit Member"}
        footer={
          <>
            <AdminBtn variant="secondary" onClick={() => setEditDialogOpen(false)}>Cancel</AdminBtn>
            <AdminBtn onClick={handleUpdate} disabled={updating}>
              {updating ? "Saving..." : "Save"}
            </AdminBtn>
          </>
        }
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          {/* Role — only super admins may change it (backend also enforces this). */}
          <AdminSelect
            label="Role"
            value={editForm.system_role}
            onChange={(e) => setEditForm({ ...editForm, system_role: e.target.value })}
            disabled={!superAdmin}
          >
            {allowedRoles.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </AdminSelect>

          {/* Organization — scoped to the user's own tenant; backend rejects cross-tenant moves. */}
          <AdminSelect
            label="Organization"
            value={editForm.organization_id}
            onChange={(e) => setEditForm({ ...editForm, organization_id: e.target.value })}
            required
          >
            <option value="">Select organization</option>
            {orgsForEditingUser.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </AdminSelect>

          {/* Status — disable/re-enable the account. Disabling also revokes sessions server-side. */}
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={editForm.is_active}
              onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
            />
            Account active
          </label>
        </form>
      </AdminModal>
    </AdminPageLayout>
  );
}
