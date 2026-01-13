const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware для защиты маршрутов
const protect = async (req, res, next) => {
  let token;

  // Проверить наличие токена в заголовках
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Получить токен из заголовка
      token = req.headers.authorization.split(' ')[1];

      // Верифицировать токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production');

      // Получить пользователя из токена
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({
        success: false,
        message: 'Не авторизован, токен недействителен'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Не авторизован, токен отсутствует'
    });
  }
};

// Middleware для проверки роли администратора
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Доступ запрещен, требуются права администратора'
    });
  }
};

module.exports = { protect, admin };
