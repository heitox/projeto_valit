const db = require("../database/connection");

const CAMPOS_PUBLICOS = "id, nome, usuario, perfil, ativo, criado_em";

async function buscarPorUsuario(usuario) {
  const [rows] = await db.query(
    "SELECT id, nome, usuario, senha, perfil, ativo FROM usuarios WHERE usuario = ? LIMIT 1",
    [usuario]
  );
  return rows[0];
}

async function buscarPorId(id) {
  const [rows] = await db.query(`SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = ?`, [id]);
  return rows[0];
}

async function listar() {
  const [rows] = await db.query(`SELECT ${CAMPOS_PUBLICOS} FROM usuarios ORDER BY perfil, nome`);
  return rows;
}

async function criar({ nome, usuario, senhaHash, perfil }) {
  const [result] = await db.query(
    "INSERT INTO usuarios (nome, usuario, senha, perfil) VALUES (?, ?, ?, ?)",
    [nome, usuario, senhaHash, perfil]
  );
  return buscarPorId(result.insertId);
}

async function atualizar(id, { nome, perfil, ativo, senhaHash }) {
  const campos = ["nome = ?", "perfil = ?", "ativo = ?"];
  const valores = [nome, perfil, ativo ? 1 : 0];
  if (senhaHash) {
    campos.push("senha = ?");
    valores.push(senhaHash);
  }
  valores.push(id);
  await db.query(`UPDATE usuarios SET ${campos.join(", ")} WHERE id = ?`, valores);
  return buscarPorId(id);
}

async function remover(id) {
  const [result] = await db.query("DELETE FROM usuarios WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

async function contarAdminsAtivos() {
  const [[{ total }]] = await db.query(
    "SELECT COUNT(*) AS total FROM usuarios WHERE perfil = 'admin' AND ativo = 1"
  );
  return total;
}

module.exports = { buscarPorUsuario, buscarPorId, listar, criar, atualizar, remover, contarAdminsAtivos };
