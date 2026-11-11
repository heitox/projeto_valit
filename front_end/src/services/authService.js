import { api } from "./api";

export async function login(usuario, senha) {
  const dados = await api("/auth/login", { method: "POST", body: { usuario, senha }, auth: false });
  localStorage.setItem("token", dados.token);
  localStorage.setItem("usuario", JSON.stringify(dados.usuario));
  return dados;
}

export function buscarUsuarioLogado() {
  return api("/auth/me");
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}
