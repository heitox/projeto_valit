"use client";
import { useEffect, useState } from "react";

// Alterna entre modo claro (fundo branco) e modo escuro (fundo preto). A escolha fica salva.
export default function ThemeToggle({ className = "" }) {
  const [tema, setTema] = useState("light");

  useEffect(() => {
    setTema(document.documentElement.getAttribute("data-theme") || "light");
  }, []);

  function alternar() {
    const novo = tema === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", novo);
    try { localStorage.setItem("tema", novo); } catch {}
    setTema(novo);
  }

  const escuro = tema === "dark";
  return (
    <button
      type="button"
      className={`btn-icone ${className}`}
      onClick={alternar}
      title={escuro ? "Mudar para modo claro" : "Mudar para modo escuro"}
      aria-label={escuro ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {escuro ? (
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      ) : (
        <svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
      )}
    </button>
  );
}
