const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const gruposController = require('../controllers/gruposController');
const meetiController = require('../controllers/meetiController');

const meetiControllerFE = require('../controllers/frontend/meetiControllerFE');
const usuariosControllerFE = require('../controllers/frontend/usuariosControllerFE');
const gruposControllerFE = require('../controllers/frontend/gruposControllerFE');
const comentariosControllerFE = require('../controllers/frontend/comentariosControllerFE'); 
const busquedaControllerFE = require('../controllers/frontend/busquedaControllerFE');

module.exports = function () {

    /**AREA PUBLICA */

    router.get('/', homeController.home);

    /**Meeti */
    router.get('/meeti/:slug',
        meetiControllerFE.mostrarMeeti
    )

    /**Confirmacion y cancelacion de asistencia */
    router.post('/confirmar-asistencia/:slug',
        meetiControllerFE.confirmarAsistencia
    )

    /**Mostrar los asistentes de un meeti */
    router.get('/asistentes/:slug',
        meetiControllerFE.asistentesMeeti
    )

    /**Agregar comentarios en un meeti */
    router.post('/meeti/:id',
        comentariosControllerFE.agregarComentario
    )

    /**Eliminar un comentario */
    router.post('/eliminar-comentario',
        comentariosControllerFE.eliminarComentario
    )

    /**Mostrar el perfil del usuario frontend */
    router.get('/mostrar-perfil/:id',
        usuariosControllerFE.mostrarUsuario
    )

    /**Mostrar informacion de grupo y sus meetis en el frontend*/
    router.get('/mostrar-grupo/:id',
        gruposControllerFE.mostrarGrupo
    )

    /**Mostrar los meetis por su categoria */
    router.get('/categoria/:categoria',
        meetiControllerFE.mostrarCategoria
    )

    /**BUSQUEDA DE GRUPOS EN EL FE */
    router.get('/busqueda',
        busquedaControllerFE.resultadosBusqueda
    )

    //CONFIRMAR Y CREAR CUENTAS
    router.get('/crear-cuenta',usuariosController.formCrearCuenta);
    router.post('/crear-cuenta',usuariosController.crearNuevoUsuario);
    router.get('/confirmar-cuenta/:correo',usuariosController.confirmarCuenta);

    //iniciar sesion
    router.get('/iniciar-sesion',usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);

    /**AREA PRIVADA */

    /**PANEL DE ADMINISTRACION */
    router.get('/administracion',
        authController.usuarioAutenticado,   
        adminController.panelAdministracion);

    /**PANEL DE GRUPOS */
    router.get('/nuevo-grupo',
        authController.usuarioAutenticado,
        gruposController.formNuevoGrupo
    );
    router.post('/nuevo-grupo',
        gruposController.subirImagen,
        gruposController.crearGrupo
    )

    /**EDITAR GRUPOS */
    router.get('/editar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEditarGrupo
    )
    router.post('/editar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.editarGrupo
    )

    /**EDITAR IMAGEN DE GRUPO */
    router.get('/imagen-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEditarImagen
    )
    router.post('/imagen-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.editarImagen
    )

    /**ELIMINAR EL GRUPO */
    router.get('/eliminar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEliminarGrupo
    )
    router.post('/eliminar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.eliminarGrupo    
    )

    /**Meetis */
    router.get('/nuevo-meeti',
        authController.usuarioAutenticado,
        meetiController.formNuevoMeeti
    )
    router.post('/nuevo-meeti',
        authController.usuarioAutenticado,
        meetiController.sanitizarMeeti,
        meetiController.crearMeeti
    )

    /**EDITAR MEETI */
    router.get('/editar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.formEditarMeeti
    )
    router.post('/editar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.editarMeeti
    )

    /**ELIMINAR MEETI */
    router.get('/eliminar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.formEliminarMeeti
    )
    router.post('/eliminar-meeti/:id',
        authController.usuarioAutenticado,
        meetiController.eliminarMeeti
    )

    /**PERFIL USUARIO */
    router.get('/editar-perfil',
        authController.usuarioAutenticado,
        usuariosController.formEditarPerfil
        );
    router.post('/editar-perfil',
        authController.usuarioAutenticado,
        usuariosController.editarPerfil
    )

    /**CAMBIAR CONTRASEÑA */
    router.get('/cambiar-password',
        authController.usuarioAutenticado,
        usuariosController.formCambiarPassword
    )
    router.post('/cambiar-password',
        authController.usuarioAutenticado,
        usuariosController.cambiarPassword
    )

    /**IMAGEN DE PERFIL */
    router.get('/imagen-perfil',
        authController.usuarioAutenticado,
        usuariosController.formSubirImagenPerfil
    )
    router.post('/imagen-perfil',
        authController.usuarioAutenticado,
        usuariosController.subirImagen,
        usuariosController.guardarImagenPerfil
    )

    return router;
}
