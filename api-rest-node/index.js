const connectDB = require("./database/connection");
const app = require("./app");

const port = Number(process.env.PORT) || 3000;

const startServer = async () => {
  await connectDB();

  return app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exitCode = 1;
  });
}

module.exports = startServer;
