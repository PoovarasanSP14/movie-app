const MongoClient = require('mongodb').MongoClient;
const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');


const url = process.env.NODE_ENV;
const app = express();
const port = 3000;
const dbName = "movie-app";
const collectionName = "movies";
let client = "";

app.use(bodyParser.json());


app.get('/movie/list', async (req, res) => {
    const collection = client.db(dbName).collection(collectionName);
    const response = await collection.find().toArray();
    res.send((response));
})

app.get('/movie/length/total', async (req, res) => {
    const collection = client.db(dbName).collection(collectionName);
    const response = await collection.aggregate([
        {
           $group:{
              _id:"$length",
              totalRunningTime:{"$sum":"$length"},
           }
        }]).toArray();
    res.send(response);
})


app.post('/movie/create', async (req, res) => {
    const movieObject=req.body;
    if(!movieObject.id || !movieObject.name || !movieObject.year   || !movieObject.length)
    {
        return res.status(400).send("Must send required feilds[name,year,length]");
    }
    const { id, name,year, length} = movieObject;
    const collection = client.db(dbName).collection(collectionName);
    const response = await collection.insertOne({ id: id, name: name, year: year, length:length});
    res.send(response.result);
})


app.put('/update/:name', async (req, res) => {
    const collection = client.db(dbName).collection(collectionName);
    const {name}=req.params;

    const response = await collection.updateOne(
        {name:name},
        {
            $set: req.body
        }
    );

    res.send(response.result);
})

app.delete('/delete/:name', async (req, res) => {
    const collection = client.db(dbName).collection(collectionName);
    const {name}=req.params;

    const response = await collection.deleteOne(
        {name:name}
    );

    res.send(response.result);
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

const connectToDatabase = async () => {
    console.log("Connected to the database");
    client = await MongoClient.connect(url);
}

connectToDatabase();