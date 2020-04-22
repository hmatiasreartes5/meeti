 const Meeti = require('../../models/Meeti');
 const Grupos = require('../../models/Grupos');
 const Usuarios = require('../../models/Usuarios');
 const Categorias = require('../../models/Categorias');
const Sequelize = require('sequelize')

 const moment = require('moment');

 exports.mostrarMeeti = async (req,res) => {
     const meeti = await Meeti.findOne({where: {
         slug : req.params.slug
        },
        include : [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id','nombre','imagen']
            }
        ]
     });

     //si no existe el meeti
     if(!meeti){
         res.redirect('/');
     }

     //si existe redireccionar al meeti
     res.render('mostrar-meeti',{
         nombrePagina: meeti.titulo,
         meeti,
         moment
     })
 }

 //funcion para confirmar o cancelar la asistencia 
 exports.confirmarAsistencia = async (req,res) => {

    const {accion} = req.body;

    if(accion === 'confirmar'){
        //confirmo las asistencia
        Meeti.update(
            {'interesados' : Sequelize.fn('array_append',Sequelize.col('interesados'),
            req.user.id)},
            {'where': {'slug' : req.params.slug}}
        )
        res.send('Has confirmado tu asistencia');
    }else{
        Meeti.update(
            {'interesados' : Sequelize.fn('array_remove',Sequelize.col('interesados'),
            req.user.id)},
            {'where': {'slug' : req.params.slug}}
        )
        res.send('Has Cancelado tu asistencia');
    }
 }

 //mostrar los asistentes a un meeti
 exports.asistentesMeeti = async (req,res) => {
     const meeti = await Meeti.findOne({
         where : {
             slug: req.params.slug
         },
         attributes: ['interesados']
    });

    //extraer interesados
    const {interesados} = meeti

    const asistentes = await Usuarios.findAll({
        where: {
            id: interesados
        },
        attributes: ['nombre','imagen']
    });
     
    res.render('asistentes-meeti',{
        nombrePagina: "Listado de asistentes",
        asistentes
    })
 }

 //mostrar los proximos meetis por categoria
 exports.mostrarCategoria = async (req,res,next) => {
    const categoria = await Categorias.findOne({
        where: {
            slug: req.params.categoria
        },
        attributes: ['id','nombre']
    });

    const meetis = await Meeti.findAll({
        //lo siguiente es como hacer un join
        include:[
            {
                model: Grupos,
                where: {
                    categoriaId: categoria.id
                }
            },
            {
                model: Usuarios
            }
        ]
    });

    res.render('categoria',{
        nombrePagina: `Categoria: ${categoria.nombre}`,
        meetis,
        moment
    })

 }


