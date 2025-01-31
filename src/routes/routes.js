import express from "express";
import session from "express-session";
import * as dotenv from "dotenv";
import seederRouter from "./seeder.js";
import authCommand from "./auth.command.js";
import authQuery from "./auth.query.js";
import book from "./book.js";
import { lucia, Protect } from "../application/auth.js";
dotenv.config();

const route = express.Router();
const APP_NAME = process.env.APP_NAME || "Libr"

route.use(session({
  secret: `${process.env.SECRET_SESSION_KEY}`,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

route.use((req, res, next) => {
  res.locals.message = req.session.message || "";
  delete req.session.message;
  next();
});

route.use(async (req, res, next) => {
  const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");
  if (!sessionId) {
    res.locals.user = null;
    res.locals.session = null;
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    res.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize());
  }
  if (!session) {
    res.appendHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize());
  }
  res.locals.session = session;
  res.locals.user = user;
  res.locals.query = req.query;
  res.locals.url = req.originalUrl;
  console.log(req.originalUrl)
  console.log(user)
  return next();
});


let initial_data = {
  content: APP_NAME,
  status: "success",
  email: ""
};

route.get("/login", async (req, res, next) => {
  res.setHeader("Content-Type", "text/html").status(200).render("login", { ...initial_data});
});
route.get("/register", async (req, res, next) => {
  res.setHeader("Content-Type", "text/html").status(200).render("register", { ...initial_data});
});

route.get("/", Protect, async (req, res, next) => {
  res.setHeader("Content-Type", "text/html").status(200).render("dashboard-main", { ...initial_data});
});

// dashboard book
route.get("/book/create", Protect, async (req, res, next) => {
  const book = req.body
  res.setHeader("Content-Type", "text/html").status(200).render("book/create", { ...initial_data, book});
});


route.use(seederRouter)
route.use(authCommand)
route.use(authQuery)
route.use(book)

export default route;