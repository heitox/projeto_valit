import { api } from "./api";

export const listarUsuarios = () => api("/usuarios");
export const criarUsuario = (dados) => api("/usuarios", { method: "POST", body: dados });
export const atualizarUsuario = (id, dados) => api(`/usuarios/${id}`, { method: "PUT", body: dados });
export const excluirUsuario = (id) => api(`/usuarios/${id}`, { method: "DELETE" });
