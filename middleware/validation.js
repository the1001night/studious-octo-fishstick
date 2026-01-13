const { body, validationResult } = require('express-validator');

// Middleware для обработки ошибок валидации
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации данных',
      errors: errors.array()
    });
  }
  next();
};

// Валидация регистрации
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Имя должно содержать от 2 до 50 символов')
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s]+$/)
    .withMessage('Имя может содержать только буквы и пробелы'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Введите корректный email'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен содержать минимум 6 символов')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву и одну цифру'),

  handleValidationErrors
];

// Валидация входа
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Введите корректный email'),

  body('password')
    .notEmpty()
    .withMessage('Пароль обязателен'),

  handleValidationErrors
];

// Валидация обновления профиля
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Имя должно содержать от 2 до 50 символов')
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s]+$/)
    .withMessage('Имя может содержать только буквы и пробелы'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Введите корректный email'),

  handleValidationErrors
];

// Дополнительная валидация для администраторских действий
const validateAdminAction = [
  body('action')
    .isIn(['activate', 'deactivate', 'delete'])
    .withMessage('Недопустимое действие'),

  body('userId')
    .isMongoId()
    .withMessage('Неверный ID пользователя'),

  handleValidationErrors
];

// Валидация для сброса пароля
const validatePasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Введите корректный email'),

  handleValidationErrors
];

// Валидация для изменения роли пользователя
const validateRoleChange = [
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('Роль должна быть user или admin'),

  body('userId')
    .isMongoId()
    .withMessage('Неверный ID пользователя'),

  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateAdminAction,
  validatePasswordReset,
  validateRoleChange
};
