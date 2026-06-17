// "User Roles" page — now the single user-provisioning surface for the admin panel.
// Replaces the old permission-set editor + the separate Users page: one form takes
// role (user/admin/super_admin) + email + tenant + organization and hits the unified
// /auth/management/provision endpoint, which creates the account and dispatches the
// onboarding email. The legacy permission-set logic is intentionally gone.
import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
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
    </AdminPageLayout>
  );
}
