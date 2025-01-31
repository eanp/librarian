import Joi from 'joi';

export const bookValidationSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Book title cannot be empty',
      'string.max': 'Book title cannot exceed 255 characters'
    }),
  description: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  publicationYear: Joi.number()
    .integer()
    .min(1800)
    .max(new Date().getFullYear() + 1)
    .default(() => new Date().getFullYear())
    .messages({
      'number.min': 'Publication year must be after 1800',
      'number.max': 'Publication year cannot be in the future'
    }),
  condition: Joi.string()
    .valid('NEW', 'GOOD', 'FAIR', 'POOR')
    .allow('')
    .messages({
      'any.only': 'Invalid book condition'
    }),
  price: Joi.number()
    .min(0)
    .max(10000000)
    .default(0)
    .messages({
      'number.min': 'Price cannot be negative',
      'number.max': 'Price is unrealistically high'
    }),
  grade: Joi.string()
    .optional()
    .allow('')
    .max(50)
    .messages({
      'string.max': 'Grade cannot exceed 50 characters'
    }),
  writer: Joi.string()
    .trim()
    .max(255)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Author name cannot exceed 255 characters'
    }),
  class: Joi.string()
    .optional()
    .allow('')
    .max(50)
    .messages({
      'string.max': 'Class cannot exceed 50 characters'
    }),
  category: Joi.string()
    .optional()
    .allow('')
    .max(100)
    .messages({
      'string.max': 'Category cannot exceed 100 characters'
    }),
  publisher: Joi.string()
    .optional()
    .allow('')
    .max(255)
    .messages({
      'string.max': 'Publisher name cannot exceed 255 characters'
    }),
  rack: Joi.string()
    .optional()
    .allow('')
    .max(50)
    .messages({
      'string.max': 'Rack location cannot exceed 50 characters'
    }),
  cover_photo: Joi.string()
    .max(255)
    .messages({
      'string.max': 'Cover Photo required'
    }),
  created_by: Joi.string()
    .max(100)
    .messages({
      'string.max': 'created_by location cannot exceed 50 characters'
    }),
  code: Joi.string()
    .max(100)
    .messages({
      'string.max': 'code location cannot exceed 50 characters'
    }),
});