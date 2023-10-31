const knex = require('../database/knex');
const AppError = require('../utils/AppError');
const { compare } = require('bcryptjs');
const authConfig = require('../config/auth');
const { sign } = require('jsonwebtoken');

class SessionController {
    async create(req, res) {
        const { email, password } = req.body;

        const user = await knex('users').where({ email }).first();
        if (!user) {
            throw new AppError('E-mail e/ou senha incorreta', 401);
        }
        const passwordMatched = await compare(password, user.password);
        if (!passwordMatched) {
            throw new AppError('E-mail e/ou senha incorreta', 401);
        }

        const { secret, expiresIn } = authConfig.jwt;
        const token = sign({}, secret, {
            subject: String(user.id),
            expiresIn,
        });

        delete user.password;

        return res.status(200).json({ user, token });
    }
}

module.exports = SessionController;
