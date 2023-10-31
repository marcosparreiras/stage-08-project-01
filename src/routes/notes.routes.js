const { Router } = require('express');
const NotesControlles = require('../controllers/NotesController');
const ensureAuth = require('../middlewares/ensureAuth');

const notesRoutes = Router();
const notesControlles = new NotesControlles();

notesRoutes.use(ensureAuth);
notesRoutes.get('/', notesControlles.index);
notesRoutes.post('/', notesControlles.create);
notesRoutes.get('/:id', notesControlles.show);
notesRoutes.delete('/:id', notesControlles.delete);

module.exports = notesRoutes;
