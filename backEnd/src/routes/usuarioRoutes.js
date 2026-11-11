const router = require("express").Router();
const c = require("../controllers/usuarioController");
const { autenticar, exigirPerfil } = require("../middlewares/authMiddleware");
const capturar = require("../utils/capturar");

router.use(autenticar, exigirPerfil("admin")); // gestão de usuários: só administrador

router.get("/", capturar(c.listar));
router.post("/", capturar(c.criar));
router.put("/:id", capturar(c.atualizar));
router.delete("/:id", capturar(c.remover));

module.exports = router;
