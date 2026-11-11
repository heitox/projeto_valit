export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3309/api";

export function getToken() {
  try { return localStorage.getItem("token"); } catch { return null; }
}

function headersAuth(extra = {}) {
  const token = getToken();
  return { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra };
}

// Sessão expirada/inválida: limpa e volta para o login
function sessaoExpirada() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  } catch {}
  if (typeof window !== "undefined" && window.location.pathname !== "/") window.location.href = "/";
}

async function chamar(path, options = {}) {
  try {
    return await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new Error("Não foi possível conectar ao servidor. O backend está rodando?");
  }
}

// Requisição JSON. Exemplo: api("/produtos", { method: "POST", body: {...} })
export async function api(path, { method = "GET", body, auth = true } = {}) {
  const res = await chamar(path, {
    method,
    headers: auth ? headersAuth({ "Content-Type": "application/json" }) : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && auth) sessaoExpirada();
    const err = new Error(data.message || "Erro na requisição");
    err.status = res.status;
    throw err;
  }
  return data;
}

// Baixa um arquivo (CSV/PDF) com autenticação e oferece para salvar
export async function baixarArquivo(path, nomePadrao) {
  const res = await chamar(path, { headers: headersAuth() });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) sessaoExpirada();
    throw new Error(data.message || "Erro ao gerar o arquivo");
  }
  const disp = res.headers.get("Content-Disposition") || "";
  const nome = /filename="?([^"]+)"?/.exec(disp)?.[1] || nomePadrao;
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
