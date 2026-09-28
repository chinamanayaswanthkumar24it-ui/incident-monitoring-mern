import api from "./client";

export const getHospitals = () => api.get("/hospitals").then((r) => r.data);
export const createHospital = (payload) => api.post("/hospitals", payload).then((r) => r.data);
export const updateHospital = (id, payload) =>
  api.patch(`/hospitals/${id}`, payload).then((r) => r.data);
export const deleteHospital = (id) => api.delete(`/hospitals/${id}`).then((r) => r.data);
