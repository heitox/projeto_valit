"use client";
import { useState } from "react";
import Modal from "./Modal";
import { atualizarProduto, criarProduto } from "@/services/produtoService";

const VAZIO = { nome: "", categoria: "", lote: "", quantidade: "", data_validade: "", observacao: "" };

// Cadastro e edição de produto. produto = null para cadastrar um novo.
export default function ProdutoForm({ produto, categorias, aoFechar, aoSalvar }) {
  const [dados, setDados] = useState(
    produto ? { ...VAZIO, ...produto, data_validade: String(produto.data_validade).slice(0, 10) } : VAZIO
  );
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const mudar = (campo) => (e) => setDados({ ...dados, [campo]: e.target.value });

  async function salvar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    const corpo = { ...dados, quantidade: Number(dados.quantidade) };
    try {
      const salvo = produto ? await atualizarProduto(produto.id, corpo) : await criarProduto(corpo);
      aoSalvar(salvo, produto ? "Produto atualizado" : "Produto cadastrado");
    } catch (err) {
      setErro(err.message);
      setSalvando(false);
    }
  }

  return (
    <Modal titulo={produto ? "Editar produto" : "Cadastrar produto"} aoFechar={aoFechar}>
      <form onSubmit={salvar}>
        <div className="form-grid">
          <label className="rotulo inteiro">
            Nome do produto *
            <input className="campo" value={dados.nome} onChange={mudar("nome")} maxLength={150} required autoFocus />
          </label>
          <label className="rotulo">
            Categoria
            <input className="campo" list="lista-categorias" value={dados.categoria} onChange={mudar("categoria")} maxLength={80} placeholder="Ex.: Laticínios" />
            <datalist id="lista-categorias">
              {categorias.map((c) => <option key={c} value={c} />)}
            </datalist>
          </label>
          <label className="rotulo">
            Lote
            <input className="campo" value={dados.lote} onChange={mudar("lote")} maxLength={60} />
          </label>
          <label className="rotulo">
            Quantidade *
            <input className="campo" type="number" min="0" step="1" value={dados.quantidade} onChange={mudar("quantidade")} required />
          </label>
          <label className="rotulo">
            Data de validade *
            <input className="campo" type="date" value={dados.data_validade} onChange={mudar("data_validade")} required />
          </label>
          <label className="rotulo inteiro">
            Observação
            <textarea className="campo" value={dados.observacao} onChange={mudar("observacao")} maxLength={255} />
          </label>
        </div>

        {erro && <p className="msg-erro">{erro}</p>}

        <div className="modal-acoes">
          <button type="button" className="btn btn-outline" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="btn" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
