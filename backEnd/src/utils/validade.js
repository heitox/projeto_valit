// Regras de status de validade usadas na listagem, no resumo e nos relatórios
const DIAS_ALERTA = Number(process.env.DIAS_ALERTA) || 7;

const STATUS = {
  vencido: "Vencido",
  proximo: "Vence em breve",
  ok: "Dentro da validade",
};

// Expressões SQL (dias restantes calculados pelo banco, com a data de hoje)
const SQL_DIAS = "DATEDIFF(p.data_validade, CURDATE())";
const SQL_STATUS = `CASE
  WHEN ${SQL_DIAS} < 0 THEN 'vencido'
  WHEN ${SQL_DIAS} <= ${DIAS_ALERTA} THEN 'proximo'
  ELSE 'ok' END`;

function dataValida(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(texto || ""))) return false;
  const d = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === texto;
}

// "2026-11-09" -> "09/11/2026"
function formatarData(texto) {
  if (!texto) return "";
  const [a, m, d] = String(texto).slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

module.exports = { DIAS_ALERTA, STATUS, SQL_DIAS, SQL_STATUS, dataValida, formatarData };
