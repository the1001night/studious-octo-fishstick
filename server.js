const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Загрузить переменные окружения
dotenv.config();

// Подключиться к базе данных
connectDB();

const app = express();

// Middleware
app.use(cors()); // Разрешить CORS
app.use(express.json({ limit: '10mb' })); // Парсинг JSON с увеличенным лимитом
app.use(express.urlencoded({ extended: true })); // Парсинг URL-encoded данных

// Маршруты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API работает!',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (требует авторизации)',
        logout: 'POST /api/auth/logout (требует авторизации)'
      },
      users: {
        getAll: 'GET /api/users (только админ)',
        getById: 'GET /api/users/:id (только админ)',
        updateProfile: 'PUT /api/users/profile (требует авторизации)',
        changePassword: 'PUT /api/users/change-password (требует авторизации)',
        delete: 'DELETE /api/users/:id (только админ)'
      }
    }
  });
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Маршрут ${req.originalUrl} не найден`
  });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Ошибка валидации Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации',
      errors: messages
    });
  }

  // Ошибка дублирования MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `Поле ${field} уже существует`
    });
  }

  // Ошибка приведения типов MongoDB
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Неверный формат ID'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Внутренняя ошибка сервера'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📱 API доступно по адресу: http://localhost:${PORT}`);
  console.log(`📚 Документация: http://localhost:${PORT}/`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM получен, закрываем сервер...');
  server.close(() => {
    console.log('Сервер закрыт.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT получен, закрываем сервер...');
  server.close(() => {
    console.log('Сервер закрыт.');
    process.exit(0);
  });
});

module.exports = app;
