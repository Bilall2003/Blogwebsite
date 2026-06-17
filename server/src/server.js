import app from "./app.js";
import { testConnection } from "./config/db.js";

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await testConnection();
  } catch (err) {
    console.error("Failed to connect to MySQL:", err.message);
    console.error(
      "Make sure MySQL is running and the credentials in .env are correct."
    );
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start();
