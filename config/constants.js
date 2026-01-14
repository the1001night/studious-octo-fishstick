// Константы приложения
const constants = {
  // JWT настройки
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  JWT_COOKIE_EXPIRE: 30, // дни

  // Ограничения запросов
  REQUEST_BODY_SIZE_LIMIT: process.env.REQUEST_BODY_SIZE_LIMIT || '10mb',
  FILE_UPLOAD_SIZE_LIMIT: process.env.FILE_UPLOAD_SIZE_LIMIT || '5mb',

  // База данных
  DB_CONNECTION_TIMEOUT: 30000, // 30 секунд
  DB_RECONNECT_INTERVAL: 5000, // 5 секунд

  // API настройки
  API_VERSION: '1.0.0',
  API_PREFIX: '/api',

  // Роли пользователей
  USER_ROLES: {
    USER: 'user',
    ADMIN: 'admin'
  },

  // Статусы пользователей
  USER_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BANNED: 'banned'
  },

  // HTTP статус коды
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
  },

  // Сообщения об ошибках
  ERROR_MESSAGES: {
    USER_NOT_FOUND: 'Пользователь не найден',
    INVALID_CREDENTIALS: 'Неверный email или пароль',
    EMAIL_ALREADY_EXISTS: 'Email уже используется',
    UNAUTHORIZED: 'Не авторизован',
    FORBIDDEN: 'Доступ запрещен',
    VALIDATION_ERROR: 'Ошибка валидации данных',
    SERVER_ERROR: 'Внутренняя ошибка сервера'
  },

  // Успешные сообщения
  SUCCESS_MESSAGES: {
    USER_REGISTERED: 'Пользователь успешно зарегистрирован',
    LOGIN_SUCCESSFUL: 'Вход выполнен успешно',
    LOGOUT_SUCCESSFUL: 'Выход выполнен успешно',
    PROFILE_UPDATED: 'Профиль обновлен успешно',
    PASSWORD_CHANGED: 'Пароль изменен успешно',
    USER_DELETED: 'Пользователь удален успешно'
  }
};

module.exports = constants;

