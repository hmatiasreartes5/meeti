const passport = require('passport');

exports.autenticarUsuario = passport.authenticate('local',{
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
})

exports.usuarioAutenticado = (req,res,next) => {
    //verificar si el usuario esta autenticado, si es asi adelante
    if(req.isAuthenticated()){
        return next()
    }

    //si no esta autenticado
    return res.redirect('/iniciar-sesion')

}