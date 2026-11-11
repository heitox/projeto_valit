const db = require("../database/connection");
const { SQL_DIAS, SQL_STATUS } = require("../utils/validade");

const SELECT_BASE = `
  SELECT p.id, p.nome, p.categoria, p.lote, p.quantidade, p.data_validade, p.observacao,
         p.criado_em, p.atualizado_em, u.nome AS criado_por_nome,
         ${SQL_DIAS} AS dias_restantes, ${SQL_STATUS} AS status
  FROM produtos p
  LEFT JOIN usuarios u ON u.id = p.criado_por`;

// filtros: { busca, status, categoria }
async function listar({ busca, status, categoria } = {}) {
  const where = [];
  const valores = [];
  if (busca) {
    where.push("(p.nome LIKE ? OR p.lote LIKE ? OR p.categoria LIKE ?)");
    const termo = `%${busca}%`;
    valores.push(termo, termo, termo);
  }
  if (["vencido", "proximo", "ok"].includes(status)) {
    where.push(`${SQL_STATUS} = ?`);
    valores.push(status);
  }
  if (categoria) {
    where.push("p.categoria = ?");
    valores.push(categoria);
  }
  const sql = `${SELECT_BASE} ${where.length ? "WHERE " + where.join(" AND ") : ""}
               ORDER BY p.data_validade ASC, p.nome ASC`;
  const [rows] = await db.query(sql, valores);
  return rows;
}

async function buscarPorId(id) {
  const [rows] = await db.query(`${SELECT_BASE} WHERE p.id = ?`, [id]);
  return rows[0];
}

async function criar(dados, usuarioId) {
  const [result] = await db.query(
    `INSERT INTO produtos (nome, categoria, lote, quantidade, data_validade, observacao, criado_por)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [dados.nome, dados.categoria, dados.lote, dados.quantidade, dados.data_validade, dados.observacao, usuarioId]
  );
  return buscarPorId(result.insertId);
}

async function atualizar(id, dados) {
  const [result] = await db.query(
    `UPDATE produtos SET nome = ?, categoria = ?, lote = ?, quantidade = ?, data_validade = ?, observacao = ?
     WHERE id = ?`,
    [dados.nome, dados.categoria, dados.lote, dados.quantidade, dados.data_validade, dados.observacao, id]
  );
  return result.affectedRows ? buscarPorId(id) : null;
}

async function remover(id) {
  const [result] = await db.query("DELETE FROM produtos WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

async function resumo() {
  const [[r]] = await db.query(`
    SELECT COUNT(*) AS total,
           COALESCE(SUM(${SQL_STATUS} = 'vencido'), 0) AS vencidos,
           COALESCE(SUM(${SQL_STATUS} = 'proximo'), 0) AS proximos,
           COALESCE(SUM(${SQL_STATUS} = 'ok'), 0) AS ok,
           COALESCE(SUM(p.quantidade), 0) AS unidades
    FROM produtos p`);
  return {
    total: Number(r.total),
    vencidos: Number(r.vencidos),
    proximos: Number(r.proximos),
    ok: Number(r.ok),
    unidades: Number(r.unidades),
  };
}

async function categorias() {
  const [rows] = await db.query(
    "SELECT DISTINCT categoria FROM produtos WHERE categoria <> '' ORDER BY categoria"
  );
  return rows.map((r) => r.categoria);
}

module.exports = { listar, buscarPorId, criar, atualizar, remover, resumo, categorias };
