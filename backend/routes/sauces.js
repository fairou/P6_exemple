//Impoortation Express
const express = require("express");
//Utilisation de la methode Router
const router = express.Router();
//Importation de auth pour la sécurité des routes de leurs utilisations
const auth = require("../middleware/auth");
//Imporation de multer pour les images
const multer = require("../middleware/multer-config");
//Imporatation du controller des sauces
const saucesCtrl = require("../controllers/sauces");
//Création des routes
router.get("/", auth, saucesCtrl.getAllSauces);
router.post("/", auth, multer, saucesCtrl.createSauce);
router.get("/:id", auth, saucesCtrl.getOneSauce);
router.put("/:id", auth, multer, saucesCtrl.modifySauce);
router.delete("/:id", auth, saucesCtrl.deleteSauce);
router.post("/:id/like", auth, saucesCtrl.likeOrDislikeSauce);
//Exportation du router
module.exports = router;
