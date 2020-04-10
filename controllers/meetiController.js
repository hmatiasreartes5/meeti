const Grupos = require('../models/Grupos');

//formulario para nuevo meeti
exports.formNuevoMeeti = async (req,res) => {
    const grupos = await Grupos.findAll({where: {usuarioId: req.user.id}});
    res.render('nuevo-meeti',{
        nombrePagina: 'Crea un nuevo Meeti',
        grupos
    });
}