const authService = require("../services/authService");

async function login(req, res) {
  const { usuario, senha } = req.body || {};
  if (!usuario || !senha) {
    return res.status(400).json({ message: "Informe usuário e senha" });
  }

  const resultado = await authService.login(String(usuario).trim(), String(senha));
  if (resultado.erro) return res.status(401).json({ message: resultado.erro });
  res.json(resultado);
}

function me(req, res) {
  const { id, nome, usuario, perfil } = req.user;
  res.json({ id, nome, usuario, perfil });
}

module.exports = { login, me };
