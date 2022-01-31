//Importation des dependances
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
//Imporation des différentes routes
const userRoutes = require("./routes/user");
const saucesRoutes = require("./routes/sauces");
//Utilisation d'express
const app = express();
//Protection des en-tetes headers
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy());
app.use(helmet.crossOriginResourcePolicy({ policy: "same-site" }));
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
//CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

//Connexion à la bdd
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use(express.json());

//Middleware pour le dossier images
app.use("/images", express.static(path.join(__dirname, "images")));

//Middleware pour l'authentification
app.use("/api/auth", userRoutes);
//Middleware pour les sauces
app.use("/api/sauces", saucesRoutes);

module.exports = app;
