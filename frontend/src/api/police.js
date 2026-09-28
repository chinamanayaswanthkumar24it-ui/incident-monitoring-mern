import api from "./client";

export const getUnits = () => api.get("/police/units").then((r) => r.data);
export const createUnit = (payload) => api.post("/police/units", payload).then((r) => r.data);
export const updateUnit = (id, payload) => api.patch(`/police/units/${id}`, payload).then((r) => r.data);
export const deleteUnit = (id) => api.delete(`/police/units/${id}`).then((r) => r.data);
