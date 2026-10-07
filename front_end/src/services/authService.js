import { API_URL } from "./api";

export async function login(usuario, senha) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, senha }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erro ao fazer login");
  return data;
}
