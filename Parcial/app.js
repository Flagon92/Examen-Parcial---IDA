const express = require('express')
const jwt = require('jsonwebtoken');
const path = require('path');
const cookieParser = require('cookie-parser');

const config = require('./public/scripts/config')
const port = 3000

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended:false }))
app.use(cookieParser());

/**************/
// Ruta para index
app.get('/', (req, res) => {
    console.log('Estamos en la pagina principal');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para about
app.get('/about', (req, res) => {
    console.log('Estamos en la página About');
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// Ruta para menu
app.get('/menu', (req, res) => {
    console.log('Estamos en la página Menu');
    res.sendFile(path.join(__dirname, 'public', 'menu.html'));
});

app.get('/confirmarReserva', cookieJwtAuth, (req, res) => {
    const token = req.cookies.token;

    try {
        const reserva = jwt.verify(token, config.secret);
        res.json(reserva); // Devuelve los datos de reserva en formato JSON
    } catch (err) {
        res.clearCookie("token");
        return res.redirect("/");
    }
});


app.post('/reservar', (req, res) => {
    const { nombre, telefono, email, mesa, fecha } = req.body;

    const token = jwt.sign({ nombre, telefono, email, mesa, fecha }, config.secret, { expiresIn: '10m' });

    // Mostrar los datos de la reserva en la consola
    console.log(`Reserva realizada:
        Nombre: ${nombre}
        Teléfono: ${telefono}
        Email: ${email}
        Mesa para: ${mesa}
        Fecha: ${fecha}
      `);

    res.cookie("token", token, {
        httpOnly: true
    });

    res.sendFile(path.join(__dirname, 'public', 'confirmarReserva.html'));
});


app.post('/confirmarReserva', cookieJwtAuth, (req, res) => {
    const reservaConfirmada = true; // Simula la lógica de confirmación de la reserva

    if (reservaConfirmada) {
        // Reserva confirmada
        res.redirect('/index.html?mensaje=confirmado');
    } else {
        // Reserva no confirmada
        res.redirect('/index.html?mensaje=error');
    }
});

function cookieJwtAuth(req, res, next){
    const token = req.cookies.token;
    try {
        const reserva = jwt.verify(token, config.secret);
        req.reserva = reserva;
        next();
    } catch (err) {
        res.clearCookie("token");
        return res.redirect("/confirmarReserva.html");
    }
}

/**************/

app.use(express.static('public'))

app.listen(3000, () => {
    console.log(`Servidor corriendo en puerto: ${port}, http://localhost:${port}/`)
})
