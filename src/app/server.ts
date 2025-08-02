import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envConfig } from "./config/env";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envConfig.DB_URL);
    console.log(" Connected to MongoDB");

    const port = Number(envConfig.PORT) || 5000;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    server = app.listen(port, () => {
      console.log(` Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();
