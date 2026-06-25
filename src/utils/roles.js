export const isSuperAdmin = (user) => user?.role === "super_admin";
export const isAdmin = (user) => user?.role === "admin";
export const canAccessAdmin = (user) => isSuperAdmin(user) || isAdmin(user);
export const hasFullAppAccess = (user) => isSuperAdmin(user);

export const adminDefaultPath = (user) =>
  isSuperAdmin(user) ? "/admin/tenants" : "/admin/user-roles";
