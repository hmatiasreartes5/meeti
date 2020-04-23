const Comentarios = require('../../models/Comentarios');
const Meeti = require('../../models/Meeti');

exports.agregarComentario = async (req,res,next) => {

    const {comentario} = req.body;
    console.log(req)

    await Comentarios.create({
        mensaje: comentario,
        usuarioId: req.user.id,
        meetiId: req.params.id
    });

    res.redirect('back');
    next();
}

exports.eliminarComentario = async (req,res,next) => {
    //obtener el id del comentario
    const {comentarioId} = req.body;

    const comentario = await Comentarios.findOne({where: { id : comentarioId}});

    if(!comentario){
        res.status(404).send('Accion no valido');
        return next();
    }

    //obtener el meeti al cual pertenece el comentario
    const meeti = await Meeti.findOne({where: {
        id: comentario.meetiId
    }});

    if(comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id){
        await Comentarios.destroy({where: { id: comentario.id}})
        res.status(200).send('Comentario eliminado')
        return next();
    }else{
        res.status(403).send('Accion no valido');
        return next();
    }
}