/**
 * Auth Module - Управление аутентификацией пользователей
 */

const Auth = (function() {
    // Ключи для localStorage
    const STORAGE_KEYS = {
        USER: 'arched_user',
        TOKEN: 'arched_token',
        USERS: 'arched_users_db',
        REMEMBER: 'arched_remember'
    };

    /**
     * Инициализация базы данных пользователей (демо)
     */
    function initUsersDB() {
        if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
            const defaultUsers = [
                {
                    id: 1,
                    email: 'demo@archedu.kz',
                    username: 'demo_user',
                    firstName: 'Демо',
                    lastName: 'Пользователь',
                    password: btoa('demo123456'),
                    role: 'student',
                    createdAt: new Date().toISOString(),
                    avatar: null,
                    progress: {}
                },
                {
                    id: 2,
                    email: 'admin@archedu.kz',
                    username: 'admin',
                    firstName: 'Админ',
                    lastName: 'Системы',
                    password: btoa('admin123456'),
                    role: 'admin',
                    createdAt: new Date().toISOString(),
                    avatar: null,
                    progress: {}
                }
            ];
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
        }
    }

    /**
     * Получить всех пользователей
     */
    function getUsers() {
        initUsersDB();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    }

    /**
     * Сохранить пользователей
     */
    function saveUsers(users) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    /**
     * Регистрация нового пользователя
     */
    async function register(userData) {
        try {
            const { email, username, password, firstName, lastName } = userData;
            
            // Валидация
            if (!email || !username || !password || !firstName || !lastName) {
                return { success: false, error: 'Все поля обязательны для заполнения' };
            }
            
            if (password.length < 8) {
                return { success: false, error: 'Пароль должен содержать минимум 8 символов' };
            }
            
            const users = getUsers();
            
            // Проверка уникальности email
            if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
                return { success: false, error: 'Пользователь с таким email уже существует' };
            }
            
            // Проверка уникальности username
            if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
                return { success: false, error: 'Имя пользователя уже занято' };
            }
            
            // Создание нового пользователя
            const newUser = {
                id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
                email: email.toLowerCase(),
                username,
                firstName,
                lastName,
                password: btoa(password), // В реальном проекте использовать хеширование!
                role: 'student',
                createdAt: new Date().toISOString(),
                avatar: null,
                progress: {},
                settings: {
                    language: 'ru',
                    theme: 'dark',
                    notifications: true
                }
            };
            
            users.push(newUser);
            saveUsers(users);
            
            return { success: true, user: sanitizeUser(newUser) };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Ошибка при регистрации' };
        }
    }

    /**
     * Вход пользователя
     */
    async function login(email, password, remember = false) {
        try {
            const users = getUsers();
            const user = users.find(u => 
                u.email.toLowerCase() === email.toLowerCase() && 
                u.password === btoa(password)
            );
            
            if (!user) {
                return { success: false, error: 'Неверный email или пароль' };
            }
            
            // Создание сессии
            const token = generateToken(user.id);
            const sessionUser = sanitizeUser(user);
            
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(sessionUser));
            localStorage.setItem(STORAGE_KEYS.TOKEN, token);
            
            if (remember) {
                localStorage.setItem(STORAGE_KEYS.REMEMBER, 'true');
            }
            
            // Обновление времени последнего входа
            user.lastLogin = new Date().toISOString();
            saveUsers(users);
            
            return { success: true, user: sessionUser };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Ошибка при входе' };
        }
    }

    /**
     * Выход пользователя
     */
    function logout() {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REMEMBER);
        
        // Редирект на главную
        window.location.href = '/index.html';
    }

    /**
     * Проверка авторизации
     */
    function isAuthenticated() {
        const user = localStorage.getItem(STORAGE_KEYS.USER);
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        return !!(user && token);
    }

    /**
     * Получение текущего пользователя
     */
    function getCurrentUser() {
        try {
            const userJson = localStorage.getItem(STORAGE_KEYS.USER);
            return userJson ? JSON.parse(userJson) : null;
        } catch {
            return null;
        }
    }

    /**
     * Обновление данных пользователя
     */
    function updateUser(updates) {
        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false, error: 'Пользователь не авторизован' };
        
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex === -1) {
            return { success: false, error: 'Пользователь не найден' };
        }
        
        // Обновление данных
        users[userIndex] = { ...users[userIndex], ...updates };
        saveUsers(users);
        
        // Обновление сессии
        const updatedUser = sanitizeUser(users[userIndex]);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        
        return { success: true, user: updatedUser };
    }

    /**
     * Социальный вход (заглушка)
     */
    async function socialLogin(provider) {
        // В реальном проекте здесь будет OAuth flow
        console.log(`Social login with ${provider}`);
        
        // Демо-режим
        const demoUser = {
            id: 999,
            email: `${provider}_user@demo.com`,
            username: `${provider}_user`,
            firstName: provider.charAt(0).toUpperCase() + provider.slice(1),
            lastName: 'User',
            role: 'student',
            avatar: null
        };
        
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));
        localStorage.setItem(STORAGE_KEYS.TOKEN, generateToken(demoUser.id));
        
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 500);
        
        return { success: true };
    }

    /**
     * Проверка доступа к курсу
     */
    function canAccessCourse(courseId) {
        const user = getCurrentUser();
        if (!user) return false;
        
        // Админ имеет доступ ко всему
        if (user.role === 'admin') return true;
        
        // Проверка прогресса (если нужно разблокировать по порядку)
        const progress = user.progress || {};
        const courseProgress = progress[courseId] || {};
        
        return true; // Пока даем доступ ко всем курсам
    }

    /**
     * Проверка доступа к модулю
     */
    function canAccessModule(courseId, moduleId) {
        const user = getCurrentUser();
        if (!user) return false;
        
        if (user.role === 'admin') return true;
        
        // Можно добавить логику последовательного доступа
        return true;
    }

    /**
     * Сохранение прогресса
     */
    function saveProgress(courseId, moduleId, data) {
        const user = getCurrentUser();
        if (!user) return false;
        
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        
        if (userIndex === -1) return false;
        
        if (!users[userIndex].progress) {
            users[userIndex].progress = {};
        }
        
        if (!users[userIndex].progress[courseId]) {
            users[userIndex].progress[courseId] = {};
        }
        
        users[userIndex].progress[courseId][moduleId] = {
            ...data,
            lastAccessed: new Date().toISOString()
        };
        
        saveUsers(users);
        
        // Обновление сессии
        const updatedUser = sanitizeUser(users[userIndex]);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        
        return true;
    }

    /**
     * Получение прогресса
     */
    function getProgress(courseId, moduleId = null) {
        const user = getCurrentUser();
        if (!user) return null;
        
        const progress = user.progress || {};
        
        if (moduleId) {
            return progress[courseId]?.[moduleId] || null;
        }
        
        return progress[courseId] || {};
    }

    // ===== Вспомогательные функции =====
    
    function generateToken(userId) {
        return btoa(`${userId}:${Date.now()}:${Math.random()}`);
    }
    
    function sanitizeUser(user) {
        const { password, ...safeUser } = user;
        return safeUser;
    }

    // ===== Административные функции =====
    
    /**
     * Получение всех пользователей (только для админа)
     */
    function getAllUsers() {
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            return { success: false, error: 'Доступ запрещен' };
        }
        
        const users = getUsers();
        return { 
            success: true, 
            users: users.map(u => sanitizeUser(u))
        };
    }

    /**
     * Изменение роли пользователя (только для админа)
     */
    function changeUserRole(userId, newRole) {
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            return { success: false, error: 'Доступ запрещен' };
        }
        
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return { success: false, error: 'Пользователь не найден' };
        }
        
        users[userIndex].role = newRole;
        saveUsers(users);
        
        return { success: true };
    }

    /**
     * Удаление пользователя (только для админа)
     */
    function deleteUser(userId) {
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            return { success: false, error: 'Доступ запрещен' };
        }
        
        if (currentUser.id === userId) {
            return { success: false, error: 'Нельзя удалить самого себя' };
        }
        
        let users = getUsers();
        users = users.filter(u => u.id !== userId);
        saveUsers(users);
        
        return { success: true };
    }

    // Инициализация при загрузке
    initUsersDB();

    // Публичный API
    return {
        register,
        login,
        logout,
        isAuthenticated,
        getCurrentUser,
        updateUser,
        socialLogin,
        canAccessCourse,
        canAccessModule,
        saveProgress,
        getProgress,
        getAllUsers,
        changeUserRole,
        deleteUser
    };
})();

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}