import express from "express";
import { Argon2id } from "oslo/password";
import { prismaClient } from "../application/database.js";
import { v4 as uuid } from "uuid";

import { lucia, Origin } from "../application/auth.js";
const route = express.Router();

let initial_data = {
  content: "Librarian",
  status: "success",
  messages: "",
  value: null
};

route.post("/login", async (req, res, next) => {
  let helper = { ...initial_data, content: "Login pages" };
  let result;
  let data = req.body;
  try {
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
        value: data
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
        messages: "Wrong Password",
        value: data
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
  } catch (err) {
    result = res.render("login", {
      ...helper,
      status: "error",
      messages: "Wrong Passwordr",
      value: data
    });
    result && res.send(result);
    return
  }
}

);

route.post("/register", async (req, res, next) => {
  let helper = { ...initial_data, content: "Register pages" };
  let result;
  let data = req.body;
  try {
    if (!data.password) {
      result = res.render("register", {
        ...helper,
        status: "error",
        messages: "Password required",
        value: data
      });
      result && res.send(result);
      return
    }
    const user = await prismaClient.user.count({
      where: { email: data.email }
    });

    if (user !== 0) {
      result = res.render("register", {
        ...helper,
        status: "error",
        messages: "User exist please login",
        value: data
      });
      result && res.send(result);
      return
    }

    const createUser = await prismaClient.user.create({
      data: {
        email: data.email,
        password: await new Argon2id().hash(
          data.password
        ), id: uuid(),
      }
    });
    const userId = createUser.id;
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    res.header("Set-Cookie", sessionCookie.serialize());
    res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return res.header({ "Hx-redirect": "/book" }).send("register successful!");
  } catch (err) {
    result = res.render("register", {
      ...helper,
      status: "error",
      messages: "error",
      value: data
    });
    result && res.send(result);
    return
  }
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