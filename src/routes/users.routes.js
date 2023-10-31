const { Router } = require('express');
const multer = require('multer');
const uploadConfig = require('../config/upload');
const UsersController = require('../controllers/UsersController');
const UserAvatarController = require('../controllers/UserAvatarController');
const ensureAuth = require('../middlewares/ensureAuth');

const usersRoutes = Router();
const usersController = new UsersController();
const userAvatarController = new UserAvatarController();
const upload = multer(uploadConfig.MULTER);

usersRoutes.post('/', usersController.create);
usersRoutes.put('/', ensureAuth, usersController.update);
usersRoutes.patch(
    '/avatar',
    ensureAuth,
    upload.single('avatar'),
    userAvatarController.update
);

module.exports = usersRoutes;
