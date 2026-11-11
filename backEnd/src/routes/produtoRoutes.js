const router = require("express").Router();
const c = require("../controllers/produtoController");
const { autenticar, exigirPerfil } = require("../middlewares/authMiddleware");
const capturar = require("../utils/capturar");

router.use(autenticar); // todas as rotas exigem login

router.get("/", capturar(c.listar));
router.get("/resumo", capturar(c.resumo));
router.get("/categorias", capturar(c.categorias));
router.get("/:id", capturar(c.buscar));
router.post("/", capturar(c.criar));
router.put("/:id", capturar(c.atualizar));
router.delete("/:id", exigirPerfil("admin"), capturar(c.remover)); // excluir: só administrador

module.exports = router;
