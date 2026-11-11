"use client";
import { useCallback, useEffect, useState } from "react";
import AppShell, { useUsuario } from "@/components/AppShell";
import ProdutoForm from "@/components/ProdutoForm";
import {
  excluirProduto, exportarProdutos, listarCategorias, listarProdutos, resumoProdutos,
} from "@/services/produtoService";
import { dataBR, prazo, STATUS_NOME } from "@/utils/formatar";

export default function ProdutosPage() {
  return (
    <AppShell>
      <Produtos />
    </AppShell>
  );
}

function Produtos() {
  const usuario = useUsuario();
  const admin = usuario.perfil === "admin";

  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [status, setStatus] = useState("");
  const [categoria, setCategoria] = useState("");

  const [produtos, setProdutos] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [modal, setModal] = useState(null); // null | { produto }
  const [aviso, setAviso] = useState(null);
  const [exportando, setExportando] = useState("");

  const filtros = { busca: buscaAplicada, status, categoria };

  function avisar(texto, erro = false) {
    setAviso({ texto, erro });
    setTimeout(() => setAviso(null), 3500);
  }

  // Espera o usuário parar de digitar antes de buscar
  useEffect(() => {
    const t = setTimeout(() => setBuscaAplicada(busca.trim()), 300);
    return () => clearTimeout(t);
  }, [busca]);

  const carregar = useCallback(async () => {
    try {
      const [lista, res, cats] = await Promise.all([
        listarProdutos({ busca: buscaAplicada, status, categoria }),
        resumoProdutos(),
        listarCategorias(),
      ]);
      setProdutos(lista);
      setResumo(res);
      setCategorias(cats);
    } catch (err) {
      avisar(err.message, true);
    }
  }, [buscaAplicada, status, categoria]);

  useEffect(() => { carregar(); }, [carregar]);

  async function excluir(p) {
    if (!window.confirm(`Excluir "${p.nome}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await excluirProduto(p.id);
      avisar("Produto excluído");
      carregar();
    } catch (err) {
      avisar(err.message, true);
    }
  }

  async function exportar(formato) {
    setExportando(formato);
    try {
      await exportarProdutos(formato, filtros);
    } catch (err) {
      avisar(err.message, true);
    } finally {
      setExportando("");
    }
  }

  const cards = resumo && [
    { chave: "", titulo: "Total de produtos", valor: resumo.total },
    { chave: "vencido", titulo: "Vencidos", valor: resumo.vencidos },
    { chave: "proximo", titulo: `Vencem em até ${resumo.diasAlerta} dias`, valor: resumo.proximos },
    { chave: "ok", titulo: "Dentro da validade", valor: resumo.ok },
  ];

  return (
    <>
      <div className="app-titulo">
        <div>
          <h1>Produtos</h1>
          <p>Controle de validade do estoque, ordenado pelo vencimento mais próximo.</p>
        </div>
        <div className="acoes">
          <button className="btn btn-outline" onClick={() => exportar("csv")} disabled={!!exportando}>
            <svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 19h16" /></svg>
            {exportando === "csv" ? "Gerando..." : "Exportar CSV"}
          </button>
          <button className="btn btn-outline" onClick={() => exportar("pdf")} disabled={!!exportando}>
            <svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 19h16" /></svg>
            {exportando === "pdf" ? "Gerando..." : "Exportar PDF"}
          </button>
          <button className="btn" onClick={() => setModal({ produto: null })}>
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            Cadastrar produto
          </button>
        </div>
      </div>

      {cards && (
        <div className="resumo">
          {cards.map((c) => (
            <button
              key={c.chave || "todos"}
              type="button"
              className={`resumo-card ${c.chave} ${status === c.chave ? "selecionado" : ""}`}
              onClick={() => setStatus(c.chave)}
              title="Clique para filtrar"
            >
              <span>{c.titulo}</span>
              <strong>{c.valor}</strong>
            </button>
          ))}
        </div>
      )}

      <div className="filtros">
        <input
          className="campo busca"
          type="search"
          placeholder="Buscar por nome, lote ou categoria"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar"
        />
        <select className="campo" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">Todos os status</option>
          <option value="vencido">Vencidos</option>
          <option value="proximo">Vencem em breve</option>
          <option value="ok">Dentro da validade</option>
        </select>
        <select className="campo" value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Categoria">
          <option value="">Todas as categorias</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="tabela-wrap">
        {produtos === null ? (
          <p className="carregando">Carregando produtos...</p>
        ) : produtos.length === 0 ? (
          <p className="vazio">Nenhum produto encontrado.</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th style={{ textAlign: "right" }}>Qtd.</th>
                <th>Validade</th>
                <th>Prazo</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p.id}>
                  <td className="wrap">
                    {p.nome}
                    {(p.lote || p.observacao) && (
                      <span className="sub">{[p.lote && `Lote ${p.lote}`, p.observacao].filter(Boolean).join(" · ")}</span>
                    )}
                  </td>
                  <td>{p.categoria || "—"}</td>
                  <td className="num">{p.quantidade}</td>
                  <td>{dataBR(p.data_validade)}</td>
                  <td>{prazo(p.dias_restantes)}</td>
                  <td><span className={`badge ${p.status}`}>{STATUS_NOME[p.status]}</span></td>
                  <td>
                    <div className="acoes-linha">
                      <button className="btn btn-outline btn-sm" onClick={() => setModal({ produto: p })}>Editar</button>
                      {admin && (
                        <button className="btn btn-perigo btn-sm" onClick={() => excluir(p)}>Excluir</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <ProdutoForm
          produto={modal.produto}
          categorias={categorias}
          aoFechar={() => setModal(null)}
          aoSalvar={(_, texto) => {
            setModal(null);
            avisar(texto);
            carregar();
          }}
        />
      )}

      {aviso && <div className={`aviso ${aviso.erro ? "erro" : ""}`}>{aviso.texto}</div>}
    </>
  );
}
