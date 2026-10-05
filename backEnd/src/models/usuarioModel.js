const db = require("../database/connection");

async function buscarPorUsuario(usuario) {
  const [rows] = await db.query(
    "SELECT id, usuario, senha FROM usuarios WHERE usuario = ? LIMIT 1",
    [usuario]
  );
  return rows[0];
}

module.exports = { buscarPorUsuario };
