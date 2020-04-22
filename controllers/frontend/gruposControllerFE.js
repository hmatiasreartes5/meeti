const Grupos = require('../../models/Grupos');
const Meeti = require('../../models/Meeti');
const moment = require('moment');

exports.mostrarGrupo = async (req,res,next) => {
    const consulta = []

    consulta.push( Grupos.findOne({where: { id: req.params.id }}));
    consulta.push( Meeti.findAll({ where: { grupoId: req.params.id },
                                   order: [
                                       ['fecha','ASC']
                                   ]
    }));

    const [grupo, meetis] = await Promise.all(consulta);

    if(!grupo){
        res.redirect('/');
        return next()
    }

    res.render('mostrar-grupo',{
        nombrePagina: `Informacion del grupo: ${grupo.nombre}`,
        grupo,
        meetis,
        moment
    })
}