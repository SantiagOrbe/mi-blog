const fs = require("node:fs/promises");
const path = require("node:path");
const mongoose = require("mongoose");

const Article = require("../models/article");

const uploadDirectory = path.join(__dirname, "..", "imagenes", "articulos");
const allowedImageExtensions = new Set([".png", ".jpg", ".jpeg"]);

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const sendError = (res, statusCode, mensaje) =>
  res.status(statusCode).json({ status: "error", mensaje });

const logDatabaseError = (operation, error) => {
  console.error(`Article ${operation} failed:`, error.message);
};

const removeUploadedFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Could not remove uploaded file:", error.message);
    }
  }
};

const testArticleRoute = (req, res) => {
  return res.status(200).json({
    mensaje: "Soy una accion bla bla"
  });
};

const createArticle = async (req, res) => {
  const { title, content } = req.body || {};

  if (!isNonEmptyString(title) || !isNonEmptyString(content)) {
    return sendError(res, 400, "Faltan datos por validar");
  }

  try {
    const article = await new Article({
      title: title.trim(),
      content: content.trim()
    }).save();

    return res.status(201).json({
      status: "success",
      articulo: article
    });
  } catch (error) {
    logDatabaseError("creation", error);
    return sendError(res, 500, "No se ha guardado el artículo");
  }
};

const getArticles = async (req, res) => {
  const limitValue = req.query.ultimos;
  let query = Article.find({}).sort({ date: -1 });

  if (limitValue !== undefined) {
    if (
      typeof limitValue !== "string" ||
      !/^[1-9]\d*$/.test(limitValue) ||
      !Number.isSafeInteger(Number(limitValue))
    ) {
      return sendError(res, 400, "El límite debe ser un número entero positivo");
    }

    query = query.limit(Number(limitValue));
  }

  try {
    const articles = await query.exec();
    return res.status(200).json({
      status: "success",
      articulos: articles
    });
  } catch (error) {
    logDatabaseError("list", error);
    return sendError(res, 500, "No se han podido obtener los artículos");
  }
};

const getArticleById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return sendError(res, 400, "El identificador del artículo no es válido");
  }

  try {
    const article = await Article.findById(id).exec();
    if (!article) {
      return sendError(res, 404, "No se encontró el artículo");
    }

    return res.status(200).json({
      status: "success",
      articulo: article
    });
  } catch (error) {
    logDatabaseError("lookup", error);
    return sendError(res, 500, "No se ha podido obtener el artículo");
  }
};

const deleteArticle = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return sendError(res, 400, "El identificador del artículo no es válido");
  }

  try {
    const article = await Article.findByIdAndDelete(id).exec();
    if (!article) {
      return sendError(res, 404, "No se encontró el artículo");
    }

    return res.status(200).json({
      status: "success",
      articulo: article,
      mensaje: "Artículo borrado"
    });
  } catch (error) {
    logDatabaseError("deletion", error);
    return sendError(res, 500, "No se ha podido borrar el artículo");
  }
};

const updateArticle = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body || {};

  if (!mongoose.isValidObjectId(id)) {
    return sendError(res, 400, "El identificador del artículo no es válido");
  }

  if (!isNonEmptyString(title) || !isNonEmptyString(content)) {
    return sendError(res, 400, "El título y el contenido son obligatorios");
  }

  try {
    const article = await Article.findByIdAndUpdate(
      id,
      { title: title.trim(), content: content.trim() },
      { new: true, runValidators: true }
    ).exec();

    if (!article) {
      return sendError(res, 404, "No se encontró el artículo");
    }

    return res.status(200).json({
      status: "success",
      articulo: article,
      mensaje: "Artículo actualizado"
    });
  } catch (error) {
    logDatabaseError("update", error);
    return sendError(res, 500, "Error al actualizar el artículo");
  }
};

const uploadArticleImage = async (req, res) => {
  if (!req.file) {
    return sendError(res, 400, "La petición no contiene un archivo");
  }

  const extension = path.extname(req.file.originalname).toLowerCase();
  if (!allowedImageExtensions.has(extension)) {
    await removeUploadedFile(req.file.path);
    return sendError(res, 400, "El archivo debe ser PNG, JPG o JPEG");
  }

  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    await removeUploadedFile(req.file.path);
    return sendError(res, 400, "El identificador del artículo no es válido");
  }

  try {
    const article = await Article.findByIdAndUpdate(
      id,
      { imagen: req.file.filename },
      { new: true, runValidators: true }
    ).exec();

    if (!article) {
      await removeUploadedFile(req.file.path);
      return sendError(res, 404, "No se encontró el artículo");
    }

    return res.status(200).json({
      status: "success",
      articulo: article,
      mensaje: "Imagen actualizada"
    });
  } catch (error) {
    await removeUploadedFile(req.file.path);
    logDatabaseError("image update", error);
    return sendError(res, 500, "Error al actualizar la imagen");
  }
};

const getArticleImage = async (req, res) => {
  const { fichero } = req.params;
  const fileName = path.basename(fichero);

  if (fileName !== fichero || fileName === "." || fileName === "..") {
    return sendError(res, 400, "El nombre del archivo no es válido");
  }

  const filePath = path.join(uploadDirectory, fileName);
  try {
    await fs.access(filePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      return sendError(res, 404, "No se encontró la imagen");
    }

    console.error("Could not access image:", error.message);
    return sendError(res, 500, "No se ha podido obtener la imagen");
  }

  return res.sendFile(filePath, (error) => {
    if (error && !res.headersSent) {
      console.error("Could not send image:", error.message);
      return sendError(res, 500, "No se ha podido enviar la imagen");
    }
  });
};

const searchArticles = async (req, res) => {
  const { busqueda } = req.params;
  if (!isNonEmptyString(busqueda)) {
    return sendError(res, 400, "El término de búsqueda es obligatorio");
  }

  const escapedSearch = busqueda.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  try {
    const articles = await Article.find({
      $or: [
        { title: { $regex: escapedSearch, $options: "i" } },
        { content: { $regex: escapedSearch, $options: "i" } }
      ]
    })
      .sort({ date: -1 })
      .exec();

    return res.status(200).json({
      status: "success",
      articulos: articles
    });
  } catch (error) {
    logDatabaseError("search", error);
    return sendError(res, 500, "No se han podido buscar los artículos");
  }
};

module.exports = {
  testArticleRoute,
  createArticle,
  getArticles,
  getArticleById,
  deleteArticle,
  updateArticle,
  uploadArticleImage,
  getArticleImage,
  searchArticles
};
