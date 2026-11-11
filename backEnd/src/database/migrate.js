// Cria/atualiza as tabelas e os dados iniciais. Roda sempre que o backend inicia.
// Seguro para rodar várias vezes e atualiza bancos de versões antigas do projeto.
const db = require("./connection");

const SENHA_ADMIN = "$2a$10$OxxGSoz5xskkD0/UbX.NGux2MUw.MvbRQqwI0PEC3pvdr3QANR9HC"; // admin123
const SENHA_TESTE = "$2a$10$qnjy0ZBjaCMTW3ka7bBBPuzaI9AUOMS7uP5hSmSkP.kWpzeXjRY.C"; // 123456

async function colunaExiste(tabela, coluna) {
  const [rows] = await db.query(
    "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
    [tabela, coluna]
  );
  return rows.length > 0;
}

async function migrar() {
  await db.query(`CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
  )`);

  // Colunas adicionadas nesta versão (bancos antigos só tinham id, usuario e senha)
  const novasColunas = [
    ["nome", "VARCHAR(120) NOT NULL DEFAULT '' AFTER id"],
    ["perfil", "ENUM('admin','funcionario') NOT NULL DEFAULT 'funcionario'"],
    ["ativo", "TINYINT(1) NOT NULL DEFAULT 1"],
    ["criado_em", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"],
  ];
  for (const [coluna, definicao] of novasColunas) {
    if (!(await colunaExiste("usuarios", coluna))) {
      await db.query(`ALTER TABLE usuarios ADD COLUMN ${coluna} ${definicao}`);
    }
  }

  await db.query(`CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    categoria VARCHAR(80) NOT NULL DEFAULT '',
    lote VARCHAR(60) NOT NULL DEFAULT '',
    quantidade INT NOT NULL DEFAULT 0,
    data_validade DATE NOT NULL,
    observacao VARCHAR(255) NOT NULL DEFAULT '',
    criado_por INT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_produtos_validade (data_validade),
    CONSTRAINT fk_produtos_usuario FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL
  )`);

  // Usuários de teste
  await db.query(
    "INSERT IGNORE INTO usuarios (nome, usuario, senha, perfil) VALUES (?, ?, ?, 'admin'), (?, ?, ?, 'funcionario')",
    ["Administrador", "admin@valit.com", SENHA_ADMIN, "Funcionário Teste", "teste@email.com", SENHA_TESTE]
  );
  await db.query("UPDATE usuarios SET nome = 'Funcionário Teste' WHERE usuario = 'teste@email.com' AND nome = ''");

  // Produtos de exemplo (só quando a tabela está vazia), com datas relativas a hoje
  const [[{ total }]] = await db.query("SELECT COUNT(*) AS total FROM produtos");
  if (total === 0) {
    const [[admin]] = await db.query("SELECT id FROM usuarios WHERE usuario = 'admin@valit.com'");
    const exemplos = [
      ["Leite integral 1L", "Laticínios", "L2311A", 24, -3],
      ["Iogurte natural 170g", "Laticínios", "IG0912", 40, 2],
      ["Pão de forma", "Padaria", "PF4410", 15, 5],
      ["Presunto fatiado 200g", "Frios", "PR7781", 12, 12],
      ["Arroz branco 5kg", "Mercearia", "AR2026", 30, 180],
      ["Detergente 500ml", "Limpeza", "DT5500", 60, 400],
    ];
    for (const [nome, categoria, lote, quantidade, dias] of exemplos) {
      await db.query(
        `INSERT INTO produtos (nome, categoria, lote, quantidade, data_validade, criado_por)
         VALUES (?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL ? DAY), ?)`,
        [nome, categoria, lote, quantidade, dias, admin.id]
      );
    }
  }
}

module.exports = migrar;
