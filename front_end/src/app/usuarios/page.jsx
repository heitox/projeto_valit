"use client";
import { useCallback, useEffect, useState } from "react";
import AppShell, { PERFIL_NOME, useUsuario } from "@/components/AppShell";
import Modal from "@/components/Modal";
import { atualizarUsuario, criarUsuario, excluirUsuario, listarUsuarios } from "@/services/usuarioService";
import { dataBR } from "@/utils/formatar";

// Tela exclusiva do administrador: cadastrar funcionários e definir o nível de acesso
export default function UsuariosPage() {
  return (
    <AppShell apenasAdmin>
      <Usuarios />
    </AppShell>
  );
}

function Usuarios() {
  const eu = useUsuario();
  const [usuarios, setUsuarios] = useState(null);
  const [modal, setModal] = useState(null); // null | { usuario }
  const [aviso, setAviso] = useState(null);

  function avisar(texto, erro = false) {
    setAviso({ texto, erro });
    setTimeout(() => setAviso(null), 3500);
  }

  const carregar = useCallback(async () => {
    try {
      setUsuarios(await listarUsuarios());
    } catch (err) {
      avisar(err.message, true);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function excluir(u) {
    if (!window.confirm(`Excluir o usuário "${u.nome}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await excluirUsuario(u.id);
      avisar("Usuário excluído");
      carregar();
    } catch (err) {
      avisar(err.message, true);
    }
  }

  return (
    <>
      <div className="app-titulo">
        <div>
          <h1>Usuários</h1>
          <p>Funcionários com acesso ao sistema e o nível de permissão de cada um.</p>
        </div>
        <button className="btn" onClick={() => setModal({ usuario: null })}>
          <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
          Novo usuário
        </button>
      </div>

      <div className="tabela-wrap">
        {usuarios === null ? (
          <p className="carregando">Carregando usuários...</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail (login)</th>
                <th>Nível de acesso</th>
                <th>Situação</th>
                <th>Criado em</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.nome || "—"}{u.id === eu.id && <span className="sub">você</span>}</td>
                  <td>{u.usuario}</td>
                  <td><span className={`badge ${u.perfil === "admin" ? "admin" : "neutro"}`}>{PERFIL_NOME[u.perfil]}</span></td>
                  <td><span className={`badge ${u.ativo ? "ok" : "vencido"}`}>{u.ativo ? "Ativo" : "Desativado"}</span></td>
                  <td>{dataBR(u.criado_em)}</td>
                  <td>
                    <div className="acoes-linha">
                      <button className="btn btn-outline btn-sm" onClick={() => setModal({ usuario: u })}>Editar</button>
                      {u.id !== eu.id && (
                        <button className="btn btn-perigo btn-sm" onClick={() => excluir(u)}>Excluir</button>
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
        <UsuarioForm
          usuario={modal.usuario}
          souEu={modal.usuario?.id === eu.id}
          aoFechar={() => setModal(null)}
          aoSalvar={(texto) => {
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

function UsuarioForm({ usuario, souEu, aoFechar, aoSalvar }) {
  const editando = Boolean(usuario);
  const [dados, setDados] = useState({
    nome: usuario?.nome || "",
    usuario: usuario?.usuario || "",
    perfil: usuario?.perfil || "funcionario",
    ativo: usuario ? Boolean(usuario.ativo) : true,
    senha: "",
  });
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      if (editando) {
        await atualizarUsuario(usuario.id, {
          nome: dados.nome, perfil: dados.perfil, ativo: dados.ativo, ...(dados.senha ? { senha: dados.senha } : {}),
        });
        aoSalvar("Usuário atualizado");
      } else {
        await criarUsuario({ nome: dados.nome, usuario: dados.usuario, senha: dados.senha, perfil: dados.perfil });
        aoSalvar("Usuário cadastrado");
      }
    } catch (err) {
      setErro(err.message);
      setSalvando(false);
    }
  }

  return (
    <Modal titulo={editando ? "Editar usuário" : "Novo usuário"} aoFechar={aoFechar}>
      <form onSubmit={salvar}>
        <div className="form-grid">
          <label className="rotulo inteiro">
            Nome *
            <input className="campo" value={dados.nome} onChange={(e) => setDados({ ...dados, nome: e.target.value })} required autoFocus />
          </label>
          <label className="rotulo inteiro">
            E-mail (usado no login) *
            <input className="campo" type="email" value={dados.usuario} disabled={editando}
              onChange={(e) => setDados({ ...dados, usuario: e.target.value })} required />
          </label>
          <label className="rotulo">
            Nível de acesso
            <select className="campo" value={dados.perfil} disabled={souEu}
              onChange={(e) => setDados({ ...dados, perfil: e.target.value })}>
              <option value="funcionario">Funcionário</option>
              <option value="admin">Administrador</option>
            </select>
          </label>
          <label className="rotulo">
            {editando ? "Nova senha" : "Senha *"}
            <input className="campo" type="password" minLength={6} value={dados.senha} required={!editando}
              onChange={(e) => setDados({ ...dados, senha: e.target.value })} />
            <small>{editando ? "Deixe em branco para manter a atual" : "Mínimo de 6 caracteres"}</small>
          </label>
          {editando && !souEu && (
            <label className="check inteiro">
              <input type="checkbox" checked={dados.ativo} onChange={(e) => setDados({ ...dados, ativo: e.target.checked })} />
              Usuário ativo (desmarque para bloquear o acesso)
            </label>
          )}
        </div>

        {erro && <p className="msg-erro">{erro}</p>}

        <div className="modal-acoes">
          <button type="button" className="btn btn-outline" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="btn" disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</button>
        </div>
      </form>
    </Modal>
  );
}
