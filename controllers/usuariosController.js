const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/emails');

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

    req.checkBody('confirmar','Este campo no puede ir vacio').notEmpty();
    req.checkBody('confirmar','Los password deben ser iguales').equals(req.body.password);

    //Leer los errores de express
    const erroresExpress = req.validationErrors();
    //console.log(erroresExpress);

    try {
        //console.log('LO QUE RECIBO DEL REQUEST',usuario);
        await Usuarios.create(usuario);

        //URL de confirmacion
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

        //Enviar email de confirmacion
        await enviarEmail.enviarEmail({
            usuario,
            url,
            subject: 'Confirma tu cuenta de Meeti',
            archivo: 'confirmar-cuenta'
        })
    
        req.flash('exito','Hemos enviado un email, confirma tu cuenta');
        res.redirect('/iniciar-sesion');
        //console.log('Usuario Creado',nuevoUsuario);
    } catch (error) {
        const erroresSequilize = error.errors.map(err => err.message);
        //console.log(erroresSequilize);

        const errExpress = erroresExpress.map(err => err.msg);
        
        const listaErrores = [...erroresSequilize, ...errExpress];
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