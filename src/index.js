import bodyParser from "body-parser";
import * as dotenv from "dotenv";
import express from "express";
import expressLayouts from "express-ejs-layouts";
import morgan from "morgan";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import route from "./routes/index.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts");
app.use(expressLayouts);
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));
app.use("/static", express.static(path.join(__dirname, "..", "static"), {
  maxAge: "1000"
}));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads"), {
  maxAge: "1000"
}));

app.use("/", route);

app.use((req, res, next) => {
  res.status(404).send("Sorry, page not found | 404");
});

app.listen(PORT, () =>
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`)
);