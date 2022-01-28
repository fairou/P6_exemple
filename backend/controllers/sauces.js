//Importation du model des sauces + fs
const Sauces = require("../models/Sauces");
const fs = require("fs");

//Creation d'une sauce
exports.createSauce = (req, res, next) => {
  //Creation de l'objet
  const sauceObject = JSON.parse(req.body.sauce);
  //Suppression de l'id coté frontend de l'objet
  delete sauceObject._id;
  //Instancie le model
  const sauce = new Sauces({
    //Récupération des éléments présent dans le model
    ...sauceObject,
    //Ainsi que l'image qui sera créée
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  //Si ok = 201; Sinon 400
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
    //Bad request
    .catch(() => res.status(400).json({ error: "Sauce non enregistrée" }));
};
//Récupération de toute les sauces
exports.getAllSauces = (req, res, next) => {
  Sauces.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};
//Récupération d'une sauce en particulier
exports.getOneSauce = (req, res, next) => {
  //On récupère la sauce par son id en param d'url
  Sauces.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: "Sauce introuvable",
      });
    });
};
//Modification d'une sauce
exports.modifySauce = (req, res, next) => {
  //On récupère l'id de la sauce
  Sauces.findOne({ _id: req.params.id })
    .then((sauce) => {
      //Si l'id de l'utilisateur est différent du créateur de la sauce alors 403
      if (sauce.userId !== req.auth.userId) {
        return res.status(403).json({ error: "Accès non autorisé" });
      } else {
        //Contenu de la cause
        const sauceObject = req.file
          ? //Si modification dans le corps de la requete (champs de type string, number ou images)
            {
              ...JSON.parse(req.body.sauce),
              imageUrl: `${req.protocol}://${req.get("host")}/images/${
                req.file.filename
              }`,
            }
          : //Sinon on envoie les données seulement modifiées
            { ...req.body };
        //Mise à jour du contenu qui a été modifié

        Sauces.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => {
            res.status(200).json({ message: "Sauce modifiée !" });
          })
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch(() => {
      res.status(404).json({ error: "Sauce introuvable" });
    });
};
//Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
  //On récupère l'id dans le param d'url
  Sauces.findOne({ _id: req.params.id })
    .then((sauce) => {
      //Si l'id de l'utilisateur est différent du créateur de la sauce alors 403
      if (sauce.userId !== req.auth.userId) {
        return res.status(403).json({ error: "Accès non autorisé" });
      } else {
        //On récupère le fichier image et pas l'url entière
        const filename = sauce.imageUrl.split("/images/")[1];
        //Suppression de l'image dans le dossier
        fs.unlink(`images/${filename}`, () => {
          //Suppression de l'id de la sauce et de tout contenu
          Sauces.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
            .catch(() =>
              res
                .status(400)
                .json({ error: "Impossible de supprimée la sauce concernée !" })
            );
        });
      }
    })
    //Si id introuvable
    .catch(() => res.status(404).json({ error: "Sauce introuvable" }));
};

exports.likeOrDislikeSauce = (req, res, next) => {
  switch (req.body.like) {
    case 1: //1 = Like
      isLike();
      break;
    case -1: //-1 = Dislike
      isDislike();
      break;
    case 0: //0 = Neutre
      isNeutral();
      break;
  }
  //Fonction qui incrémente un like correspondant à l'utilisateur
  function isLike() {
    //Récupération de l'id de la sauce
    Sauces.findOne({ _id: req.params.id })
      .then((sauce) => {
        //Si l'id user n'est pas présent dans le tableau des like alors on incrémente +1
        if (!sauce.usersLiked.find((user) => user === req.body.userId)) {
          Sauces.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: 1 },
              $push: { usersLiked: req.body.userId },
            }
          )
            .then(() => res.status(200).json({ message: "Like ajouté !" }))
            .catch((error) => res.status(500).json(error));
        } else {
          //Si l'utilisateur a déjà liker le contenu alors il ne peut pas reliker
          res.status(400).json({
            error: "Like déjà pris en compte",
          });
        }
      })
      .catch(() => res.status(404).json({ error: "Sauce inexistante" }));
  }
  //Fonction qui incrémente un dislike correspondant à l'utilisateur
  function isDislike() {
    //Récupération de l'id de la sauce
    Sauces.findOne({ _id: req.params.id })
      .then((sauce) => {
        //Si l'id user n'est pas présent dans le tableau des dislike alors on incrémente +1
        if (!sauce.usersDisliked.find((user) => user === req.body.userId)) {
          Sauces.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: 1 },
              $push: { usersDisliked: req.body.userId },
            }
          )
            .then(() => res.status(200).json({ message: "Dislike ajouté !" }))
            .catch((error) => res.status(500).json(error));
        } else {
          //Si l'utilisateur a déjà disliker le contenu alors il ne peut pas reliker
          res.status(400).json({
            error: "Dislike déjà pris en compte",
          });
        }
      })
      .catch(() => res.status(404).json({ error: "Sauce inexistante" }));
  }
  //Fonction qui annule l'action like/dislike correspondant à l'utilisateur
  function isNeutral() {
    //Récupération de l'id de la sauce
    Sauces.findOne({ _id: req.params.id })
      .then((sauce) => {
        //Si l'id user est présent dans le tableau des like alors on incrémente -1
        if (sauce.usersLiked.find((user) => user === req.body.userId)) {
          Sauces.updateOne(
            { _id: req.params.id },
            { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } }
          )
            .then(() => {
              res.status(200).json({ message: "Like supprimé !" });
            })
            .catch((error) => res.status(500).json(error));
        }
        //Si l'id user est présent dans le tableau des dislike alors on incrémente -1
        if (sauce.usersDisliked.find((user) => user === req.body.userId)) {
          Sauces.updateOne(
            { _id: req.params.id },
            {
              $pull: { usersDisliked: req.body.userId },
              $inc: { dislikes: -1 },
            }
          )
            .then(() => {
              res.status(200).json({ message: "Dislike supprimé !" });
            })
            .catch((error) => res.status(500).json(error));
        }
      })
      .catch(() => res.status(404).json({ error: "Sauce inexistante" }));
  }
};
