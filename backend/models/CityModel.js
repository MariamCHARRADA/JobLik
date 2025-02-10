const mongoose = require("mongoose");

const CitySchema = mongoose.Schema({
  Name: {
    type: String,
    required: [true, "Please add your city"],
  },
});

module.exports = mongoose.model("City", CitySchema);
