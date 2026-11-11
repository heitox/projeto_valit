-- Banco do Valit (pode ser executado várias vezes sem erro).
-- Os usuários de teste e os produtos de exemplo são criados pelo backend ao iniciar
-- (src/database/migrate.js), que também atualiza bancos de versões antigas.
CREATE DATABASE IF NOT EXISTS db_valit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_valit;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL DEFAULT '',
  usuario VARCHAR(100) NOT NULL UNIQUE,          -- e-mail usado no login
  senha VARCHAR(255) NOT NULL,                   -- hash bcrypt
  perfil ENUM('admin', 'funcionario') NOT NULL DEFAULT 'funcionario',
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS produtos (
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
);
