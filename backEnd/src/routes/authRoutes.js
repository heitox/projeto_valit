const router = require("express").Router();
const authController = require("../controllers/authController");
const { autenticar } = require("../middlewares/authMiddleware");
const capturar = require("../utils/capturar");

router.post("/login", capturar(authController.login));
router.get("/me", autenticar, authController.me);

module.exports = router;
