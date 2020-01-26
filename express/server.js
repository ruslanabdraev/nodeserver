// 'use strict';
// const express = require('express');
// const path = require('path');
// const serverless = require('serverless-http');
// const app = express();
// const bodyParser = require('body-parser');

// const router = express.Router();
// router.get('/', (req, res) => {
//   res.writeHead(200, { 'Content-Type': 'text/html' });
//   res.write('<h1>Hello from Express.js!</h1>');
//   res.end();
// });
// router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
// router.post('/', (req, res) => res.json({ postBody: req.body }));

// app.use(bodyParser.json());
// app.use('/.netlify/functions/server', router);  // path must route to lambda
// app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));



const serverless = require('serverless-http');
const express = require('express')
const app = express()
const router = express.Router()
//const config = require('./config')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const url = "mongodb://master:master123@cluster0-shard-00-00-qgpud.mongodb.net:27017,cluster0-shard-00-01-qgpud.mongodb.net:27017,cluster0-shard-00-02-qgpud.mongodb.net:27017/frontcamp?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority"
const jsonParser = bodyParser.json()

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})

const newsModel = new mongoose.Schema({
    id: Number,
    author: String,
    title: String,
    description: String,
    url: String,
    urlToImage: String,
    publishedAt: Date,
    content: String
})

const News = mongoose.model('News', newsModel)

const errorHandler = (err, req, res, next) => {
    res.status(500);
    res.render('error', { error: err.message });
}

// router.use((req, res, next) =>{
//     console.log('Time:', Date.now())
//     next()
// })

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", CLIENT_ORIGIN);
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
    res.header("Access-Control-Allow-Credentials", true); 
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

router.get("/news", (req, res, next)=>{
    console.log("Get news")

    News.find({}).sort({id:1}).then((data)=>{
        res.send(data)
    })
})

router.get("/news/:id", (req, res, next)=>{
    console.log("Get news by id:", req.params.id)

    const ident = req.params.id

    News.findOne({ id: ident }).then((data) => {
        if(data){
            res.send(data)
        }else{
            res.status(404).send('Not Found')
        }
    })
})

router.post("/news", jsonParser, (req, res, next)=>{
    console.log("Add one news")
    
    News.create(req.body).then(()=>{
        res.sendStatus(200)
    })
})

router.put("/news/:id", jsonParser, (req, res, next)=>{
    console.log("Edit one news. id:", req.params.id)

    const ident = req.params.id
    News.updateOne({id: ident}, req.body).then(()=>{
        res.sendStatus(200)
    })
})

router.delete("/news/:id", (req, res, next)=>{
    console.log("Delete one news. id:", req.params.id)
    
    const ident = req.params.id
    News.deleteOne({id: ident}).then(()=>{
        res.sendStatus(200)
    })
})

app.use(errorHandler)

app.use("/", router)
app.use('/.netlify/functions/server', router);  // path must route to lambda 
//app.listen(8080) 

module.exports = app;
module.exports.handler = serverless(app);