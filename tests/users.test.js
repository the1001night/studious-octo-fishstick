const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('User Routes', () => {
  let adminToken;
  let userToken;
  let regularUser;
  let adminUser;

  beforeEach(async () => {
    // Создаем обычного пользователя
    regularUser = await User.create({
      name: 'Обычный Пользователь',
      email: 'user@example.com',
      password: 'Password123',
      role: 'user'
    });

    // Создаем админа
    adminUser = await User.create({
      name: 'Админ',
      email: 'admin@example.com',
      password: 'Password123',
      role: 'admin'
    });

    // Получаем токены
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'Password123' });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'Password123' });

    userToken = userLogin.body.data.token;
    adminToken = adminLogin.body.data.token;
  });

  describe('GET /api/users (только админ)', () => {
    it('админ должен получить список всех пользователей', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body).toHaveProperty('count');
    });

    it('обычный пользователь не должен получить доступ', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Доступ запрещен, требуются права администратора');
    });

    it('неавторизованный запрос должен быть отклонен', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id (только админ)', () => {
    it('админ должен получить пользователя по ID', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(regularUser.name);
      expect(response.body.data.email).toBe(regularUser.email);
    });

    it('админ должен получить 404 для несуществующего пользователя', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Пользователь не найден');
    });

    it('обычный пользователь не должен получить доступ', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('пользователь должен обновить свой профиль', async () => {
      const updateData = {
        name: 'Обновленное Имя',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Профиль обновлен успешно');
      expect(response.body.data.user.name).toBe(updateData.name);
      expect(response.body.data.user.email).toBe(updateData.email);
    });

    it('должен вернуть ошибку при обновлении с существующим email', async () => {
      // Создаем еще одного пользователя
      await User.create({
        name: 'Другой Пользователь',
        email: 'other@example.com',
        password: 'password123'
      });

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ email: 'other@example.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email уже используется другим пользователем');
    });
  });

  describe('PUT /api/users/change-password', () => {
    it('пользователь должен изменить пароль', async () => {
      const passwordData = {
        currentPassword: 'Password123',
        newPassword: 'NewPassword123'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Пароль изменен успешно');
    });

    it('должен вернуть ошибку при неправильном текущем пароле', async () => {
      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'NewPassword123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Текущий пароль неверный');
    });
  });

  describe('DELETE /api/users/:id (только админ)', () => {
    it('админ должен удалить пользователя', async () => {
      const response = await request(app)
        .delete(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Пользователь удален успешно');

      // Проверяем что пользователь действительно удален
      const deletedUser = await User.findById(regularUser._id);
      expect(deletedUser).toBeNull();
    });

    it('админ не должен удалить самого себя', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Нельзя удалить свой собственный аккаунт');
    });

    it('обычный пользователь не должен удалить кого-либо', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
