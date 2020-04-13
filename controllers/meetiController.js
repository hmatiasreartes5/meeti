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

//formulario para editar meeti
exports.formEditarMeeti = async (req,res,next) => {
    const consultas = [];
    consultas.push(Grupos.findAll({where: {usuarioId: req.user.id}}));
    consultas.push(Meeti.findByPk(req.params.id));

    const [grupos , meeti] = await Promise.all(consultas);

    if(!grupos || !meeti){
        req.flash('error','Operacion no valida');
        res.redirect('/administracion');
        return next();
    }

    res.render('editar-meeti',{
        nombrePagina: `Editar Meeti: ${meeti.titulo}`,
        grupos,
        meeti
    })
}

//editar meeti 
exports.editarMeeti = async (req,res,next) => {
    const meeti = await Meeti.findOne({where: { id: req.params.id, usuarioId: req.user.id}});

    if(!meeti){
        req.flash('error','Operacion no valida'),
        res.redirect('/administracion');
        return next();
    }

    const {grupoId,titulo,invitado,fecha,hora,cupo,descripcion,direccion,ciudad,estado,pais} = req.body;

    meeti.grupoId= grupoId;
    meeti.titulo= titulo;
    meeti.invitado= invitado;
    meeti.fecha= fecha;
    meeti.hora= hora;
    meeti.cupo= cupo;
    meeti.descripcion= descripcion;
    meeti.direccion= direccion;
    meeti.ciudad= ciudad;
    meeti.estado= estado;
    meeti.pais= pais;

    //almaceno los cambios en la DB
    await meeti.save()
    req.flash('exito','Cambios Guardados Correctamente');
    res.redirect('/administracion');
}

//formulario para eliminar un meeti
exports.formEliminarMeeti = async (req,res,next) => {
    const meeti = await Meeti.findOne({where: {id:req.params.id, usuarioId: req.user.id}});

    if(!meeti){
        req.flash('error','Se produjo un error al eliminar el meeti');
        req.redirect('/administracion');
        return next();
    }

    res.render('eliminar-meeti',{
        nombrePagina: `Eliminar Meeti: ${meeti.titulo}`,
    })
}

//Eliminar Meeti
exports.eliminarMeeti = async (req,res,next) => {
    const meeti = await Meeti.findOne({where: {id:req.params.id, usuarioId: req.user.id}});

    if(!meeti){
        req.flash('error','Se produjo un error al eliminar el meeti');
        req.redirect('/administracion');
        return next();
    }

    await Meeti.destroy({
        where: {
            id: req.params.id
        }
    })

    //redireccionar al inicio
    req.flash('exito','Meeti eliminado correctamente');
    res.redirect('/administracion');
    
}
