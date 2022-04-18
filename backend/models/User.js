//Importation de mongoose
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

//Création du schéma avec une entrée unique concernant l'email
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);
//Exportation du model
module.exports = mongoose.model("User", userSchema);