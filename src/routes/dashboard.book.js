import { v4 as uuid } from "uuid";
import { logger } from "../application/logging.js";
import { prismaClient } from "../application/database.js";
import express from "express";
import { Protect } from "../application/auth.js";
import { upload } from "../middleware/photo.js"
import { bookValidationSchema } from "../models/book.js"

const dashboardBook = express.Router();

let initial_data = {
  status: "success",
  email: "",
  messages: ""
};

const createBook = async (req, res) => {
  try {
    const cover_photo = req.file?.path ?? ""
    const { body } = req;
    const payload = {
      code: uuid(),
      title: body.title ?? "-",
      description: body.description ?? "-",
      publicationYear: parseInt(body.publicationYear) ?? 0,
      condition: body.condition ?? "",
      cover_photo,
      price: parseInt(body.price) ?? 0,
      grade: body.grade ?? "",
      writer: body.writer ?? "",
      class: body.class ?? "",
      category: body.category ?? "",
      publisher: body.publisher ?? "",
      rack: body.rack ?? "",
      created_by: res.locals.user.id,
    };

    const { error } = bookValidationSchema.validate(payload, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const validationErrors = error.details.map(detail => (
        `${detail.message}`
      ));
      throw Error(validationErrors.join("\n"));
    }


    const uniqueBookCode = await prismaClient.book.count({
      where: { code: payload.code }
    });

    if (uniqueBookCode !== 0) {
      throw Error("Code Book Already exists");
    }

    const book = await prismaClient.book.create({ data: payload });
    logger.info('Book created:', book);

    return res.redirect('/book');
  } catch (err) {
    console.log('Error creating book:', err);
    const book = req.body
    res.setHeader("Content-Type", "text/html").status(200).render("book/create", { ...initial_data, book, status: "error", messages: err.message });
    return
  }
};

dashboardBook.get("/book/create", Protect, async (req, res, next) => {
  const book = req.body
  res.setHeader("Content-Type", "text/html").status(200).render("book/create", { ...initial_data, book });
});

dashboardBook.post('/book/create', Protect, upload.single('photo'), createBook);

dashboardBook.get("/book/detail/:code", Protect, async (req, res, next) => {
  try {
    const code = req.params.code
    if (!code) {
      throw Error("Code Book Error");
    }
    const book = await prismaClient.book.findFirst({
      where: { code }
    });

    console.log(book)
    res.setHeader("Content-Type", "text/html").status(200).render("book/detail", { ...initial_data, book });
  }
  catch (err) {
    console.log('Error creating book:', err);
    const book = req.body
    res.setHeader("Content-Type", "text/html").status(200).render("book/detail", { ...initial_data, book, status: "error", messages: err.message });
    return
  }
});

export default dashboardBook;