"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { buscarUsuarioLogado, logout } from "@/services/authService";
import { getToken } from "@/services/api";
import ThemeToggle from "./ThemeToggle";

const AuthContext = createContext(null);
export const useUsuario = () => useContext(AuthContext);

export const PERFIL_NOME = { admin: "Administrador", funcionario: "Funcionário" };

// Estrutura das telas internas: confere o login, mostra o menu e bloqueia telas sem permissão.
// apenasAdmin: a tela só abre para administradores.
export default function AppShell({ children, apenasAdmin = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/");
      return;
    }
    buscarUsuarioLogado()
      .then((u) => {
        if (apenasAdmin && u.perfil !== "admin") {
          router.replace("/produtos");
          return;
        }
        setUsuario(u);
      })
      .catch(() => {
        logout();
        router.replace("/");
      });
  }, [router, apenasAdmin]);

  function sair() {
    logout();
    router.replace("/");
  }

  const links = [{ href: "/produtos", texto: "Produtos" }];
  if (usuario?.perfil === "admin") links.push({ href: "/usuarios", texto: "Usuários" });

  return (
    <AuthContext.Provider value={usuario}>
      <header className="app-header">
        <Link href="/produtos" aria-label="Valit - início">
          <img src="/logo.png" alt="Valit" className="app-logo" />
        </Link>
        <nav className="app-nav">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={pathname === l.href ? "ativo" : ""}>
              {l.texto}
            </Link>
          ))}
        </nav>
        <div className="app-user">
          {usuario && (
            <div className="app-user-info">
              <strong>{usuario.nome || usuario.usuario}</strong>
              <span>{PERFIL_NOME[usuario.perfil]}</span>
            </div>
          )}
          <ThemeToggle />
          <button type="button" className="btn btn-outline" onClick={sair}>Sair</button>
        </div>
      </header>
      <main className="app-main">
        {usuario ? children : <p className="carregando">Carregando...</p>}
      </main>
    </AuthContext.Provider>
  );
}
