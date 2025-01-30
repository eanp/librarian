import express from "express";
import { prismaClient } from "../application/database.js";
import { logger } from "../application/logging.js";
import { BookSeedData, BorrowingSeedData, UserSeedData } from "../../seed/mock.js"

const seederRouter = express.Router();

seederRouter.get("/seeder/user", async (req, res) => {
  try {
    const createdUsers = await prismaClient.user.createMany({
      data: UserSeedData,
    });

    logger.info(`Successfully created ${createdUsers.count} user`);
    res.send(`Successfully created ${createdUsers.count} user`);
  } catch (err) {
    logger.info("Error creating users", err);
    res.redirect("/");
  }
});

seederRouter.get("/seeder/book", async (req, res) => {
  try {
    const createdBooks = await prismaClient.book.createMany({
      data: BookSeedData,
    });
    logger.info(`Successfully created ${createdBooks.count} books`);
    res.send(`Successfully created ${createdBooks.count} books`);
  } catch (err) {
    logger.info("Error creating books", err);
    res.redirect("/");
  }
});

const moreDays = () => {
  const randomDays = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + randomDays);
  return futureDate;
};

seederRouter.get("/seeder/borrowing", async (req, res) => {
  try {
    const today = new Date();

    const createdBorrowings = await Promise.all(
      BorrowingSeedData.map(async (e) => {
        return prismaClient.borrowing.create({
          data: {
            ...e,
            borrowed_date: today,
            due_date: moreDays(),
            fine_amount: e.fine_amount || 0,
          },
        });
      })
    );

    logger.info(`Successfully created ${createdBorrowings.length} borrowing records`);
    res.send(`Successfully created ${createdBorrowings.length} borrowing records`);
  } catch (err) {
    logger.info("Error creating borrowings", err);
    res.redirect("/");
  }
});

export default seederRouter;