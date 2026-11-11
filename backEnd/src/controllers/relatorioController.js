// Exportação da lista de produtos em CSV (Excel) ou PDF, respeitando os filtros da tela
const path = require("path");
const PDFDocument = require("pdfkit");

const LOGO = path.join(__dirname, "..", "..", "assets", "logo.png");
const produtoModel = require("../models/produtoModel");
const { STATUS, DIAS_ALERTA, formatarData } = require("../utils/validade");

const FILTRO_TEXTO = { vencido: "Somente vencidos", proximo: "Somente que vencem em breve", ok: "Somente dentro da validade" };

function nomeArquivo(ext) {
  const hoje = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" }); // AAAA-MM-DD
  return `relatorio-validade-${hoje}.${ext}`;
}

function descreverDias(d) {
  if (d < 0) return `vencido há ${-d} dia(s)`;
  if (d === 0) return "vence hoje";
  return `${d} dia(s)`;
}

function csvCampo(valor) {
  const texto = String(valor ?? "");
  return /[";\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

function gerarCsv(res, produtos) {
  const cabecalho = ["Produto", "Categoria", "Lote", "Quantidade", "Validade", "Dias restantes", "Status", "Observação"];
  const linhas = produtos.map((p) =>
    [p.nome, p.categoria, p.lote, p.quantidade, formatarData(p.data_validade), p.dias_restantes, STATUS[p.status], p.observacao]
      .map(csvCampo)
      .join(";")
  );
  // BOM + ";" para o Excel em português abrir com acentos e colunas corretas
  const conteudo = "﻿" + [cabecalho.join(";"), ...linhas].join("\r\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${nomeArquivo("csv")}"`);
  res.send(conteudo);
}

function gerarPdf(res, produtos, filtros, usuario) {
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 36 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${nomeArquivo("pdf")}"`);
  doc.pipe(res);

  const agora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const contagem = { vencido: 0, proximo: 0, ok: 0 };
  produtos.forEach((p) => contagem[p.status]++);

  // Cabeçalho com a logo do Valit
  const xTexto = doc.page.margins.left + 62;
  try {
    doc.image(LOGO, doc.page.margins.left, doc.page.margins.top, { height: 60 });
  } catch { /* sem logo, segue só com o texto */ }
  doc.font("Helvetica-Bold").fontSize(18).text("Relatório de validade dos produtos", xTexto, doc.page.margins.top + 2);
  doc.moveDown(0.3).font("Helvetica").fontSize(10).fillColor("#444")
    .text(`Gerado em ${agora} por ${usuario.nome || usuario.usuario}`, xTexto)
    .text(`Filtro: ${FILTRO_TEXTO[filtros.status] || "Todos os produtos"}${filtros.categoria ? ` | Categoria: ${filtros.categoria}` : ""}${filtros.busca ? ` | Busca: "${filtros.busca}"` : ""}`, xTexto)
    .text(`Total: ${produtos.length} produto(s) | Vencidos: ${contagem.vencido} | Vencem em até ${DIAS_ALERTA} dias: ${contagem.proximo} | Dentro da validade: ${contagem.ok}`, xTexto);
  doc.y = Math.max(doc.y, doc.page.margins.top + 60) + 14;
  doc.fillColor("#000");

  const colunas = [
    { titulo: "Produto", largura: 200 },
    { titulo: "Categoria", largura: 100 },
    { titulo: "Lote", largura: 80 },
    { titulo: "Qtd.", largura: 50, alinhar: "right" },
    { titulo: "Validade", largura: 75 },
    { titulo: "Prazo", largura: 115 },
    { titulo: "Status", largura: 149 },
  ];
  const x0 = doc.page.margins.left;
  const larguraTotal = colunas.reduce((s, c) => s + c.largura, 0);
  const alturaLinha = 20;

  function desenharLinha(valores, y, negrito, fundo) {
    if (fundo) doc.rect(x0, y, larguraTotal, alturaLinha).fill(fundo).fillColor("#000");
    doc.font(negrito ? "Helvetica-Bold" : "Helvetica").fontSize(9);
    let x = x0;
    colunas.forEach((c, i) => {
      doc.text(String(valores[i] ?? ""), x + 4, y + 6, {
        width: c.largura - 8, align: c.alinhar || "left", lineBreak: false, ellipsis: true,
      });
      x += c.largura;
    });
  }

  let y = doc.y;
  desenharLinha(colunas.map((c) => c.titulo), y, true, "#e6e6e6");
  y += alturaLinha;

  if (produtos.length === 0) {
    doc.font("Helvetica").fontSize(10).text("Nenhum produto encontrado para este filtro.", x0, y + 8);
  }

  produtos.forEach((p, i) => {
    if (y + alturaLinha > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
      desenharLinha(colunas.map((c) => c.titulo), y, true, "#e6e6e6");
      y += alturaLinha;
    }
    const fundo = p.status === "vencido" ? "#f6dcdc" : p.status === "proximo" ? "#fbefd2" : i % 2 ? "#f7f7f7" : null;
    desenharLinha(
      [p.nome, p.categoria, p.lote, p.quantidade, formatarData(p.data_validade), descreverDias(p.dias_restantes), STATUS[p.status]],
      y, p.status === "vencido", fundo
    );
    y += alturaLinha;
  });

  doc.end();
}

async function exportarProdutos(req, res) {
  const formato = String(req.query.formato || "csv").toLowerCase();
  if (!["csv", "pdf"].includes(formato)) {
    return res.status(400).json({ message: "Formato inválido. Use csv ou pdf." });
  }
  const filtros = { busca: req.query.busca, status: req.query.status, categoria: req.query.categoria };
  const produtos = await produtoModel.listar(filtros);
  if (formato === "csv") return gerarCsv(res, produtos);
  return gerarPdf(res, produtos, filtros, req.user);
}

module.exports = { exportarProdutos };
