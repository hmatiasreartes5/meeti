const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter = {
    limits : { fileSize : 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname+'/../public/uploads/grupos/');
        },
        filename : (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    }), 
    fileFilter(req, file, next) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            //el formato es valido
            next(null, true);
        } else {
            // el formato no es valido
            next(new Error('Formato no válido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

// sube imagen en el servidor
exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El Archivo es muy grande')
                } else {
                    req.flash('error', error.message);
                }
            } else if(error.hasOwnProperty('message')) {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        } else {
            next();
        }
    })
}

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

    if(req.file){
        grupo.imagen = req.file.filename;
    }
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

exports.formEditarGrupo = async (req,res) => {

    /* ESTA FORMA DE CONSULTAR ES CORRECTA, SOLO QUE NO ES BUENA PRACTICA PONER DOS VECES AWAIT EN ESTE
       CASO PORQUE CATEGORIAS NO DEPENDE DE LA INFORMACION QUE SE TRAE EN GRUPOS, SI HUBIERA  UNA DEPENDENCIA
       SI SERIA CORRECTO, LO CORRECTO SERIA HACERLO CON PROMISES
    const grupo = await Grupos.findByPk(req.params.grupoId);
    const categorias = await Categorias.findAll();*/

    const consultas = [];
    consultas.push(Grupos.findByPk(req.params.grupoId));
    consultas.push(Categorias.findAll());

    //PROMISE CON AWAIT, TODAS LAS CONSULTAS INICIAN AL MISMO TIEMPO SIN LA NECESIDAD QUE UNA BLOQUEE 
    //A OTRA, SE PUEDEN HACER MULTIPLES CONSULTAS
    const [grupo,categorias]= await Promise.all(consultas);

    res.render('editar-grupo',{
        nombrePagina: `Editar Grupo: ${grupo.nombre}`,
        grupo,
        categorias
    })
}

exports.editarGrupo = async (req,res,next) => {
    const grupo = await Grupos.findOne({where: {id: req.params.grupoId,
                                                usuarioId: req.user.id }});
    
    //si el grupo no existe o no es el dueño correspondiente
    if(!grupo){
        req.flash('error','Operacion no valida'),
        res.redirect('/administracion');
        return next()
    }

    //si esta todo OK
    const {nombre, descripcion, categoriaId, url} = req.body;
    grupo.nombre= nombre;
    grupo.descripcion= descripcion;
    grupo.categoriaId= categoriaId;
    grupo.url= url

    //actualizamos en la DB
    await grupo.save();
    req.flash('exito','Cambios almacenados correctamente');
    res.redirect('/administracion');

}

//Muestra el formulario para editar una imagen
exports.formEditarImagen = async (req,res) => {
    const grupo = await Grupos.findByPk(req.params.grupoId);

    res.render('imagen-grupo',{
        nombrePagina: `Editar Imagen Grupo: ${grupo.nombre}`,
        grupo
    })
}

//modifica la imagen en la DB y elimina la anterior
exports.editarImagen = async (req,res,next) => {
    const grupo = await Grupos.findOne({where: { id: req.params.grupoId, usuarioId: req.user.id}});

    //si el grupo no existe
    if(!grupo){
        req.flash('error','Operacion no valida');
        res.redirect('/iniciar-sesion');
        return next()
    }

// verificar que el archivo sea nuevo
    // if(req.file) {
    //     console.log(req.file.filename);
    // }

    // // revisar que exista un archivo anterior
    // if(grupo.imagen) {
    //     console.log(grupo.imagen);
    // }

    // Si hay imagen anterior y nueva, significa que vamos a borrar la anterior
    if(req.file && grupo.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

        // eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error) {
                console.log(error);
            }
            return;
        })
    }

    // Si hay una imagen nueva, la guardamos
    if(req.file) {
        grupo.imagen = req.file.filename;
    }

    // guardar en la BD
    await grupo.save();
    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/administracion');
}

exports.formEliminarGrupo = async (req,res,next) => {
    const grupo = await Grupos.findOne({where: {id: req.params.grupoId, usuarioId: req.user.id}});

    //si no existe el grupo
    if(!grupo){
        req.flash('error','Operacion no valida');
        res.redirect('/administracion');
        return next();
    }

    //todo bien 
    res.render('eliminar-grupo',{
        nombrePagina: `Eliminar Grupo: ${grupo.nombre}`
    })
}

//Eliminar el grupo e imagen
exports.eliminarGrupo = async (req,res,next) => {
    const grupo = await Grupos.findOne({where: {id: req.params.grupoId, usuarioId: req.user.id}});

    //si no existe el grupo
    if(!grupo){
        req.flash('error','Operacion no valida');
        res.redirect('/administracion');
        return next();
    }

    //elimino la imagen
    if(grupo.imagen){
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

        // eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error) {
                console.log(error);
            }
            return;
        })
    }

    //elimino el grupo
    await Grupos.destroy({
        where: {
            id: req.params.grupoId
        }
    })

    //redireccionar al usuario
    req.flash('exito','Grupo Eliminado');
    res.redirect('/administracion');
}