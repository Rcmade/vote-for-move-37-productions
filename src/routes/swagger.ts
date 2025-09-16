import { Router, type Router as ExpressRouter } from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const swaggerRouter: ExpressRouter = Router();
const spec = YAML.load(path.join(process.cwd(), "openapi.yaml"));

swaggerRouter.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(spec, { explorer: true })
);

export default swaggerRouter;
