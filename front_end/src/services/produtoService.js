import { api, baixarArquivo } from "./api";

function query(filtros = {}) {
  const p = new URLSearchParams();
  Object.entries(filtros).forEach(([k, v]) => v && p.set(k, v));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export const listarProdutos = (filtros) => api(`/produtos${query(filtros)}`);
export const resumoProdutos = () => api("/produtos/resumo");
export const listarCategorias = () => api("/produtos/categorias");
export const criarProduto = (dados) => api("/produtos", { method: "POST", body: dados });
export const atualizarProduto = (id, dados) => api(`/produtos/${id}`, { method: "PUT", body: dados });
export const excluirProduto = (id) => api(`/produtos/${id}`, { method: "DELETE" });

// formato: "csv" ou "pdf"
export const exportarProdutos = (formato, filtros) =>
  baixarArquivo(`/relatorios/produtos${query({ ...filtros, formato })}`, `relatorio-validade.${formato}`);
