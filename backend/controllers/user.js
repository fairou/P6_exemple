//Imporatation de bcrypt, jsonwebtoken et du model User
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Fonction signup
exports.signup = (req, res, next) => {
  //Utilisation de bcrypt pour le hash du password
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      //Si user est crée = 201 sinon 401
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(401).json({ error }));
    })
    //Gestion de l'erreur en 500 (server response)
    .catch((error) => res.status(500).json({ error }));
};

//Fonction login
exports.login = (req, res, next) => {
  //Recherche de User dans la bdd
  User.findOne({ email: req.body.email })
    //Si non trouvé 401
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      //Utilisation de bcrypt pour la comparaison du mot de passe
      bcrypt
        .compare(req.body.password, user.password)
        //Si invalide 401
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          //sinon 200 + création d'un token valable 24h
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
              expiresIn: "24h",
            }),
          });
        })
        //Gestion de l'erreur en 500 (server response)
        .catch((error) => res.status(500).json({ error }));
    })
    //Gestion de l'erreur en 500 (server response)
    .catch((error) => res.status(500).json({ error }));
};
