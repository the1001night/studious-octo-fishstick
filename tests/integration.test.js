const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Integration Tests - Полный пользовательский сценарий', () => {
  let userToken;
  let userId;
  let adminToken;

  describe('Сценарий 1: Регистрация → Вход → Обновление профиля → Выход', () => {
    it('Шаг 1: Регистрация нового пользователя', async () => {
      const userData = {
        name: 'Интеграционный Тест',
        email: 'integration@example.com',
        password: 'Integration123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();

      userToken = response.body.data.token;
      userId = response.body.data.user.id;
    });

    it('Шаг 2: Получение информации о себе', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(userId);
      expect(response.body.data.user.email).toBe('integration@example.com');
    });

    it('Шаг 3: Обновление профиля', async () => {
      const updateData = {
        name: 'Обновленный Интеграционный Тест',
        email: 'updated-integration@example.com'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe(updateData.name);
      expect(response.body.data.user.email).toBe(updateData.email);
    });

    it('Шаг 4: Изменение пароля', async () => {
      const passwordData = {
        currentPassword: 'Integration123',
        newPassword: 'NewIntegration123'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Пароль изменен успешно');
    });

    it('Шаг 5: Выход из системы', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Выход выполнен успешно');
    });

    it('Шаг 6: Проверка что токен больше не работает', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Не авторизован, токен недействителен');
    });
  });

  describe('Сценарий 2: Админские функции', () => {
    beforeAll(async () => {
      // Создаем админа для тестирования
      const adminData = {
        name: 'Администратор',
        email: 'admin@example.com',
        password: 'Admin123',
        role: 'admin'
      };

      const admin = await User.create(adminData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminData.email,
          password: adminData.password
        });

      adminToken = loginResponse.body.data.token;
    });

    it('Админ получает список всех пользователей', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('Админ получает конкретного пользователя', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('updated-integration@example.com');
    });
  });

  describe('Сценарий 3: Мониторинг здоровья системы', () => {
    it('Проверка здоровья сервера', async () => {
      const response = await request(app)
        .get('/api/health/server')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.server.status).toBe('healthy');
      expect(response.body.server.uptime).toBeGreaterThan(0);
    });

    it('Проверка здоровья базы данных', async () => {
      const response = await request(app)
        .get('/api/health/db')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.database.status).toBe('healthy');
      expect(response.body.database.connected).toBe(true);
    });

    it('Проверка главной страницы API', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('API работает!');
      expect(response.body.endpoints).toBeDefined();
    });
  });

  describe('Сценарий 4: Обработка ошибок', () => {
    it('404 ошибка для несуществующего маршрута', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('не найден');
    });

    it('Ошибка невалидного JSON', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{invalid json}')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Неверный JSON в теле запроса');
    });

    it('Неавторизованный доступ к защищенному маршруту', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Не авторизован, токен отсутствует');
    });
  });
});
