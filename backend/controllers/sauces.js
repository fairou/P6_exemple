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
  //Contenu de la cause
  const sauceObject = req.file
    ? //Si modification dans le corps de la requete (champs de type string, number ou images)
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : //Sinon on envoie les données dans le corps de la requete sans l'image
      { ...req.body };
  //Mise à jour du contenu qui a été modifié
  Sauces.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
    .catch(() =>
      res
        .status(400)
        .json({ error: "Impossible de modifier la sauce concernée !" })
    );
};
//Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
  //On récupère l'id dans le param d'url
  Sauces.findOne({ _id: req.params.id })
    .then((sauce) => {
      //On récupère l'url de la sauce, et on le split autour de la chaine de caractères, donc le nom du fichier
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
    })
    //Si id introuvable
    .catch(() => res.status(500).json({ error: "Sauce introuvable" }));
};

exports.likeOrDislikeSauce = (req, res, next) => {
  switch (req.body.like) {
    case 1:
      Sauces.findOne({ _id: req.params.id })
        .then((sauce) => {
          if (!sauce.usersLiked.find((user) => user === req.body.userId)) {
            Sauces.updateOne(
              { _id: req.params.id },
              {
                $inc: { likes: 1 },
                $push: { usersLiked: req.body.userId },
              }
            )
              .then(() => res.status(200).json({ message: "Like ajouté !" }))
              .catch(() =>
                res.status(400).json({
                  error: "Impossible de liker, une erreur est survenue",
                })
              );
          } else {
            res.status(400).json({
              error: "Like déjà pris en compte",
            });
          }
        })
        .catch(() => res.status(400).json({ error: "Sauce inexistante" }));
      break;
    case -1:
      Sauces.findOne({ _id: req.params.id })
        .then((sauce) => {
          if (!sauce.usersDisliked.find((user) => user === req.body.userId)) {
            Sauces.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: 1 },
                $push: { usersDisliked: req.body.userId },
              }
            )
              .then(() => res.status(200).json({ message: "Dislike ajouté !" }))
              .catch(() =>
                res.status(400).json({
                  error: "Impossible de disliker, une erreur est survenue",
                })
              );
          } else {
            res.status(400).json({
              error: "Dislike déjà pris en compte",
            });
          }
        })
        .catch(() => res.status(400).json({ error: "Sauce inexistante" }));
      break;
    case 0:
      Sauces.findOne({ _id: req.params.id })
        .then((sauce) => {
          if (sauce.usersLiked.find((user) => user === req.body.userId)) {
            Sauces.updateOne(
              { _id: req.params.id },
              { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } }
            )
              .then(() => {
                res.status(200).json({ message: "Like supprimé !" });
              })
              .catch(() =>
                res.status(400).json({
                  error:
                    "Impossible de supprimer ce like, une erreur est survenue",
                })
              );
          }
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
              .catch(() =>
                res.status(400).json({
                  error:
                    "Impossible de supprimer ce dislike, une erreur est survenue",
                })
              );
          }
        })
        .catch(() => res.status(404).json({ error: "Sauce inexistante" }));
      break;
  }
};
