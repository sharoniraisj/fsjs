const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const port = (process.env.PORT || 8000);

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongoose://localhost:27017/proyecto', {useNewUrlParser: true,
useUnifiedTopology: true}, (err, res) => {
  
 if (err) {
    throw err;
  } else {
    console.log("La conexión a la base de datos está funcionando correctamente");
  } 
});


const app = express();

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.options("*", cors());
app.use(cors());

app.use(express.json());

let artistas = [
    {
      nombre: 'Chicano Batman',
      canciones: [
        {
          titulo: 'Magma',
          duracion: '05:00',
          album: 'Cycles of Existential Rhyme'
        },
        {
          titulo: 'Black Lipstick',
          duracion: '05:00',
          album: 'Cycles of Existential Rhyme'
        },
        {
          titulo: 'Freedom Is Free',
          duracion: '05:00',
          album: 'Cycles of Existential Rhyme'
        }
      ]
    },
    {
      nombre: 'José José',
      canciones: [
        {
          titulo: 'La Nave Del Olvido',
          duracion: '05:00',
          album: 'La nave del olvido'
        },
        {
          titulo: 'Payaso',
          duracion: '05:00',
          album: 'La nave del olvido'
        },
        {
          titulo: 'Amnesia',
          duracion: '05:00',
          album: 'La nave del olvido'
        }
      ]
    },
    {
      nombre: 'Los Acosta',
      canciones: [
        {
          titulo: 'Como una novela',
          duracion: '05:00',
          album: 'Volando en una nave triste'
        },
        {
          titulo: 'Mi corazón es un vagabundo',
          duracion: '05:00',
          album: 'Volando en una nave triste'
        },
        {
          titulo: 'Jamás',
          duracion: '05:00',
          album: 'Volando en una nave triste'
        }
      ]
    }
  
  ]

  
      let artistas1 = {
        nombre: '',
        cancion: ''
      };

//Buscar artistas (todos) -> searchbar
app.get("/artistas", (req, res)=>{
    res.status(200).json(artistas);
});

//Buscar artista (solo uno) -> Biblioteca

app.get("/artistas/:id", (req, res)=>{
    const id = Number(req.params.id);
    if( !isNaN(id) && id>=0 && id<artistas.length) {
        res.status(200).json(artistas[id]);
    } 
    else {
        res.status(400).json({"Error":"El artista que buscas no existe"});

    }

});

//Borrar artistas (solo uno)  -> Biblioteca
app.delete("/artistas/:id", (req, res)=>{
    const id = Number(req.params.id);
    if( !isNaN(id) && id>=0 && id<artistas.length) {
        artistas.splice(id, 1);
        res.status(200).json(artistas);
    } 
    else {
        res.status(400).json({"Error":"El artista que buscas no existe"});
    }
});

//Agregar artista (solo uno) -> Biblioteca
app.post("/artistas", (req, res)=>{s 
      artistas = {
        nombre: req.body.nombre,
        canciones: req.body.canciones
        
      };
      res.status(200).json({"Message":"A new artist was created"});
  
});

//Modificar artista (agregar más canciones para solo un artista) -> addArtist
app.put("/artistas/:id", (req, res)=>{
  const id = Number(req.params.id);
  if( !isNaN(id) && id>=0 && id<artistas.length) {
      
      res.status(200).json(artistas[id]);
  } 
  else {
      res.status(400).json({"Error":"No ha sido posible modificar al artista"});
  }
});


app.listen(port, ()=>{
    console.log(`Listening to port ${port}`);
});


module.exports = app;