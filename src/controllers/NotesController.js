const knex = require('../database/knex');
const AppError = require('../utils/AppError');

class NotesControlles {
    /* 
        1. index - GET para listar vários registros
        2. show - GET para exibir um registro especifico
        3. create - POST para criar um registro
        4. update - PUT para atualizar um registro
        5. delete - DELETE para apagar um regsitro
    */
    async index(req, res) {
        const { title, tags } = req.query;
        const { id: user_id } = req.user;
        if (!user_id) {
            throw new AppError('Necessário passar o user_id');
        }

        let notes;
        if (!title && !tags) {
            notes = await knex('notes').where({ user_id }).orderBy('title');
        } else {
            if (tags) {
                const filterTags = tags.split(',').map((tag) => tag.trim());
                notes = await knex('tags')
                    .select(['notes.id', 'notes.title', 'notes.user_id'])
                    .where('notes.user_id', user_id)
                    .whereLike('notes.title', `%${title}%`)
                    .whereIn('tags.name', filterTags)
                    .innerJoin('notes', 'notes.id', 'tags.note_id')
                    .orderBy('notes.title')
                    .groupBy('notes.id');
            } else {
                notes = await knex('notes')
                    .where({ user_id })
                    .whereLike('title', `%${title}%`)
                    .orderBy('title');
            }
        }
        const userTags = await knex('tags').where({ user_id });
        const notesWithTags = notes.map((note) => {
            const noteTags = userTags.filter((tag) => tag.note_id === note.id);
            return {
                ...note,
                tags: noteTags,
            };
        });

        res.status(200).json(notesWithTags);
    }

    async show(req, res) {
        const { id } = req.params;
        const note = await knex('notes').where({ id }).first();
        const tags = await knex('tags').where({ note_id: id }).orderBy('name');
        const links = await knex('links')
            .where({ note_id: id })
            .orderBy('created_at');
        if (!note) {
            throw new AppError('Nota não encontrada');
        }

        res.status(200).json({ ...note, tags, links });
    }

    async create(req, res) {
        const { title, description, tags, links } = req.body;
        const { id: user_id } = req.user;

        const [note_id] = await knex('notes').insert({
            title,
            description,
            user_id,
        });

        if (links && links.length > 0) {
            const linksInsert = links.map((url) => ({ note_id, url }));
            await knex('links').insert(linksInsert);
        }

        if (tags && tags.length > 0) {
            const tagsInsert = tags.map((name) => ({ note_id, user_id, name }));
            await knex('tags').insert(tagsInsert);
        }

        res.status(201).json({ success: true });
    }

    async delete(req, res) {
        const { id } = req.params;
        await knex('notes').where({ id }).delete();
        res.status(202).json({ success: true });
    }
}

module.exports = NotesControlles;
