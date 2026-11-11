// Cria o banco, as tabelas, os usuários de teste e os produtos de exemplo usando o .env
// Uso: npm run db:setup
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, "..", "database.sql"), "utf8");
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true,
    });
    await conn.query(sql);

    const migrar = require("../src/database/migrate");
    await migrar();
    await require("../src/database/connection").end();

    console.log("Banco db_valit configurado com sucesso.");
    console.log("Logins: admin@valit.com / admin123 (administrador) | teste@email.com / 123456 (funcionário)");
  } catch (err) {
    console.error("Erro ao configurar o banco:", err.message);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
})();
