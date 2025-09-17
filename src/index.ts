import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { createServer } from "http";
import morgan from "morgan";
dotenv.config();

import path from "path";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./routes/authRoutes";
import pollRoutes from "./routes/pollRoute";
import swaggerRouter from "./routes/swagger";
import usersRoutes from "./routes/usersRoutes";
import voteRoutes from "./routes/voteRoute";
import { initSocket } from "./socket";

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        id: string;
      };
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

app.use(morgan("dev"));

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "http://localhost:3300",
      "http://localhost:5173",
      "https://hd.rcmade.me",
    ],
  })
);

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

initSocket(httpServer);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/docs", swaggerRouter);

const clientDist = path.join(process.cwd(), "client", "dist");
app.use(express.static(clientDist));
app.get("/", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});
app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
