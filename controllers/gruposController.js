const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');

exports.formNuevoGrupo = async (req,res) => {
    const categorias = await Categorias.findAll();
    res.render('nuevo-grupo',{
        nombrePagina: 'Crea un nuevo Grupo',
        categorias
    })
}

exports.crearGrupo = async (req,res) => {

    req.sanitizeBody('nombre');
    req.sanitizeBody('url');

    const grupo = req.body;
    grupo.usuarioId = req.user.id;
    try {
        await Grupos.create(grupo);
        req.flash('exito','Se ah creado el grupo');
        res.redirect('/administracion');
    } catch (error) {
        const erroresSequilize = error.errors.map(err => err.message);
        req.flash('error',erroresSequilize);
        res.redirect('/nuevo-grupo');
    }
}
