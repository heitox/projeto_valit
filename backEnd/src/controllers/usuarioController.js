// Gestão de funcionários: somente administradores
const bcrypt = require("bcryptjs");
const usuarioModel = require("../models/usuarioModel");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PERFIS = ["admin", "funcionario"];

async function listar(req, res) {
  res.json(await usuarioModel.listar());
}

async function criar(req, res) {
  const nome = String(req.body?.nome || "").trim();
  const usuario = String(req.body?.usuario || "").trim().toLowerCase();
  const senha = String(req.body?.senha || "");
  const perfil = req.body?.perfil || "funcionario";

  if (!nome) return res.status(400).json({ message: "Informe o nome" });
  if (!EMAIL_REGEX.test(usuario)) return res.status(400).json({ message: "E-mail inválido" });
  if (senha.length < 6) return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres" });
  if (!PERFIS.includes(perfil)) return res.status(400).json({ message: "Perfil inválido" });

  if (await usuarioModel.buscarPorUsuario(usuario)) {
    return res.status(409).json({ message: "Este e-mail já está cadastrado" });
  }
  const novo = await usuarioModel.criar({ nome, usuario, senhaHash: await bcrypt.hash(senha, 10), perfil });
  res.status(201).json(novo);
}

async function atualizar(req, res) {
  const id = Number(req.params.id);
  const atual = await usuarioModel.buscarPorId(id);
  if (!atual) return res.status(404).json({ message: "Usuário não encontrado" });

  const nome = String(req.body?.nome ?? atual.nome).trim();
  const perfil = req.body?.perfil ?? atual.perfil;
  const ativo = req.body?.ativo === undefined ? Boolean(atual.ativo) : Boolean(req.body.ativo);
  const senha = req.body?.senha ? String(req.body.senha) : "";

  if (!nome) return res.status(400).json({ message: "Informe o nome" });
  if (!PERFIS.includes(perfil)) return res.status(400).json({ message: "Perfil inválido" });
  if (senha && senha.length < 6) {
    return res.status(400).json({ message: "A nova senha deve ter pelo menos 6 caracteres" });
  }

  // Nunca deixa o sistema sem um administrador ativo
  const deixaDeSerAdminAtivo = atual.perfil === "admin" && atual.ativo && (perfil !== "admin" || !ativo);
  if (deixaDeSerAdminAtivo && (await usuarioModel.contarAdminsAtivos()) <= 1) {
    return res.status(400).json({ message: "É preciso manter pelo menos um administrador ativo" });
  }
  if (id === req.user.id && (perfil !== "admin" || !ativo)) {
    return res.status(400).json({ message: "Você não pode remover o seu próprio acesso de administrador" });
  }

  const senhaHash = senha ? await bcrypt.hash(senha, 10) : null;
  res.json(await usuarioModel.atualizar(id, { nome, perfil, ativo, senhaHash }));
}

async function remover(req, res) {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ message: "Você não pode excluir a sua própria conta" });

  const atual = await usuarioModel.buscarPorId(id);
  if (!atual) return res.status(404).json({ message: "Usuário não encontrado" });
  if (atual.perfil === "admin" && atual.ativo && (await usuarioModel.contarAdminsAtivos()) <= 1) {
    return res.status(400).json({ message: "É preciso manter pelo menos um administrador ativo" });
  }
  await usuarioModel.remover(id);
  res.status(204).end();
}

module.exports = { listar, criar, atualizar, remover };
