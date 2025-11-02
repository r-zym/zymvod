class AuthSystem {
    constructor() {
        this.initializeDefaultUsers();
    }

    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'salt_zymvod_2025');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async initializeDefaultUsers() {
        const users = JSON.parse(localStorage.getItem('zymvod_users')) || {};
        const adminUsers = JSON.parse(localStorage.getItem('zymvod_admin_users')) || {};
        
        if (Object.keys(users).length === 0) {
            users['1user'] = await this.hashPassword('qwerty123!');
            localStorage.setItem('zymvod_users', JSON.stringify(users));
        }
        
        if (Object.keys(adminUsers).length === 0) {
            adminUsers['1admin'] = await this.hashPassword('qwerty123!');
            localStorage.setItem('zymvod_admin_users', JSON.stringify(adminUsers));
        }
    }

    async verifyUser(username, password) {
        const users = JSON.parse(localStorage.getItem('zymvod_users')) || {};
        const hashedPassword = await this.hashPassword(password);
        return users[username] === hashedPassword;
    }

    async verifyAdmin(username, password) {
        const adminUsers = JSON.parse(localStorage.getItem('zymvod_admin_users')) || {};
        const hashedPassword = await this.hashPassword(password);
        return adminUsers[username] === hashedPassword;
    }

    async addUser(username, password) {
        const users = JSON.parse(localStorage.getItem('zymvod_users')) || {};
        users[username] = await this.hashPassword(password);
        localStorage.setItem('zymvod_users', JSON.stringify(users));
    }

    async addAdmin(username, password) {
        const adminUsers = JSON.parse(localStorage.getItem('zymvod_admin_users')) || {};
        adminUsers[username] = await this.hashPassword(password);
        localStorage.setItem('zymvod_admin_users', JSON.stringify(adminUsers));
    }

    deleteUser(username) {
        const users = JSON.parse(localStorage.getItem('zymvod_users')) || {};
        delete users[username];
        localStorage.setItem('zymvod_users', JSON.stringify(users));
    }

    deleteAdmin(username) {
        const adminUsers = JSON.parse(localStorage.getItem('zymvod_admin_users')) || {};
        delete adminUsers[username];
        localStorage.setItem('zymvod_admin_users', JSON.stringify(adminUsers));
    }

    getUsers() {
        const users = JSON.parse(localStorage.getItem('zymvod_users')) || {};
        return Object.keys(users);
    }

    getAdmins() {
        const adminUsers = JSON.parse(localStorage.getItem('zymvod_admin_users')) || {};
        return Object.keys(adminUsers);
    }
}

const authSystem = new AuthSystem();