const knex = require('../database/knex');
const AppError = require('../utils/AppError');
const DiskStorage = require('../providers/DiskStorage');

class UserAvatarController {
    async update(req, res) {
        const { id } = req.user;
        const avatarFileName = req.file.filename;
        const diskStorage = new DiskStorage();
        const user = await knex('users').where({ id }).first();
        if (!user) {
            throw new AppError('Usuário não encontrado', 401);
        }
        if (user.avatar) {
            await diskStorage.deleteFile(user.avatar);
        }
        const fileName = await diskStorage.saveFile(avatarFileName);
        user.avatar = fileName;
        await knex('users').where({ id }).update(user);
        res.status(200).json({ avatar: avatarFileName });
    }
}

module.exports = UserAvatarController;
