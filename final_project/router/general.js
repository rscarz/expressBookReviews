const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    //Write your code here
    //return res.status(300).json({message: "Yet to be implemented"});

    const { username, password } = req.body; // Extraer el username y password del cuerpo de la solicitud

    console.log(req.body);

    // Verificar si se proporcionan ambos, username y password
    if (!username) {
        return res.status(400).json({ message: "Faltan datos de usuario. Se requiere el nombre de usuario." });
    }

    // Verificar si se proporcionan ambos, username y password
    if (!password) {
        return res.status(400).json({ message: "Faltan datos de usuario. Se requiere la contraseña." });
    }

    // Verificar si el usuario ya existe
    if (users[username]) {
        return res.status(400).json({ message: "El usuario ya existe. Por favor, elige un nombre de usuario diferente." });
    }

    // Si no existe, registrar el nuevo usuario
    users[username] = { password }; // Guardar el usuario con su contraseña
    return res.status(200).json({ message: "Usuario registrado exitosamente." });

});

// Get the book list available in the shop
// public_users.get('/', function (req, res) {
//     //Write your code here
//     res.send(JSON.stringify({ books }, null, 4));
// });
public_users.get('/', async function (req, res) {
    //Write your code here
    try {
        const lAllBook = await new Promise((resolve, reject) => {
            if (books) {
                resolve(books);
            } else {
                reject("Books data is not available.");
            }

            res.send(JSON.stringify({ books }, null, 4));
        })
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get book details based on ISBN
// public_users.get('/isbn/:isbn', function (req, res) {
//     //Write your code here
//     const { isbn } = req.params;
//     const lBook = books[isbn];

//     if (lBook) {
//         return res.send(JSON.stringify({ lBook }, null, 4));
//     } else {
//         return res.status(404).json({ message: "Libro no encontrado" });
//     }
// });
public_users.get('/isbn/:isbn', async function (req, res) {
    //Write your code here
    const { isbn } = req.params;


    let lISNB = new Promise((resolve, reject) => {
        const lBook = books[isbn];

        if (lBook) {
            resolve(lBook);
        } else {
            reject("Libro no encontrado.");
        }

    })

    lISNB.then((book) => {
        res.send(book);
    });
});



// Get book details based on author
// public_users.get('/author/:author', function (req, res) {
//     //Write your code here
//     const author = req.params.author.toLowerCase();  // Convertimos el parámetro a minúsculas para una búsqueda insensible a mayúsculas/minúsculas
//     const bookKeys = Object.keys(books); // Obtener todas las claves del objeto 'books'
//     const filteredBooks = [];

//     // Iterar sobre cada clave y comprobar si el autor contiene las palabras solicitadas
//     bookKeys.forEach((key) => {
//         if (books[key].author.toLowerCase().includes(author)) {
//             filteredBooks.push(books[key]);
//         }
//     });

//     if (filteredBooks.length > 0) {
//         return res.json(filteredBooks); // Devolver los libros que coinciden
//     } else {
//         return res.status(404).json({ message: "No se encontraron libros de ese autor" });
//     }
// });
public_users.get('/author/:author', async function (req, res) {
    //Write your code here
    const author = req.params.author.toLowerCase();

    let filterBooksByAuthor = new Promise((resolve, reject) => {
        const bookKeys = Object.keys(books); // Obtener todas las claves
        const filteredBooks = [];

        // Iterar  
        bookKeys.forEach((key) => {
            if (books[key].author.toLowerCase().includes(author)) {
                filteredBooks.push(books[key]);
            }
        });

        if (filteredBooks.length > 0) {
            resolve(filteredBooks); // Devolver los libros que coinciden
        } else {
            reject("No se encontraron libros de ese autor");
        }

    });

    filterBooksByAuthor.then((book) => {
        res.send(book);
    });
});




// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    //Write your code here
    const lTitle = req.params.title.toLowerCase();  

    const bookKeys = Object.keys(books); 
    const filteredTitle = [];

    let titleBook = new Promise((resolve, reject) => {
 
        bookKeys.forEach((key) => {
            if (books[key].title.toLowerCase().includes(lTitle)) {
                filteredTitle.push(books[key]);
            }
        });

        if (filteredTitle.length > 0) {
            resolve(filteredTitle); // Devolver los libros que coinciden
        } else {
            reject("No se encontraron libros de ese autor");
        }
    });

    titleBook.then((ltitleBook) => {
        res.send(ltitleBook);
    });

});




//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    //Write your code here
    const { isbn } = req.params;
    const lBook = books[isbn];

    if (lBook) {
        return res.send(JSON.stringify({ lBook }, null, 4));
    } else {
        return res.status(404).json({ message: "Review no encontrada" });
    }

});

module.exports.general = public_users;
