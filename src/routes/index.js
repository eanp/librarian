import express from "express";
import session from "express-session";
import * as dotenv from "dotenv";
import seederRouter from "./seeder.js";
import auth from "./auth.js";
import book from "./book.js";
import dashboardBook from "./dashboard.book.js";
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
  return next();
});


let initial_data = {
  content: APP_NAME,
  status: "success",
  email: "",
  messages: "",
  value: null
};

route.get("/login", async (req, res, next) => {
  res.setHeader("Content-Type", "text/html").status(200).render("login", { ...initial_data});
});
route.get("/register", async (req, res, next) => {
  res.setHeader("Content-Type", "text/html").status(200).render("register", { ...initial_data});
});
route.get("/", Protect ,async (req, res, next) => {
  res.redirect("/book")
});

route.use(seederRouter)
route.use(auth)
route.use(book)
route.use(dashboardBook)

export default route;