const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('должен успешно зарегистрировать нового пользователя', async () => {
      const userData = {
        name: 'Тестовый Пользователь',
        email: 'test@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Пользователь успешно зарегистрирован');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data).toHaveProperty('token');
    });

    it('должен вернуть ошибку при регистрации с существующим email', async () => {
      // Сначала создаем пользователя
      await User.create({
        name: 'Существующий Пользователь',
        email: 'existing@example.com',
        password: 'Password123'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Новый Пользователь',
          email: 'existing@example.com',
          password: 'Password123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Пользователь с таким email уже существует');
    });

    it('должен вернуть ошибку при невалидных данных', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: '',
          email: 'invalid-email',
          password: '123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Создаем тестового пользователя перед каждым тестом входа
      await User.create({
        name: 'Тестовый Пользователь',
        email: 'test@example.com',
        password: 'Password123'
      });
    });

    it('должен успешно войти с правильными credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Вход выполнен успешно');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data).toHaveProperty('token');
    });

    it('должен вернуть ошибку при неправильном пароле', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Неверный email или пароль');
    });

    it('должен вернуть ошибку при несуществующем email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Неверный email или пароль');
    });
  });

  describe('GET /api/auth/me', () => {
    let token;
    let user;

    beforeEach(async () => {
      // Создаем пользователя и получаем токен
      user = await User.create({
        name: 'Тестовый Пользователь',
        email: 'test@example.com',
        password: 'Password123'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        });

      token = loginResponse.body.data.token;
    });

    it('должен вернуть информацию о текущем пользователе', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(user._id.toString());
      expect(response.body.data.user.name).toBe(user.name);
      expect(response.body.data.user.email).toBe(user.email);
    });

    it('должен вернуть ошибку без токена', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Не авторизован, токен отсутствует');
    });

    it('должен вернуть ошибку с невалидным токеном', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Не авторизован, токен недействителен');
    });
  });
});
