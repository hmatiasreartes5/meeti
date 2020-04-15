const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/emails');

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter = {
    limits : { fileSize : 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname+'/../public/uploads/perfiles/');
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

exports.formCrearCuenta = (req,res) => {
    res.render('crear-cuenta',{
        nombrePagina: 'Crear Cuenta'
    })
}

//Formulario para iniciar sesion
exports.formIniciarSesion = (req,res) => {
    res.render('iniciar-sesion',{
        nombrePagina: 'Iniciar Sesion'
    })
}

exports.crearNuevoUsuario = async (req,res) => {
    const usuario = req.body;

    req.checkBody('confirmar', 'El password confirmado no puede ir vacio' ).notEmpty();
    req.checkBody('confirmar', 'El password es diferente').equals(req.body.password);

    // Leer los errores de express
    const erroresExpress = req.validationErrors();

    try {
        await Usuarios.create(usuario);

        // Url de confirmación
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

        // Enviar email de confirmación
        await enviarEmail.enviarEmail({
            usuario,
            url, 
            subject : 'Confirma tu cuenta de Meeti',
            archivo : 'confirmar-cuenta'
        });

        //Flash Message y redireccionar
        req.flash('exito', 'Hemos enviado un E-mail, confirma tu cuenta');
        res.redirect('/iniciar-sesion');
    } catch (error) {
        console.log(error);
        // extraer el message de los errores
        const erroresSequelize = error.errors.map(err => err.message);

        // extraer unicamente el msg de los errores
        const errExp = erroresExpress.map(err => err.msg);

        //unirlos
        const listaErrores = [...erroresSequelize, ...errExp];

        req.flash('error', listaErrores);
        res.redirect('/crear-cuenta');
    }
}

//Confirmar la cuenta del usuario
exports.confirmarCuenta = async (req,res,next) => {
    //verificar que el usuario existe
    const usuario = await Usuarios.findOne({where: {email: req.params.correo}});

    //si no existe redireccionar
    if(!usuario){
        req.flash('error','No existe esa cuenta');
        res.redirect('/crear-cuenta');
        return next()
    }

    //si existe confirmar cuenta del usuario y redirecionar
    usuario.activo = 1;
    await usuario.save();
    req.flash('exito','Cuenta confirmada, inicia sesion');
    res.redirect('/iniciar-sesion');
}

//formulario para editar el perfil del usuario
exports.formEditarPerfil = async(req,res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('editar-perfil',{
        nombrePagina: 'Editar Perfil',
        usuario
    })
}

//Editar perfil
exports.editarPerfil = async (req,res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    const {nombre,email} = req.body;
    usuario.nombre= nombre;
    usuario.email= email;

    await usuario.save();
    req.flash('exito','Perfil editado correctamente');
    res.redirect('/administracion');
}

//Formulario para cambiar el password
exports.formCambiarPassword = (req,res) => {
    res.render('cambiar-password',{
        nombrePagina: 'Cambia Tu Password'
    })
}

//Funcion para cambiar el password
exports.cambiarPassword = async (req,res,next) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //verificar que el password anterior sea correcto
    if(!usuario.validarPassword(req.body.anterior)){
        req.flash('error','Password anterior no es correcto');
        res.redirect('/administracion');
        return next();
    }

    //si el password es correcto, hashear el mismo
    const hash = usuario.hashPassword(req.body.nuevo)
    usuario.password = hash;
    await usuario.save();

    //redireccionar
    req.logout();
    req.flash('exito','Contraseña Modificada Correctamente, Inicia sesion de nuevo');
    res.redirect('/iniciar-sesion');
}

//formulario para cambiar la imagen del perfil
exports.formSubirImagenPerfil = async (req,res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('imagen-perfil',{
        nombrePagina: 'Modifica tu imagen de perfil',
        usuario
    })
}

// Guarda la imagen nueva, elimina la anterior ( si aplica ) y guarda el registro en la BD
exports.guardarImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    // si hay imagen anterior, eliminarla
    if(req.file && usuario.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`;

        // eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error) {
                console.log(error);
            }
            return;
        })
    }

    // almacenar la nueva imagen
    if(req.file) {
        usuario.imagen = req.file.filename;
    }

    // almacenar en la base de datos y redireccionar
    await usuario.save();
    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/administracion');
}