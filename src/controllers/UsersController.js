const { hash, compare } = require('bcryptjs');
const AppError = require('../utils/AppError');
const sqliteConnection = require('../database/sqlite');

class UsersController {
    /* 
        1. index - GET para listar vários registros
        2. show - GET para exibir um registro especifico
        3. create - POST para criar um registro
        4. update - PUT para atualizar um registro
        5. delete - DELETE para apagar um regsitro
    */
    async create(req, res) {
        const { name, email, password } = req.body;
        const database = await sqliteConnection();
        const checkUserExists = await database.get(
            'SELECT * FROM users WHERE email = (?)',
            [email]
        );
        if (checkUserExists) {
            throw new AppError('Email já em uso');
        }
        const hashedPassword = await hash(password, 8);
        await database.run(
            'INSERT INTO users(name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );
        res.status(201).json({ success: true });
    }

    async update(req, res) {
        const { name, email, password, old_password } = req.body;
        const { id } = req.user;
        const database = await sqliteConnection();
        const user = await database.get('SELECT * FROM users WHERE id = (?)', [
            id,
        ]);
        if (!user) {
            throw new AppError('Usuário não encontrado');
        }
        const userWithUpdatedEmail = await database.get(
            'SELECT * FROM users WHERE email = (?)',
            [email]
        );
        if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
            throw new AppError('Esse e-mail já esta em uso');
        }

        if (password && !old_password) {
            throw new AppError(
                'Você precisa informar a senha antiga para atualizar a sua senha'
            );
        }

        if (password && old_password) {
            const checkOldPassword = await compare(old_password, user.password);
            if (!checkOldPassword) {
                throw new AppError('Senha antiga inválida');
            }
            user.password = await hash(password, 8);
        }
        user.name = name ?? user.name;
        user.email = email ?? user.email;
        await database.run(
            "UPDATE users SET name = ?, email = ?, password = ?, updated_at = DATETIME('now') WHERE id = ?",
            [user.name, user.email, user.password, user.id]
        );
        delete user.password;
        res.status(200).json({ success: true, user });
    }
}

module.exports = UsersController;
