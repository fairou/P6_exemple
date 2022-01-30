//Imporatation de bcrypt, jsonwebtoken et du model User
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cryptojs = require("crypto-js");
const schemaPassword = require("../models/passwordValidator");

//Fonction signup
exports.signup = (req, res, next) => {
  //On crypte l'email pour préserver l'anonymat
  const cryptedEmail = cryptojs
    .HmacSHA256(req.body.email, process.env.EMAIL_CRYPTOJS_KEY)
    .toString();
  if (!schemaPassword.validate(req.body.password)) {
    return res.status(400).send({
      message: `Le mot de passe doit contenir au moins : 8 à 20 caractères, une majuscule, une minuscule, un chiffre, et aucun espace`,
    });
  } else {
    //Utilisation de bcrypt pour le hash du password
    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => {
        const user = new User({
          email: cryptedEmail,
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
  }
};

//Fonction login
exports.login = (req, res, next) => {
  //On crypte l'email pour préserver l'anonymat
  const cryptedEmail = cryptojs
    .HmacSHA256(req.body.email, process.env.EMAIL_CRYPTOJS_KEY)
    .toString();
  //Recherche de User dans la bdd
  User.findOne({ email: cryptedEmail })
    //Si non trouvé 401
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .send({ message: `Adresse mail ou mot de passe incorrect` });
      }
      //Utilisation de bcrypt pour la comparaison du mot de passe
      bcrypt
        .compare(req.body.password, user.password)
        //Si invalide 401
        .then((valid) => {
          if (!valid) {
            return res
              .status(401)
              .send({ message: `Adresse mail ou mot de passe incorrect` });
          }
          //sinon 200 + création d'un token valable 24h
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.TOKEN_KEY, {
              expiresIn: "4h",
            }),
          });
        })
        //Gestion de l'erreur en 500 (server response)
        .catch((error) => res.status(500).json({ error }));
    })
    //Gestion de l'erreur en 500 (server response)
    .catch((error) => res.status(500).json({ error }));
};
