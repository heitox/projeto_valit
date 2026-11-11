const jwt = require("jsonwebtoken");
const usuarioModel = require("../models/usuarioModel");

// Exige o header "Authorization: Bearer <token>".
// Confere no banco se o usuário ainda existe e está ativo, e usa o perfil atual dele.
async function autenticar(req, res, next) {
  const header = req.headers.authorization || "";
  const [tipo, token] = header.split(" ");
  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ message: "Token não informado" });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Sessão expirada ou inválida" });
  }

  try {
    const user = await usuarioModel.buscarPorId(payload.id);
    if (!user || !user.ativo) {
      return res.status(401).json({ message: "Usuário desativado ou removido" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
}

// Libera a rota só para os perfis informados, ex.: exigirPerfil("admin")
function exigirPerfil(...perfis) {
  return (req, res, next) => {
    if (!perfis.includes(req.user.perfil)) {
      return res.status(403).json({ message: "Você não tem permissão para esta ação" });
    }
    next();
  };
}

module.exports = { autenticar, exigirPerfil };
