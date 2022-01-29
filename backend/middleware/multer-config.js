//Importation de multer
const multer = require("multer");

//Extensions valide pour les photos
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};
//Dossier de destination
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  //Formats du fichiers dans son appelation
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + "." + extension);
  },
});
//Exportation du module
module.exports = multer({ storage: storage }).single("image");
