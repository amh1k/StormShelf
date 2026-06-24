import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";

dotenv.config();

const port = Number(process.env.PORT) || 9000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error: unknown) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
