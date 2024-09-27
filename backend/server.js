import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { initializeSocket } from "./socket.js";
import { PORT } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// middleware allows files in this directory to be accessible from the web
app.use(express.static(path.join(__dirname, "public")));

const server = createServer(app);

server.listen(PORT, "0.0.0.0", () => {     /// Change 0.0.0.0 once laptop issue is fixed
  console.log(`Listening on port ${PORT}`);
});

initializeSocket(server);
