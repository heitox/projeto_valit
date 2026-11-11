require("dotenv").config();
const express = require("express");
const cors = require("cors");
const migrar = require("./src/database/migrate");

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET não definido no .env (copie .env.example para .env)");
  process.exit(1);
}

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  exposedHeaders: ["Content-Disposition"], // o navegador lê o nome do arquivo exportado
}));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/produtos", require("./src/routes/produtoRoutes"));
app.use("/api/usuarios", require("./src/routes/usuarioRoutes"));
app.use("/api/relatorios", require("./src/routes/relatorioRoutes"));

app.use((req, res) => res.status(404).json({ message: "Rota não encontrada" }));

// Erros não tratados
app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === "entity.parse.failed") return res.status(400).json({ message: "JSON inválido" });
  res.status(500).json({ message: "Erro interno do servidor" });
});

// Prepara o banco (tenta de novo enquanto o MySQL ainda está subindo) e só então abre a porta
async function iniciar() {
  const PORT = process.env.PORT || 3309;
  for (let tentativa = 1; ; tentativa++) {
    try {
      await migrar();
      console.log("Banco de dados pronto.");
      break;
    } catch (err) {
      console.error(`Banco indisponível (tentativa ${tentativa}): ${err.message}`);
      if (tentativa === 1) {
        console.error("Verifique o MySQL e os dados do .env. Sem Docker, rode: npm run db:setup");
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
}

iniciar();
