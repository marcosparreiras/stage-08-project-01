const { verify } = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const authConfig = require('../config/auth');

function ensureAuth(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new AppError('JWT não informado', 401);
    }
    const token = authHeader.split(' ')[1];
    try {
        const { sub: user_id } = verify(token, authConfig.jwt.secret);
        req.user = { id: Number(user_id) };
        return next();
    } catch (_error) {
        throw new AppError('JWT inválido', 401);
    }
}

module.exports = ensureAuth;
