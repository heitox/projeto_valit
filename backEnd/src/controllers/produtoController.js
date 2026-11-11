const produtoModel = require("../models/produtoModel");
const { DIAS_ALERTA, dataValida } = require("../utils/validade");

// Valida e normaliza o corpo da requisição. Retorna { dados } ou { erro }.
function validar(body = {}) {
  const nome = String(body.nome || "").trim();
  const categoria = String(body.categoria || "").trim();
  const lote = String(body.lote || "").trim();
  const observacao = String(body.observacao || "").trim();
  const quantidade = Number(body.quantidade);
  const data_validade = String(body.data_validade || "").slice(0, 10);

  if (!nome) return { erro: "Informe o nome do produto" };
  if (nome.length > 150) return { erro: "Nome muito longo (máx. 150 caracteres)" };
  if (categoria.length > 80) return { erro: "Categoria muito longa (máx. 80 caracteres)" };
  if (lote.length > 60) return { erro: "Lote muito longo (máx. 60 caracteres)" };
  if (observacao.length > 255) return { erro: "Observação muito longa (máx. 255 caracteres)" };
  if (!Number.isInteger(quantidade) || quantidade < 0) {
    return { erro: "A quantidade deve ser um número inteiro maior ou igual a zero" };
  }
  if (!dataValida(data_validade)) return { erro: "Informe uma data de validade válida" };

  return { dados: { nome, categoria, lote, quantidade, data_validade, observacao } };
}

async function listar(req, res) {
  const { busca, status, categoria } = req.query;
  const produtos = await produtoModel.listar({ busca, status, categoria });
  res.json(produtos);
}

async function resumo(req, res) {
  const dados = await produtoModel.resumo();
  res.json({ ...dados, diasAlerta: DIAS_ALERTA });
}

async function categorias(req, res) {
  res.json(await produtoModel.categorias());
}

async function buscar(req, res) {
  const produto = await produtoModel.buscarPorId(req.params.id);
  if (!produto) return res.status(404).json({ message: "Produto não encontrado" });
  res.json(produto);
}

async function criar(req, res) {
  const { dados, erro } = validar(req.body);
  if (erro) return res.status(400).json({ message: erro });
  const produto = await produtoModel.criar(dados, req.user.id);
  res.status(201).json(produto);
}

async function atualizar(req, res) {
  const { dados, erro } = validar(req.body);
  if (erro) return res.status(400).json({ message: erro });
  const produto = await produtoModel.atualizar(req.params.id, dados);
  if (!produto) return res.status(404).json({ message: "Produto não encontrado" });
  res.json(produto);
}

async function remover(req, res) {
  const ok = await produtoModel.remover(req.params.id);
  if (!ok) return res.status(404).json({ message: "Produto não encontrado" });
  res.status(204).end();
}

module.exports = { listar, resumo, categorias, buscar, criar, atualizar, remover };
