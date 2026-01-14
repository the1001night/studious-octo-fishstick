const constants = require('../config/constants');

// Unit тесты для функций которые не требуют БД
describe('Constants Configuration', () => {
  describe('HTTP Status Codes', () => {
    it('должен содержать правильные коды статусов', () => {
      expect(constants.HTTP_STATUS.OK).toBe(200);
      expect(constants.HTTP_STATUS.CREATED).toBe(201);
      expect(constants.HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(constants.HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(constants.HTTP_STATUS.FORBIDDEN).toBe(403);
      expect(constants.HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });
  });

  describe('User Roles', () => {
    it('должен содержать правильные роли пользователей', () => {
      expect(constants.USER_ROLES.USER).toBe('user');
      expect(constants.USER_ROLES.ADMIN).toBe('admin');
    });
  });

  describe('User Status', () => {
    it('должен содержать правильные статусы пользователей', () => {
      expect(constants.USER_STATUS.ACTIVE).toBe('active');
      expect(constants.USER_STATUS.INACTIVE).toBe('inactive');
      expect(constants.USER_STATUS.BANNED).toBe('banned');
    });
  });

  describe('API Configuration', () => {
    it('должен содержать правильную версию API', () => {
      expect(constants.API_VERSION).toBe('1.0.0');
    });

    it('должен содержать правильный префикс API', () => {
      expect(constants.API_PREFIX).toBe('/api');
    });
  });

  describe('Error Messages', () => {
    it('должен содержать стандартные сообщения об ошибках', () => {
      expect(constants.ERROR_MESSAGES.USER_NOT_FOUND).toBe('Пользователь не найден');
      expect(constants.ERROR_MESSAGES.INVALID_CREDENTIALS).toBe('Неверный email или пароль');
      expect(constants.ERROR_MESSAGES.UNAUTHORIZED).toBe('Не авторизован');
    });
  });

  describe('Success Messages', () => {
    it('должен содержать стандартные сообщения об успехе', () => {
      expect(constants.SUCCESS_MESSAGES.USER_REGISTERED).toBe('Пользователь успешно зарегистрирован');
      expect(constants.SUCCESS_MESSAGES.LOGIN_SUCCESSFUL).toBe('Вход выполнен успешно');
      expect(constants.SUCCESS_MESSAGES.PROFILE_UPDATED).toBe('Профиль обновлен успешно');
    });
  });
});

describe('Simple Math Operations', () => {
  it('должен правильно складывать числа', () => {
    expect(2 + 2).toBe(4);
    expect(10 + 5).toBe(15);
  });

  it('должен правильно вычитать числа', () => {
    expect(10 - 5).toBe(5);
    expect(20 - 8).toBe(12);
  });

  it('должен правильно умножать числа', () => {
    expect(3 * 4).toBe(12);
    expect(7 * 6).toBe(42);
  });
});

describe('String Operations', () => {
  it('должен правильно конкатенировать строки', () => {
    expect('Hello' + ' ' + 'World').toBe('Hello World');
    expect('Test'.concat('123')).toBe('Test123');
  });

  it('должен правильно проверять длину строки', () => {
    expect('hello'.length).toBe(5);
    expect(''.length).toBe(0);
    expect('привет'.length).toBe(6);
  });

  it('должен правильно проверять содержание подстроки', () => {
    expect('hello world'.includes('world')).toBe(true);
    expect('hello world'.includes('test')).toBe(false);
    expect('тестовая строка'.includes('тест')).toBe(true);
  });
});

describe('Array Operations', () => {
  it('должен правильно работать с массивами', () => {
    const arr = [1, 2, 3, 4, 5];

    expect(arr.length).toBe(5);
    expect(arr[0]).toBe(1);
    expect(arr[4]).toBe(5);
    expect(arr.includes(3)).toBe(true);
    expect(arr.includes(6)).toBe(false);
  });

  it('должен правильно фильтровать массивы', () => {
    const numbers = [1, 2, 3, 4, 5, 6];
    const evenNumbers = numbers.filter(num => num % 2 === 0);

    expect(evenNumbers).toEqual([2, 4, 6]);
    expect(evenNumbers.length).toBe(3);
  });

  it('должен правильно маппить массивы', () => {
    const numbers = [1, 2, 3];
    const doubled = numbers.map(num => num * 2);

    expect(doubled).toEqual([2, 4, 6]);
  });
});
