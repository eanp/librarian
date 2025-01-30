import express from "express";
import { Argon2id } from "oslo/password";
import { prismaClient } from "../application/database.js";

import { lucia, Origin } from "../application/auth.js";
const route = express.Router();

let initial_data = {
  content: "APP_NAME",
  status: "success",
};
const sortOptions = [
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
  { value: "publicationYear-asc", label: "Publication Year (Oldest)" },
  { value: "publicationYear-desc", label: "Publication Year (Newest)" },
  { value: "price-asc", label: "Price (Low to High)" },
  { value: "price-desc", label: "Price (High to Low)" },
  { value: "created_at-asc", label: "Date Added (Oldest)" },
  { value: "created_at-desc", label: "Date Added (Newest)" }
];

const filterOptions = [
  {
    label: "Category",
    name: "category",
    options: [
      { value: "fiction" },
      { value: "non-fiction" },
      { value: "textbook" }
    ],
    icon: '<svg class="w-4 h-4" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="currentColor" fill="none" stroke-width="2"/></svg>'
  },
  {
    label: "Publisher",
    name: "publisher",
    options: [
      { value: "penguin" },
      { value: "harper" },
      { value: "scholastic" }
    ],
    icon: '<svg class="w-4 h-4" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke="currentColor" fill="none" stroke-width="2"/></svg>'
  },
  {
    label: "Condition",
    name: "condition",
    options: [
      { value: "new" },
      { value: "used" },
      { value: "damaged" }
    ],
    icon: '<svg class="w-4 h-4" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" fill="none" stroke-width="2"/></svg>'
  }]


export default route;