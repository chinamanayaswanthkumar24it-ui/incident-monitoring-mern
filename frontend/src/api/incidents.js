import api from "./client";

export const getIncidents = (params) => api.get("/incidents", { params }).then((r) => r.data);
export const getIncidentStats = () => api.get("/incidents/stats/summary").then((r) => r.data);
export const createIncident = (payload) => api.post("/incidents", payload).then((r) => r.data);
export const updateIncident = (id, payload) =>
  api.patch(`/incidents/${id}`, payload).then((r) => r.data);
export const deleteIncident = (id) => api.delete(`/incidents/${id}`).then((r) => r.data);
