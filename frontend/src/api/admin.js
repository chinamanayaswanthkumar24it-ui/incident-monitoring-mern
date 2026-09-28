import api from "./client";

export const getAdminStats = () => api.get("/admin/stats").then((r) => r.data);
export const getSystemHealth = () => api.get("/admin/health").then((r) => r.data);
export const getUsers = () => api.get("/admin/users").then((r) => r.data);
export const updateUser = (id, payload) => api.patch(`/admin/users/${id}`, payload).then((r) => r.data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`).then((r) => r.data);
