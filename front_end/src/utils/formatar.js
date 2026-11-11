// "2026-11-09" -> "09/11/2026"
export function dataBR(texto) {
  if (!texto) return "";
  const [a, m, d] = String(texto).slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

export function prazo(dias) {
  if (dias < 0) return `vencido há ${-dias} ${-dias === 1 ? "dia" : "dias"}`;
  if (dias === 0) return "vence hoje";
  if (dias === 1) return "vence amanhã";
  return `${dias} dias`;
}

export const STATUS_NOME = {
  vencido: "Vencido",
  proximo: "Vence em breve",
  ok: "Dentro da validade",
};
