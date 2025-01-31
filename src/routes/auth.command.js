import express from "express";
import { Argon2id } from "oslo/password";
import { prismaClient } from "../application/database.js";

import { lucia, Origin } from "../application/auth.js";
const route = express.Router();

let initial_data = {
  content: "APP_NAME",
  status: "success",
};

route.post("/login", async (req, res, next) => {
  let data = req.body;
  let helper = { ...initial_data, title: "Coffees Login", content: "Login pages" };
  let result;


  const user = await prismaClient.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    result = res.render("login", {
      ...helper,
      status: "error",
      messages: "User not exist please register",
    });
    result && res.send(result);
    return
  }

  const isPasswordValid = await new Argon2id().verify(
    user.password,
    data.password
  );

  if (!isPasswordValid) {
    result = res.render("login", {
      ...helper,
      status: "error",
      messages: "Wrong Passwordr",
    });
    result && res.send(result);
    return
  }

  delete user.password;
  const userId = user.id;
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  res.header("Set-Cookie", sessionCookie.serialize());
  res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  res.header({ "Hx-redirect": "/book" }).send("login successful!");
  return
}
);

route.get("/logout", async (req, res, next) => {
  if (!res.locals.session) {
    return res.redirect("/login");
  }

  await lucia.invalidateSession(res.locals.session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  res.header("Set-Cookie", sessionCookie.serialize());
  res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  res.redirect("/login");
  return;
});

export default route;