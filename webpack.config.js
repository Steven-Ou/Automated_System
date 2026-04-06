const path = require("path");
const Dotenv = require("dotenv-webpack");

module.exports = {
  mode: "development",
  entry: {
    background: "./background.js",
    content: "./content.js",
    popup: "./popup.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  plugins: [
    new Dotenv(), // This pulls your GEMINI_API_KEY from .env
  ],
};
