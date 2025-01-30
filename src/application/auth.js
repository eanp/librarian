import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prismaClient } from "./database.js";

const adapter = new PrismaAdapter(prismaClient.session, prismaClient.user);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: process.env.NODE_ENV === "dev" //production
		}
	},
	getUserAttributes: (attributes) => {
		return {
			name: attributes.name,
			email: attributes.email,
			role: attributes.role,
		};
	}
});

export const Origin = (req,res,next) => {
  if(req.headers?.origin !== process.env.BASE_URL){
    return res.redirect(`${req.headers?.referer}`);
  } else {
    next();
  }
};

export const Protect = (req,res,next) => {
  if (!res.locals.user) {
      return res.redirect("/login");
  } else{
      next();
  }
};