const express = require("express");
const router = express.Router();

const userCtrl = require("../controllers/user");

//Importation de la vérif du mot de passe

router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

module.exports = router;