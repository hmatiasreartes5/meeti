const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const router = require('./routes/index');
const path = require('path');
const bodyParser = require('body-parser');

//Variables de desarrollo
require('dotenv').config({path: 'variables.env'});

//Modelos
require('./models/Usuarios');

//conexion con la DB
const db = require('./config/db');
db.sync().then(() => console.log('DB CONECTADA')).catch((error)=> console.log(error));

//App  principal
const app = express();

//Body Parser, leer formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//HABILITAR EJS COMO TEMPLATE ENGINE //ESTO SI O SI TIENE QUE IR ANTES DEL ROUTING SI NO NO EJECUTA expressLayouts
app.use(expressLayouts);
app.set('view engine', 'ejs');

//MIDDLEWARE (usuario logueado,flash messagues, fecha actual)
app.use((req,res,next)=>{
    const fecha = new Date();
    res.locals.year= fecha.getFullYear();
    next();
})

//ROUTING
app.use('/',router());

//UBICACION DE LAS VISTAS
app.set('views', path.join(__dirname, './views'));

//ARCHIVOS ESTATICOS 
app.use(express.static('public'));

//AGREGANDO EL ROUTER
app.listen(process.env.PORT,() => {
    console.log('El servidor esta funcionando')
});