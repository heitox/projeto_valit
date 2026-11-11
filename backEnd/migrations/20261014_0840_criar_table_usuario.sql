CREATE DATABASE IF NOT EXISTS db_valit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_valit;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL
);

-- Usuário de teste: teste@email.com / 123456
INSERT IGNORE INTO usuarios (usuario, senha)
VALUES ('teste@email.com', '$2a$10$qnjy0ZBjaCMTW3ka7bBBPuzaI9AUOMS7uP5hSmSkP.kWpzeXjRY.C');
