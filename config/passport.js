const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuarios = require('../models/Usuarios');

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email,password,next) => {
        //se ejecuta al llenar el formulario de inicio de sesion
        const usuario = await Usuarios.findOne({ where: {email:email, 
                                                         activo: 1 }});

        //si el usuario no existe
        if(!usuario) return next(null,false,{
            message: 'El usuario no existe'
        });

        //el usuario existe, comparar password
        const verificarPass = usuario.validarPassword(password);
        
        //si el password en incorrecto
        if(!verificarPass) return next(null,false,{
            message: 'Password Incorrecto'
        })

        //Password Correcto
        return next(null,usuario)

    }
));

passport.serializeUser(function(usuario,cb) {
    cb(null,usuario)
})

passport.deserializeUser(function(usuario,cb){
    cb(null,usuario)
})

module.exports = passport;