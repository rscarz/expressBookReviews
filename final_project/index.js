const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

const secretKey = "supersecretkey"; // Clave secreta para firmar el JWT

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }))

app.use("/customer/auth/*", function auth(req, res, next) {
    //Write the authenication mechanism here
    const token = req.headers['authorization']?.split(' ')[1]; // Obtiene el token después de "Bearer"
    if (!token) {
        return res.status(403).json({ message: "Se requiere token de autenticación" });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token no válido" });
        }
        req.username = decoded.username; // Guarda el nombre de usuario en la solicitud
        next();
    });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
