const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_db');

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

    // Обработка reconnection
    mongoose.connection.on('disconnected', () => {
      console.log('❌ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('⚠️  Сервер работает без базы данных. Регистрация и вход будут недоступны.');
    return false;
  }
};

// Функция для проверки здоровья базы данных
const checkDBHealth = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      // Простая проверка - считаем количество пользователей
      const User = require('../models/User');
      const userCount = await User.countDocuments();
      return {
        status: 'healthy',
        connected: true,
        userCount,
        connectionState: mongoose.connection.readyState
      };
    } else {
      return {
        status: 'unhealthy',
        connected: false,
        connectionState: mongoose.connection.readyState
      };
    }
  } catch (error) {
    return {
      status: 'error',
      connected: false,
      error: error.message,
      connectionState: mongoose.connection.readyState
    };
  }
};

// Функция для graceful shutdown
const closeDBConnection = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ Database connection closed gracefully');
    return true;
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
    return false;
  }
};

module.exports = {
  connectDB,
  checkDBHealth,
  closeDBConnection
};
