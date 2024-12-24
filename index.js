require('dotenv').config()
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion } = require('mongodb');


app.use(cors());
app.use(express.json());

// DB_user: siam  DB_password: VcTNoYOgWtw1rCte



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k0g53.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // Send a ping to confirm a successful connection
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // service related api
        const serviceCollection = client.db("reviewWebsite").collection("services");

        app.get("/services" , async(req, res) => {
            const cursor = serviceCollection.find().limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })









    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);






app.get("/", (req, res) => {
    res.send('server side is created')
});

app.listen(port, () => {
    console.log(`server is running in ${port}`);
})