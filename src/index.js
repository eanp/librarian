import bodyParser from "body-parser";
import * as dotenv from "dotenv";
import express from "express";
import expressLayouts from "express-ejs-layouts";
import path from "path";
import morgan from "morgan";

import route from "./routes/routes.js";
dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src", "views"));
app.set("layout", "layouts");
app.use(expressLayouts);
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));
app.use("/static", express.static("static", {
  maxAge: "1000"
}));
app.use("/uploads", express.static("uploads", {
  maxAge: "1000"
}));

app.use("/", route);

app.use((req, res, next) => {
  res.status(404).send("Sorry, page not found | 404");
});

app.listen(process.env.PORT, () =>
  console.log(`⚡️[server]: Server is running at http://localhost:${process.env.PORT}`)
);