const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    // Ejemplo de usuario registrado
    { username: "rosa", password: "123" }];

const secretKey = "supersecretkey"; // Clave secreta para firmar el JWT

const isValid = (username) => { //returns boolean
    //write code to check is the username is valid
    return users.some((user) => user.username === username);
}

const authenticatedUser = (username, password) => { //returns boolean
    //write code to check if username and password match the one we have in records.
    return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    //Write your code here
    //return res.status(300).json({message: "Yet to be implemented / login"});
    const { username, password } = req.body;

    // Verificar si el username y password fueron enviados
    if (!username || !password) {
        return res.status(400).json({ message: "Faltan el nombre de usuario o la contraseña." });
    }

    // Verificar si el usuario está registrado
    if (!isValid(username)) {
        return res.status(404).json({ message: "El usuario no está registrado." });
    }

    // Validar las credenciales
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Nombre de usuario o contraseña incorrectos." });
    }

    // Generar un token JWT si las credenciales son válidas
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });

    return res.status(200).json({ message: "Inicio de sesión exitoso", token });

});

// Ruta para agregar o modificar una reseña de un libro
regd_users.put("/auth/review/:isbn", (req, res) => {
 

    //Verificar si el usuario está autenticado
    const token = req.headers['authorization']?.split(' ')[1]; // Obtiene el token después de "Bearer"
    if (!token) {
      return res.status(403).json({ message: "Se requiere token de autenticación" });
    }
  
    // Verificar el token y obtener el nombre de usuario
    let username;

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Token no válido" });
      }
      username = decoded.username; // Guardar el nombre de usuario
    });
  
    const { isbn } = req.params;
    const { review } = req.query; // La reseña se envía como query
  
    // Verificar si se proporciona la reseña
    if (!review) {
      return res.status(400).json({ message: "Se requiere una reseña." });
    }
  
    // Verificar si el libro con el ISBN existe
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Libro no encontrado." });
    }
  
    // Si el libro tiene una propiedad de reviews, la usamos, de lo contrario, la creamos
    if (!book.reviews) {
      book.reviews = {};
    }
  
    // Modificar o agregar la reseña del usuario
    book.reviews[username] = review;
  
    return res.status(200).json({
      message: "Reseña agregada/modificada exitosamente.",
      reviews: book.reviews
    });
  });
  

  // Ruta para eliminar una reseña de un libro
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Obtiene el token después de "Bearer"
    if (!token) {
        return res.status(403).json({ message: "Se requiere token de autenticación" });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token no válido" });
        }
        const username = decoded.username; // Guardar el nombre de usuario

        const { isbn } = req.params;

        const book = books[isbn];
        if (!book) {
            return res.status(404).json({ message: "Libro no encontrado." });
        }

        // Verificar si la reseña del usuario existe
        if (!book.reviews || !book.reviews[username]) {
            return res.status(404).json({ message: "No se encontró la reseña del usuario." });
        }

        // Eliminar la reseña del usuario
        delete book.reviews[username];

        return res.status(200).json({
            message: "Reseña eliminada exitosamente.",
            reviews: book.reviews
        });
    });
});


 


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
