const cors = require("cors");
const express = require("express");
const multer = require("multer");

const articleRoutes = require("./routes/articleRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", articleRoutes);

app.get("/probando", (req, res) => {
  return res.json({ message: "Probando la ruta" });
});

app.use((req, res) => {
  return res.status(404).json({
    status: "error",
    mensaje: "Ruta no encontrada"
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      status: "error",
      mensaje: "No se pudo procesar el archivo"
    });
  }

  console.error("Unhandled request error:", error.message);
  return res.status(500).json({
    status: "error",
    mensaje: "Error interno del servidor"
  });
});

module.exports = app;
