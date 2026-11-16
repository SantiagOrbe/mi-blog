const { Schema, model } = require("mongoose");

const articleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  date: {
    type: String,
    default: () => new Date().toISOString()
  },
  imagen: {
    type: String,
    default: "default.png"
  }
});

module.exports = model("Article", articleSchema);