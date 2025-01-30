import { v4 as uuid } from "uuid";
import { logger } from "../application/logging.js";
import { prismaClient } from "../application/database.js";
import express from "express";

const route = express.Router();
const sortOptions = [
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
  { value: "publicationYear-asc", label: "Publication Year (Oldest)" },
  { value: "publicationYear-desc", label: "Publication Year (Newest)" },
  { value: "price-asc", label: "Price (Low to High)" },
  { value: "price-desc", label: "Price (High to Low)" },
  { value: "created_at-asc", label: "Date Added (Oldest)" },
  { value: "created_at-desc", label: "Date Added (Newest)" },
];


const condition = [
  { value: "new" },
  { value: "used" },
  { value: "damaged" },
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
  }
];


// Helper functions
const parseFilters = (query) => {
  const filterFields = ['category', 'publisher', 'publicationYear', 'priceRange', 'writer'];
  const filters = [];

  filterFields.forEach(field => {
    if (query[field]) {
      switch (field) {
        case 'priceRange':
          const [min, max] = query[field].split('-').map(Number);
          if (!isNaN(min)) filters.push({ field: 'price', value: min, operator: 'gte' });
          if (!isNaN(max)) filters.push({ field: 'price', value: max, operator: 'lte' });
          break;
        case 'publicationYear':
          filters.push({ field, value: parseInt(query[field]), operator: 'equals' });
          break;
        default:
          filters.push({ field, value: `%${query[field]}%`, operator: 'like' });
      }
    }
  });

  return filters;
};

const buildWhereClause = (filters, searchQuery) => {
  const conditions = [];

  if (searchQuery) {
    conditions.push({
      OR: [
        { code: { contains: searchQuery } },
        { title: { contains: searchQuery } },
        { description: { contains: searchQuery } },
        { writer: { contains: searchQuery } },
        { publisher: { contains: searchQuery } },
        { category: { contains: searchQuery } },
      ],
    });
  }

  if (filters.length > 0) {
    const filterConditions = filters.map(filter => {
      switch (filter.operator) {
        case 'like':
          return { [filter.field]: { contains: filter.value.replace(/%/g, '') } };
        case 'gte':
          return { [filter.field]: { gte: filter.value } };
        case 'lte':
          return { [filter.field]: { lte: filter.value } };
        default:
          return { [filter.field]: { equals: filter.value } };
      }
    });
    conditions.push({ AND: filterConditions });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
};

const validateSort = (sortField, sortOrder) => {
  const validSortFields = {
    title: true,
    publicationYear: true,
    price: true,
    created_at: true
  };

  const field = validSortFields[sortField] ? sortField : 'created_at';
  const order = sortOrder === 'asc' ? 'asc' : 'desc';

  return { [field]: order };
};

// Controller methods
const bookController = {
  // Create new book
  createBook: async (req, res) => {
    try {
      const { body } = req;
      const publicationYear = isNaN(parseInt(body.publicationYear))
        ? new Date().getFullYear()
        : body.publicationYear;

      const payload = {
        code: uuid(),
        title: body.title ?? "-",
        description: body.description ?? "-",
        publicationYear,
        condition: body.condition ?? "",
        cover_photo: body.cover_photo ?? "",
        price: body.price ?? 0,
        grade: body.grade ?? "",
        writer: body.writer ?? "",
        class: body.class ?? "",
        category: body.category ?? "",
        publisher: body.publisher ?? "",
        rack: body.rack ?? "",
        created_by: "4d942489-fffb-4272-ae1a-af670ff50e76",
      };

      const uniqueBookCode = await prismaClient.book.count({
        where: { code: payload.code }
      });

      if (uniqueBookCode !== 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Code Book Already exists'
        });
      }

      const book = await prismaClient.book.create({ data: payload });
      logger.info('Book created:', book);

      return res.redirect('/book');
    } catch (err) {
      logger.error('Error creating book:', err);
      return res.status(500).render('error', {
        message: err.message || 'An error occurred while creating the book'
      });
    }
  },

  // Get all books with filtering and sorting
  getBooks: async (req, res) => {
    try {
      const searchQuery = req.query.search?.toLowerCase() || '';
      const currentSort = req.query.sort || 'created_at-desc';
      const [sortField, sortOrder] = currentSort.split('-');
      const filters = parseFilters(req.query);

      const books = await prismaClient.book.findMany({
        where: buildWhereClause(filters, searchQuery),
        orderBy: validateSort(sortField, sortOrder)
      });

      logger.info('Retrieved books:', {
        count: books.length,
        filters,
        sort: currentSort
      });

      return res.render('dashboard-book', {
        books,
        searchValue: searchQuery,
        currentSort,
        activeFilters: filters,
        sortOptions,
        filterOptions,
        condition
      });
    } catch (err) {
      logger.error('Error retrieving books:', err);
      return res.status(500).render('error', {
        message: err.message || 'An error occurred while retrieving books'
      });
    }
  },

  // Get book details
  getBookDetails: async (req, res) => {
    try {
      const { code } = req.params;
      const book = await prismaClient.book.findUnique({
        where: { code }
      });

      if (!book) {
        return res.status(404).render('error', {
          message: 'Book not found'
        });
      }

      return res.render('dashboard/book-detail', { book });
    } catch (err) {
      logger.error('Error retrieving book details:', err);
      return res.status(500).render('error', {
        message: err.message || 'An error occurred while retrieving book details'
      });
    }
  },

  // Update book
  updateBook: async (req, res) => {
    try {
      const { code } = req.params;
      const { body } = req;
      const publicationYear = isNaN(parseInt(body.publicationYear))
        ? new Date().getFullYear()
        : body.publicationYear;

      const payload = {
        title: body.title ?? "-",
        description: body.description ?? "-",
        publicationYear,
        condition: body.condition ?? "",
        cover_photo: body.cover_photo ?? "",
        price: body.price ?? 0,
        grade: body.grade ?? "",
        writer: body.writer ?? "",
        class: body.class ?? "",
        category: body.category ?? "",
        publisher: body.publisher ?? "",
        rack: body.rack ?? "",
      };

      const book = await prismaClient.book.update({
        where: { code },
        data: payload
      });

      logger.info('Book updated:', book);
      return res.redirect('/book');
    } catch (err) {
      logger.error('Error updating book:', err);
      return res.status(500).render('error', {
        message: err.message || 'An error occurred while updating the book'
      });
    }
  },

  // Delete book
  deleteBook: async (req, res) => {
    try {
      const { code } = req.params;

      await prismaClient.book.delete({
        where: { code }
      });

      logger.info('Book deleted:', code);
      return res.redirect('/book');
    } catch (err) {
      logger.error('Error deleting book:', err);
      return res.status(500).render('error', {
        message: err.message || 'An error occurred while deleting the book'
      });
    }
  }
};


route.post('/book', bookController.createBook);
route.get('/book', bookController.getBooks);
route.get('/book/:code', bookController.getBookDetails);
route.put('/book/:code', bookController.updateBook);
route.delete('/book/:code', bookController.deleteBook);

export default route;