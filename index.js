const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const router = require('./routes/index');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const passport = require('./config/passport');

//Variables de desarrollo
require('dotenv').config({path: 'variables.env'});

//Modelos
require('./models/Usuarios');
require('./models/Categorias');
require('./models/Comentarios');
require('./models/Grupos');
require('./models/Meeti');

//conexion con la DB
const db = require('./config/db');
db.sync().then(() => console.log('DB CONECTADA')).catch((error)=> console.log(error));

//App  principal
const app = express();

//Body Parser, leer formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//AGREGAR EXPRESS VALIDATOR
app.use(expressValidator());

//HABILITAR EJS COMO TEMPLATE ENGINE //ESTO SI O SI TIENE QUE IR ANTES DEL ROUTING SI NO NO EJECUTA expressLayouts
app.use(expressLayouts);
app.set('view engine', 'ejs');


//UBICACION DE LAS VISTAS
app.set('views', path.join(__dirname, './views'));

//ARCHIVOS ESTATICOS 
app.use(express.static('public'));

//HABILITAR COOKIE PARSER
app.use(cookieParser());

//CREAR LA SESSION 
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}))

//INICILIZAR PASSPORT
app.use(passport.initialize());
app.use(passport.session());

//AGREGA FLASH MESSAGES
app.use(flash());

//MIDDLEWARE (usuario logueado,flash messagues, fecha actual)
app.use((req,res,next)=>{
    res.locals.usuario = {...req.user} || null;
    res.locals.mensajes = req.flash();
    const fecha = new Date();
    res.locals.year= fecha.getFullYear();
    next();
})

//ROUTING
app.use('/',router());

//AGREGANDO EL ROUTER
app.listen(process.env.PORT,() => {
    console.log('El servidor esta funcionando')
});