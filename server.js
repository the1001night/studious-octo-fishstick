const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, checkDBHealth, closeDBConnection } = require('./config/database');
const constants = require('./config/constants');

// Загрузить переменные окружения
dotenv.config();

// Подключиться к базе данных
connectDB();

const app = express();

// Middleware
app.use(cors()); // Разрешить CORS
app.use(express.json({ limit: constants.REQUEST_BODY_SIZE_LIMIT })); // Парсинг JSON с лимитом из констант
app.use(express.urlencoded({ extended: true })); // Парсинг URL-encoded данных

// Middleware для логирования запросов
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });

  next();
});

// Middleware для обработки ошибок парсинга JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Неверный JSON в теле запроса'
    });
  }
  next(err);
});

// Маршруты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API работает!',
    version: constants.API_VERSION,
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
      },
      health: {
        db: 'GET /api/health/db - проверка базы данных',
        server: 'GET /api/health/server - проверка сервера'
      }
    }
  });
});

// Health check эндпоинты
app.get('/api/health/db', async (req, res) => {
  try {
    const dbHealth = await checkDBHealth();
    res.json({
      success: true,
      database: dbHealth
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при проверке базы данных',
      error: error.message
    });
  }
});

app.get('/api/health/server', (req, res) => {
  res.json({
    success: true,
    server: {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      platform: process.platform,
      node_env: process.env.NODE_ENV || 'development'
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
const gracefulShutdown = async (signal) => {
  console.log(`${signal} получен, закрываем сервер и базу данных...`);

  try {
    // Закрываем соединение с БД
    await closeDBConnection();

    // Закрываем HTTP сервер
    server.close(async () => {
      console.log('✅ Сервер и база данных закрыты gracefully');
      process.exit(0);
    });

    // Таймаут на принудительное завершение
    setTimeout(() => {
      console.error('❌ Принудительное завершение после таймаута');
      process.exit(1);
    }, 10000);

  } catch (error) {
    console.error('❌ Ошибка при graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
