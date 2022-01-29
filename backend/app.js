//Importation des dependances
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
//Utilisation d'express
const app = express();
//Protection des en-tetes headers
app.use(helmet());
app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));

//Imporation des différentes routes
const userRoutes = require("./routes/user");
const saucesRoutes = require("./routes/sauces");

//Connexion à la bdd
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

//Middleware CORS
app.use(cors());
app.options(process.env.WEBSITE, cors());

app.use(express.json());

//Middleware pour le dossier images
app.use("/images", express.static(path.join(__dirname, "images")));

//Middleware pour l'authentification
app.use("/api/auth", cors(), userRoutes);
//Middleware pour les sauces
app.use("/api/sauces", cors(), saucesRoutes);

module.exports = app;
