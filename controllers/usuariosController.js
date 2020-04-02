const Usuarios = require('../models/Usuarios')

exports.formCrearCuenta = (req,res) => {
    res.render('crear-cuenta',{
        nombrePagina: 'Crear Cuenta'
    })
}

exports.crearNuevoUsuario = (req,res) => {
    const usuario = req.body;

    console.log('LO QUE RECIBO DEL REQUEST',usuario);
    const nuevoUsuario = Usuarios.create(usuario);

    console.log('Usuario Creado',nuevoUsuario);
}