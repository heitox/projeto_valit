const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const usuarioModel = require("../models/usuarioModel");

async function login(usuario, senha) {
  const user = await usuarioModel.buscarPorUsuario(usuario);
  if (!user) return null;

  const ok = await bcrypt.compare(senha, user.senha);
  if (!ok) return null;

  return jwt.sign({ id: user.id, usuario: user.usuario }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });
}

module.exports = { login };
