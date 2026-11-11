const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const usuarioModel = require("../models/usuarioModel");

function gerarToken(user) {
  return jwt.sign(
    { id: user.id, usuario: user.usuario, perfil: user.perfil },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

// Retorna { token, usuario } ou { erro } quando o login não é permitido
async function login(usuario, senha) {
  const user = await usuarioModel.buscarPorUsuario(usuario);
  if (!user || !(await bcrypt.compare(senha, user.senha))) {
    return { erro: "Usuário ou senha inválidos" };
  }
  if (!user.ativo) {
    return { erro: "Usuário desativado. Procure o administrador." };
  }
  const { senha: _, ...dados } = user;
  return { token: gerarToken(user), usuario: dados };
}

module.exports = { login };
