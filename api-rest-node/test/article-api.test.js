const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { after, afterEach, before, test } = require("node:test");

const Article = require("../models/article");
const app = require("../app");
const connectDB = require("../database/connection");

const uploadDirectory = path.join(__dirname, "..", "imagenes", "articulos");
const articleId = "507f1f77bcf86cd799439011";
const article = {
  _id: articleId,
  title: "Test article",
  content: "Test content",
  imagen: "default.png"
};

let server;
let baseUrl;
let restorers = [];

const stubMethod = (target, methodName, implementation) => {
  const original = target[methodName];
  target[methodName] = implementation;
  restorers.push(() => {
    target[methodName] = original;
  });
};

const queryFor = (result, onLimit) => {
  const query = {
    sort() {
      return this;
    },
    limit(value) {
      if (onLimit) {
        onLimit(value);
      }
      return this;
    },
    exec: async () => result
  };

  return query;
};

const requestJson = async (route, options) => {
  const response = await fetch(`${baseUrl}${route}`, options);
  return { response, body: await response.json() };
};

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.closeAllConnections();
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

afterEach(() => {
  for (const restore of restorers.reverse()) {
    restore();
  }
  restorers = [];
});

test("existing probe routes return their current response keys", async () => {
  const articleProbe = await requestJson("/ruta-prueba");
  const serverProbe = await requestJson("/probando");

  assert.equal(articleProbe.response.status, 200);
  assert.equal(articleProbe.body.mensaje, "Soy una accion bla bla");
  assert.equal(serverProbe.response.status, 200);
  assert.equal(serverProbe.body.message, "Probando la ruta");
});

test("POST /crear validates required fields and saves valid articles", async () => {
  const invalid = await requestJson("/crear", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: " ", content: "content" })
  });
  assert.equal(invalid.response.status, 400);
  assert.equal(invalid.body.status, "error");

  stubMethod(Article.prototype, "save", async function saveArticle() {
    return { ...article, title: this.title, content: this.content };
  });

  const created = await requestJson("/crear", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: " New title ", content: " New content " })
  });

  assert.equal(created.response.status, 201);
  assert.equal(created.body.status, "success");
  assert.equal(created.body.articulo.title, "New title");
  assert.equal(created.body.articulo.content, "New content");
});

test("GET /articulos supports an optional query-string limit", async () => {
  const expectedArticles = [article];
  let appliedLimit;

  stubMethod(Article, "find", (filter) => {
    assert.deepEqual(filter, {});
    return queryFor(expectedArticles, (value) => {
      appliedLimit = value;
    });
  });

  const list = await requestJson("/articulos");
  const limitedList = await requestJson("/articulos?ultimos=2");
  const invalidLimit = await requestJson("/articulos?ultimos=0");

  assert.equal(list.response.status, 200);
  assert.deepEqual(list.body.articulos, expectedArticles);
  assert.equal(limitedList.response.status, 200);
  assert.equal(appliedLimit, 2);
  assert.equal(invalidLimit.response.status, 400);
});

test("GET /articulos/:id distinguishes invalid, missing, and found articles", async () => {
  const invalidId = await requestJson("/articulos/not-an-id");
  assert.equal(invalidId.response.status, 400);

  const numericPathIsNotAListLimit = await requestJson("/articulos/5");
  assert.equal(numericPathIsNotAListLimit.response.status, 400);

  stubMethod(Article, "findById", () => queryFor(article));
  const found = await requestJson(`/articulos/${articleId}`);
  assert.equal(found.response.status, 200);
  assert.equal(found.body.articulo.title, article.title);

  stubMethod(Article, "findById", () => queryFor(null));
  const missing = await requestJson(`/articulos/${articleId}`);
  assert.equal(missing.response.status, 404);
});

test("DELETE /articulos/:id returns the deleted article or not-found status", async () => {
  stubMethod(Article, "findByIdAndDelete", () => queryFor(article));
  const deleted = await requestJson(`/articulos/${articleId}`, {
    method: "DELETE"
  });
  assert.equal(deleted.response.status, 200);
  assert.equal(deleted.body.articulo.title, article.title);

  stubMethod(Article, "findByIdAndDelete", () => queryFor(null));
  const missing = await requestJson(`/articulos/${articleId}`, {
    method: "DELETE"
  });
  assert.equal(missing.response.status, 404);
});

test("PUT /articulos/:id validates and updates article fields", async () => {
  const invalid = await requestJson(`/articulos/${articleId}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "", content: "content" })
  });
  assert.equal(invalid.response.status, 400);

  stubMethod(Article, "findByIdAndUpdate", (id, update, options) => {
    assert.equal(id, articleId);
    assert.deepEqual(update, { title: "Updated", content: "Updated content" });
    assert.equal(options.runValidators, true);
    return queryFor({ ...article, ...update });
  });

  const updated = await requestJson(`/articulos/${articleId}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: " Updated ",
      content: " Updated content "
    })
  });

  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.articulo.title, "Updated");
});

test("POST /subir-imagen/:id handles uploads and stores them in the image directory", async () => {
  const missingFile = await requestJson(`/subir-imagen/${articleId}`, {
    method: "POST"
  });
  assert.equal(missingFile.response.status, 400);

  await fs.mkdir(uploadDirectory, { recursive: true });
  const existingFiles = new Set(await fs.readdir(uploadDirectory));
  const invalidForm = new FormData();
  invalidForm.append("archivo", new Blob(["not an image"]), "invalid.txt");
  const invalidFile = await requestJson(`/subir-imagen/${articleId}`, {
    method: "POST",
    body: invalidForm
  });
  assert.equal(invalidFile.response.status, 400);
  assert.deepEqual(
    (await fs.readdir(uploadDirectory)).filter((file) => !existingFiles.has(file)),
    []
  );

  let uploadedFileName;
  stubMethod(Article, "findByIdAndUpdate", (id, update) => {
    uploadedFileName = update.imagen;
    return queryFor({ ...article, imagen: uploadedFileName });
  });

  const form = new FormData();
  form.append("archivo", new Blob(["image data"]), "cover.PNG");

  try {
    const uploaded = await requestJson(`/subir-imagen/${articleId}`, {
      method: "POST",
      body: form
    });

    assert.equal(uploaded.response.status, 200);
    assert.match(uploaded.body.articulo.imagen, /^articulo-.+\.png$/);
    await fs.access(path.join(uploadDirectory, uploadedFileName));
  } finally {
    if (uploadedFileName) {
      await fs.unlink(path.join(uploadDirectory, uploadedFileName));
    }
  }
});

test("GET /imagen/:fichero serves existing images and reports missing images", async () => {
  const fileName = `test-image-${randomUUID()}.png`;
  const filePath = path.join(uploadDirectory, fileName);
  await fs.mkdir(uploadDirectory, { recursive: true });
  await fs.writeFile(filePath, "test image data");

  try {
    const image = await fetch(`${baseUrl}/imagen/${fileName}`);
    assert.equal(image.status, 200);
    assert.match(image.headers.get("content-type"), /^image\/png/);
    assert.equal(await image.text(), "test image data");
  } finally {
    await fs.unlink(filePath);
  }

  const missing = await requestJson(`/imagen/missing-${randomUUID()}.png`);
  assert.equal(missing.response.status, 404);
  assert.equal(missing.body.status, "error");
});

test("GET /bucar/:busqueda returns matching articles", async () => {
  stubMethod(Article, "find", (filter) => {
    assert.equal(filter.$or[0].title.$regex, "test");
    assert.equal(filter.$or[1].content.$options, "i");
    return queryFor([article]);
  });

  const results = await requestJson("/bucar/test");
  assert.equal(results.response.status, 200);
  assert.deepEqual(results.body.articulos, [article]);
});

test("Mongo connection reports a missing MONGODB_URI clearly", async () => {
  const originalUri = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;

  try {
    await assert.rejects(connectDB(), /MONGODB_URI is not set/);
  } finally {
    if (originalUri === undefined) {
      delete process.env.MONGODB_URI;
    } else {
      process.env.MONGODB_URI = originalUri;
    }
  }
});
