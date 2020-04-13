const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');

//formulario para nuevo meeti
exports.formNuevoMeeti = async (req,res) => {
    const grupos = await Grupos.findAll({where: {usuarioId: req.user.id}});
    res.render('nuevo-meeti',{
        nombrePagina: 'Crea un nuevo Meeti',
        grupos
    });
}

//Crear un meeti 
exports.crearMeeti = async (req,res) => {
    const meeti = req.body;
    meeti.usuarioId = req.user.id;

    //verifica si hay cupo
    if(req.body.cupo ===''){
        meeti.cupo= 0;
    }

    try {
        await Meeti.create(meeti);
        req.flash('exito','Se creo el meeti correctamente');
        res.redirect('/administracion')
    } catch (error) {
        const erroresSequilize = error.errors.map(err => err.message);
        req.flash('error',erroresSequilize);
        res.redirect('/nuevo-meeti');
    }
}

// sanitiza los meeti
exports.sanitizarMeeti = (req, res, next) => {
    req.sanitizeBody('titulo');
    req.sanitizeBody('invitado');
    req.sanitizeBody('cupo');
    req.sanitizeBody('fecha');
    req.sanitizeBody('hora');
    req.sanitizeBody('direccion');
    req.sanitizeBody('ciudad');
    req.sanitizeBody('estado');
    req.sanitizeBody('pais');
    req.sanitizeBody('grupoId');

    next();
}