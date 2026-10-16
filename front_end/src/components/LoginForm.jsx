"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";
import "./login.css";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  
  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const { token } = await login(email, senha);
      localStorage.setItem("token", token);
      router.push("/produtos");
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <img src="/logo.png" alt="Valit" className="login-logo" />
      </header>

      <section className="login-card">
        <h1>Bem-Vindo | Login</h1>

        <form onSubmit={handleSubmit}>
          <label className="login-field">
            <svg viewBox="0 0 24 24" className="login-icon">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3.5 6.5 12 13l8.5-6.5" />
            </svg>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="login-field">
            <svg viewBox="0 0 24 24" className="login-icon">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            <input
              type={mostrar ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <button
              type="button"
              className="login-eye"
              onClick={() => setMostrar(!mostrar)}
              aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
            >
              <svg viewBox="0 0 24 24" className="login-icon">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
                {mostrar && <path d="M4 20 20 4" />}
              </svg>
            </button>
          </label>

          {erro && <p className="login-erro">{erro}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>

      <footer className="login-footer">
        © 2026 Valit. Todos os direitos reservados.{" "}
        <a href="#">Termos de Serviço</a>.
      </footer>
    </main>
  );
}
