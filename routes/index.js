const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');

module.exports = function () {

    router.get('/', homeController.home);

    //Usuarios
    router.get('/crear-cuenta',usuariosController.formCrearCuenta);
    router.post('/crear-cuenta',usuariosController.crearNuevoUsuario);

    return router;
}