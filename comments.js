//Crear servidor web
const express = require('express');
const app = express();
const port = 3000;

// middleware para analizar cuerpos JSON
app.use(express.json());

// definir rutas
app.get('/', (req, res) => {
  res.send('¡Hola Mundo!');
});
app.post('/comments', (req, res) => {
  const comment = req.body;
  // TODO: Guardar comentario en la base de datos
  res.status(201).send(comment);
});
