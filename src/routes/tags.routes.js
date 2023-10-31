const { Router } = require('express');
const TagsController = require('../controllers/TagsController');
const ensureAuth = require('../middlewares/ensureAuth');

const tagsRoutes = Router();
const tagsController = new TagsController();

tagsRoutes.get('/', ensureAuth, tagsController.index);

module.exports = tagsRoutes;
