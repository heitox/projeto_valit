const router = require("express").Router();
const c = require("../controllers/relatorioController");
const { autenticar } = require("../middlewares/authMiddleware");
const capturar = require("../utils/capturar");

// GET /api/relatorios/produtos?formato=csv|pdf&status=&categoria=&busca=
router.get("/produtos", autenticar, capturar(c.exportarProdutos));

module.exports = router;
