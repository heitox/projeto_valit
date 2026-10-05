const authService = require("../services/authService");

async function login(req, res) {
  const { usuario, senha } = req.body;
  if (!usuario || !senha) {
    return res.status(400).json({ message: "Informe usuário e senha" });
  }

  try {
    const token = await authService.login(usuario, senha);
    if (!token) return res.status(401).json({ message: "Usuário ou senha inválidos" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
}

module.exports = { login };
