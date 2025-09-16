import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { createServer } from "http";
import morgan from "morgan";

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

app.use(
  "/votings",
  express.static(path.join(process.cwd(), "public", "votings"))
);

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/docs", swaggerRouter);
initSocket(httpServer);

app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
