const request = require('supertest');
const app = require('../server');

describe('Health Check Routes', () => {
  describe('GET /api/health/server', () => {
    it('должен вернуть информацию о сервере', async () => {
      const response = await request(app)
        .get('/api/health/server')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.server).toBeDefined();
      expect(response.body.server).toHaveProperty('status', 'healthy');
      expect(response.body.server).toHaveProperty('uptime');
      expect(response.body.server).toHaveProperty('memory');
      expect(response.body.server).toHaveProperty('version');
      expect(response.body.server).toHaveProperty('platform');
      expect(response.body.server).toHaveProperty('node_env');
    });

    it('uptime должен быть числом больше 0', async () => {
      const response = await request(app)
        .get('/api/health/server')
        .expect(200);

      expect(typeof response.body.server.uptime).toBe('number');
      expect(response.body.server.uptime).toBeGreaterThan(0);
    });

    it('memory должен содержать корректные поля', async () => {
      const response = await request(app)
        .get('/api/health/server')
        .expect(200);

      const memory = response.body.server.memory;
      expect(memory).toHaveProperty('rss');
      expect(memory).toHaveProperty('heapTotal');
      expect(memory).toHaveProperty('heapUsed');
      expect(memory).toHaveProperty('external');
    });
  });

  describe('GET /api/health/db', () => {
    it('должен вернуть статус базы данных', async () => {
      const response = await request(app)
        .get('/api/health/db')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.database).toBeDefined();
      expect(response.body.database).toHaveProperty('status');
      expect(response.body.database).toHaveProperty('connected');
      expect(response.body.database).toHaveProperty('connectionState');
    });

    it('должен показать статус healthy когда БД подключена', async () => {
      const response = await request(app)
        .get('/api/health/db')
        .expect(200);

      expect(response.body.database.connected).toBe(true);
      expect(response.body.database.status).toBe('healthy');
    });

    it('должен показать количество пользователей', async () => {
      const response = await request(app)
        .get('/api/health/db')
        .expect(200);

      expect(response.body.database).toHaveProperty('userCount');
      expect(typeof response.body.database.userCount).toBe('number');
    });
  });

  describe('GET /', () => {
    it('должен вернуть информацию об API', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('API работает!');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');

      // Проверяем структуру эндпоинтов
      expect(response.body.endpoints).toHaveProperty('auth');
      expect(response.body.endpoints).toHaveProperty('users');
      expect(response.body.endpoints).toHaveProperty('health');
    });

    it('должен содержать все необходимые эндпоинты', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      const endpoints = response.body.endpoints;

      // Проверяем auth эндпоинты
      expect(endpoints.auth).toHaveProperty('register');
      expect(endpoints.auth).toHaveProperty('login');
      expect(endpoints.auth).toHaveProperty('me');
      expect(endpoints.auth).toHaveProperty('logout');

      // Проверяем users эндпоинты
      expect(endpoints.users).toHaveProperty('getAll');
      expect(endpoints.users).toHaveProperty('getById');
      expect(endpoints.users).toHaveProperty('updateProfile');
      expect(endpoints.users).toHaveProperty('changePassword');
      expect(endpoints.users).toHaveProperty('delete');

      // Проверяем health эндпоинты
      expect(endpoints.health).toHaveProperty('db');
      expect(endpoints.health).toHaveProperty('server');
    });
  });
});
