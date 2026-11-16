const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const router = express.Router();
const multer = require("multer");

const articleController = require("../controllers/articleController");

const uploadDirectory = path.join(__dirname, "..", "imagenes", "articulos");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdir(uploadDirectory, { recursive: true }, (error) => {
      cb(error, uploadDirectory);
    });
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `articulo-${randomUUID()}${extension}`);
  }
});

const upload = multer({ storage });

router.get("/ruta-prueba", articleController.testArticleRoute);
router.post("/crear", articleController.createArticle);
router.get("/articulos", articleController.getArticles);
router.get("/articulos/:id", articleController.getArticleById);
router.delete("/articulos/:id", articleController.deleteArticle);
router.put("/articulos/:id", articleController.updateArticle);
router.post(
  "/subir-imagen/:id",
  upload.single("archivo"),
  articleController.uploadArticleImage
);
router.get("/imagen/:fichero", articleController.getArticleImage);
router.get("/bucar/:busqueda", articleController.searchArticles);

module.exports = router