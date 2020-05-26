const express  = require('express');
const cors     = require('cors');
const multer   = require('multer');
const bcrypt   = require('bcrypt');
const jwt      = require("jsonwebtoken");
const mongoose = require('mongoose');
const path     = require('path');


const Artist = require('./models/artist');
const User   = require('./models/user');

const checkAuth = require("./auth/auth");

const port   = (process.env.PORT || 8000);
const jwtKey = (process.env.JWT  || "ocean");

//MONGOOSE --------------------------------------------------------------------------------------------------------
//mongodb+srv://sharonirais:<password>@paradiscluster-c2oa8.mongodb.net/test?retryWrites=true&w=majority
//mongodb+srv://sharonirais:jirs9209176k6@paradiscluster-c2oa8.mongodb.net/proyecto?retryWrites=true&w=majority
mongoose.connect('mongodb://localhost:27017/proyecto', {
    useNewUrlParser: true,
    useUnifiedTopology:true
});
mongoose.set('useCreateIndex', true);

//MULTER --------------------------------------------------------------------------------------------------------

function filtro(req, file, cb) {

    if(file.mimetype.slice(0, 5)==="image") {
        console.log("¡Mandaste una imagen!");
        cb(null, true);
    }else {
        console.log("Eso no es una imagen...");
        cb(null, false);
    }
};

const storage = multer.diskStorage({

    "destination": function(req, file, cb) {
        cb(null, path.join(__dirname,".","uploads"));
    },

    "filename": function(req, file, cb) {
        const timestamp = new Date().toISOString().replace(/:/g,'-');
        cb(null, timestamp + file.originalname);
    }
});

const maximos = {
    "fileSize" : 5 * 1024 * 1024
}

const upload = multer({
    "storage" : storage,
    "fileFilter" : filtro,
    "limits" : maximos
});

//EXPRESS --------------------------------------------------------------------------------------------------------

const app = express();

app.options("*", cors());
app.use(cors());

app.use(express.json());

//SIGN UP ----------------------------------------------------------------------------------------------------------------------------------------------

async function findDupUser(email) {
    const userfound = {};
    try {
        userfound["user"] = await User.findOne({ "email": email });
        if(!userfound["user"]) {
            userfound["success"] = true;
            console.log("El email es válido.");
        } else {
            userfound["user"] = `Un usuario con el email ${email} ya existe.`;
            userfound["success"] = false;
            console.log(userfound["user"]);
        }
    }catch (err) {
        userfound["user"] = "Signup failed";
        userfound["success"] = false;
        console.error(err.stack);
        //console.error("Algo tronó al validar el email...");
    }
    return userfound;
}

async function postNewUser(email, pass, name, lastname) {
        const postresult = {};
        const user = new User({
            "_id"      : new mongoose.Types.ObjectId(),
            "email"    : email,
            "pass"     : pass,
            "name"     : name,
            "lastname" : lastname
        });
        try {
            postresult["result"] = await user.save();
            postresult["success"] = true;
            console.log(postresult["result"]);
        } catch(err) {
            postresult["result"] = "Signup failed";
            postresult["success"] = false;
            console.error(err.stack);
            //console.error("Algo tronó al insertar el usuario...");
        }
        return postresult;
}

async function hashAndSalt(pass) {
    const hashedpass = {};
    try {
        hashedpass["pass"] = await bcrypt.hash(pass, 10);
        hashedpass["success"] = true;
        console.log("Contraseña hasheada exitosamente.");
    } catch(err) {
        hashedpass["pass"] = "Signup failed";
        hashedpass["success"] = false;
        console.error(err.stack);
        //console.error("Algo tronó al hashear la contraseña...");
    }
    return hashedpass;
}

async function signupHandler(req, res) {
        //Validar si un usuario con el mismo email no existe ya
        const valid_email = await findDupUser(req.body.email);
        if(!valid_email.success) {
            res.status(409).json({ "error": valid_email.user });
            return;
        }
        //Hashear y salar la contraseña
        const securePass = await hashAndSalt(req.body.pass);
        if(!securePass.success) {
            res.status(409).json({ "error": securePass.pass });
            return;
        }
        //Guardar el usuario en la DB
        const postResult = await postNewUser(req.body.email, securePass.pass, req.body.name, req.body.lastname);
        if(!postResult.success) {
            res.status(409).json({ "error": postResult.result });
            return;
        }
        //Sólo si todo lo anterior salió bien, llegamos aquí.
        console.log("Nuevo usuario guardado.");
        res.status(201).json({ "result": "POST OK." });
        return;
} 

app.post("/signup", signupHandler);

//LOGIN ----------------------------------------------------------------------------------------------------------------------------------------------

app.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ "email": req.body.email });
        if(user) {
            try {
                const result = await bcrypt.compare(req.body.pass, user.pass);
                if (result) {
                    const jwtPayload = {
                        "email": user.email,
                        "id": user._id
                    }
                    const jwtConfig = { "expiresIn": "1h" };
                    jwt.sign(jwtPayload, jwtKey, jwtConfig, (err, token) => {
                        if(!err) {
                            console.log("Login exitoso.");
                            res.status(200).json({ "result": "Login Exitoso.", "token": token });
                            return;
                        }else {
                            console.error(err.stack);
                            res.status(401).json({ "error": "Auth failed." }); //en realidad es error 500
                            return;
                        }
                    });
                }else {
                    console.log("Contraseña incorrecta.");
                    res.status(401).json({ "error": "Wrong password." });
                    return;
                }
            }catch(err) {
                console.error(err.stack);
                res.status(401).json({ "error": "Auth failed." }); //en realidad es error 500
                return;
            }
        }else {
            console.log("No hay usuarios con ese email.");
            res.status(401).json({ "error": "User not found." });
            return;
        }
    }catch(err) {
        console.error(err.stack);
        res.status(401).json({ "error": "Auth failed." }); //en realidad es error 500
        return;
    }
});

//USERS ----------------------------------------------------------------------------------------------------------------------------------------------

//Endpoint para obtener todos los usuarios
app.get("/users", (req, res) => {
    User.find({}, {})
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({ message: "Something went wrong" });
        });
    //User.find
});

//ARTISTAS ----------------------------------------------------------------------------------------------------------------------------------------------

//Buscar artistas (todos) -> searchbar
app.get("/artistas", (req, res) => {
    Artist.find({}, {"__v":false})
        .then(result => {
            if(result.length>0) {
                console.log("GET OK.");
                res.status(200).json(result);
            }else {
                console.log("Colección vacía");
                res.status(404).json({"error":"Colección vacía"});
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({ message: "Something went wrong" });
        });
    //Artist.find
});

//Buscar artista (solo uno) -> Biblioteca
app.get("/artistas/:id", (req, res) => {
    const id = req.params.id;
    Artist.findById(id)
        .then(doc => {
            if(!doc) {
                console.log("El artista que buscas no existe");
                res.status(404).send("El artista que buscas no existe");
            }else {
                console.log("GET OK.");
                res.status(200).json(doc);
            }
        })
        .catch(err => {
            console.error(err.stack);
            res.status(200).send({ message: "Error" });
        });
    //Artist.findById
});

//Borrar artistas (solo uno)  -> Biblioteca
app.delete("/artistas/:id", (req, res) => {
    const id = req.params.id;
    Artist.deleteOne({"_id": id})
        .then(result => {
            console.log(result);
            res.status(200).send({message: "The artist was deleted"})
        }).
        catch(err=>{
            console.error(err);
            res.status(500).send({message: "Something went wrong"});
        })
    //Artist.deleteOne
});

//Agregar artista (solo uno) -> Biblioteca
app.post("/artistas", upload.single("fotoDelArtista"), (req, res) => {

    const artist_document = new Artist({
        _id    : new mongoose.Types.ObjectId(),
        name   : req.body.name,
        image  : req.file.path,
        tracks : req.body.tracks.split(",")
    });

    artist_document.save()
        .then(result => {
            console.log(result);
            res.status(201).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("No se pudo");
        });
    //artist_document.save
});

//Modificar artista (agregar más canciones para solo un artista) -> addArtist
app.patch("/artistas/:id", (req, res) => {
    const id = req.params.id;

    Artist.updateOne({"_id" : id}, {$set: req.body})
    .then(result =>{
        console.log(result);
        res.status(200).send({message: "The artist has been updated"});
    }).
    catch(err=>{
        console.err(err);
        res.status(500).send({message: "Something went wrong"})
    }); 
});

//GENERIC ----------------------------------------------------------------------------------------------------------------------------------------------

app.all("*", (req, res)=>{
    res.status(200).json({message:"Hola"});
});

app.listen(port, ()=>{
    console.log(`Listening to port ${port}`);
});

module.exports = app;

//eof
