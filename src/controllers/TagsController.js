const knex = require('../database/knex');

class TagsController {
    /* 
        1. index - GET para listar vários registros
        2. show - GET para exibir um registro especifico
        3. create - POST para criar um registro
        4. update - PUT para atualizar um registro
        5. delete - DELETE para apagar um regsitro
    */
    async index(req, res) {
        const { id: user_id } = req.user;
        const tags = await knex('tags').where({ user_id });
        res.status(200).json({ tags });
    }
}

module.exports = TagsController;
