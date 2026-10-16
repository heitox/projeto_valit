CREATE DATABASE db_valit;
USE db_valit;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL
);

USE db_valit;
INSERT INTO usuarios (usuario, senha) VALUES ('teste@email.com', '$2a$10$qnjy0ZBjaCMTW3ka7bBBPuzaI9AUOMS7uP5hSmSkP.kWpzeXjRY.C');