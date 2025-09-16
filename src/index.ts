import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./routes/authRoutes";

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

app.use(morgan("tiny"));

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

app.use("/api/auth", authRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
