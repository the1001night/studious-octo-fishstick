const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Setup перед всеми тестами
beforeAll(async () => {
  // Останавливаем существующее подключение если оно есть
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Запускаем in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Подключаемся к тестовой БД
  await mongoose.connect(mongoUri);
});

// Cleanup после всех тестов
afterAll(async () => {
  // Закрываем соединение и останавливаем сервер
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Очищаем все коллекции перед каждым тестом
beforeEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});
