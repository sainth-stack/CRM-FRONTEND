import API_BASE_URL from "../../config";

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function extractMessage(err) {
  if (!err) return "Something went wrong.";
  if (typeof err === "string") return err;
  const detail = err.detail ?? err.message;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
  }
  return detail || "Something went wrong.";
}

async function parseResponse(response) {
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { detail: text };
    }
  }
  if (!response.ok) {
    const error = new Error(extractMessage(data));
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function request(token, method, path, { body, params } = {}) {
  const url = `${API_BASE_URL}${path}${buildQuery(params)}`;
  const headers = { Authorization: `Bearer ${token}` };
  const options = { method, headers };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  return parseResponse(response);
}

export const adminApi = {
  extractMessage,

  listPermissions: (token) => request(token, "GET", "/admin/permissions"),

  listTenants: (token, params) =>
    request(token, "GET", "/admin/tenants", { params }).then((d) => ({
      items: d.tenants || [],
      pagination: d.pagination || {},
    })),

  createTenant: (token, body) => request(token, "POST", "/admin/tenants", { body }),
  updateTenant: (token, id, body) => request(token, "PATCH", `/admin/tenants/${id}`, { body }),
  deleteTenant: (token, id) => request(token, "DELETE", `/admin/tenants/${id}`),

  listOrganizations: (token, params) =>
    request(token, "GET", "/admin/organizations", { params }).then((d) => ({
      items: d.organizations || [],
      pagination: d.pagination || {},
    })),

  createOrganization: (token, body) => request(token, "POST", "/admin/organizations", { body }),
  updateOrganization: (token, id, body) =>
    request(token, "PATCH", `/admin/organizations/${id}`, { body }),
  deleteOrganization: (token, id) => request(token, "DELETE", `/admin/organizations/${id}`),

  listRoles: (token, params) =>
    request(token, "GET", "/admin/roles", { params }).then((d) => ({
      items: d.roles || [],
      pagination: d.pagination || {},
    })),

  createRole: (token, body) => request(token, "POST", "/admin/roles", { body }),
  updateRole: (token, id, body) => request(token, "PATCH", `/admin/roles/${id}`, { body }),
  deleteRole: (token, id) => request(token, "DELETE", `/admin/roles/${id}`),
  assignUserRole: (token, body) => request(token, "POST", "/admin/user-roles", { body }),

  listUsers: (token, params) =>
    request(token, "GET", "/admin/users", { params }).then((d) => ({
      items: d.users || [],
      pagination: d.pagination || {},
    })),

  updateUser: (token, id, body) => request(token, "PATCH", `/admin/users/${id}`, { body }),

  provisionUser: (token, email) =>
    request(token, "POST", "/auth/management/users", { body: { email } }),

  // Unified provisioner used by the admin-panel User Roles form: one call mints a
  // user/admin/super_admin in a tenant+org and triggers the onboarding email.
  provisionMember: (token, body) =>
    request(token, "POST", "/auth/management/provision", { body }),

  deleteUser: (token, id) => request(token, "DELETE", `/auth/management/users/${id}`),

  resendActivation: (token, id) =>
    request(token, "POST", `/auth/management/resend-activation/${id}`),

  // Org assets (brochures + use-cases)
  listAssets: (token, assetType) =>
    request(token, "GET", "/uploads/assets", { params: assetType ? { asset_type: assetType } : {} }).then((d) => ({
      items: d.assets || [],
    })),

  uploadBrochure: (token, file) => {
    const form = new FormData();
    form.append("file", file);
    return fetch(`${API_BASE_URL}/uploads/brochure`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }).then(async (r) => {
      const text = await r.text();
      const data = text ? JSON.parse(text) : {};
      if (!r.ok) throw new Error(extractMessage(data));
      return data;
    });
  },

  uploadUsecase: (token, file) => {
    const form = new FormData();
    form.append("file", file);
    return fetch(`${API_BASE_URL}/uploads/usecase`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }).then(async (r) => {
      const text = await r.text();
      const data = text ? JSON.parse(text) : {};
      if (!r.ok) throw new Error(extractMessage(data));
      return data;
    });
  },

  deleteAsset: (token, id) => request(token, "DELETE", `/uploads/assets/${id}`),

  reorderAssets: (token, assetType, orderedIds) =>
    request(token, "PATCH", "/uploads/assets/reorder", {
      body: { asset_type: assetType, ordered_ids: orderedIds },
    }).then((d) => ({
      items: d.assets || [],
    })),

  assetDownloadUrl: (id) => `${API_BASE_URL}/uploads/assets/${id}`,

  listSessions: (token, params) =>
    request(token, "GET", "/admin/sessions", { params }).then((d) => ({
      items: d.sessions || [],
      activeSessions: d.active_sessions ?? 0,
      pagination: d.pagination || {},
    })),

  revokeSession: (token, id) =>
    request(token, "POST", `/admin/sessions/${id}/revoke`),
};
