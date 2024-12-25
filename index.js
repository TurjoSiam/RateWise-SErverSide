require('dotenv').config()
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


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
        const reviewCollection = client.db("reviewWebsite").collection("reviews");

        app.get("/services", async (req, res) => {
            const cursor = serviceCollection.find().limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/allservices", async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/allservices/service", async (req, res) => {
            const email = req.query.email;
            const query = { added_email: email };
            const result = await serviceCollection.find(query).toArray();
            res.send(result);
        })

        app.get("/allservices/:id", async (req, res) => {
            const jobId = req.params.id;
            const query = { _id: new ObjectId(jobId) };
            const result = await serviceCollection.findOne(query);
            res.send(result);
        })

        app.post("/allservices", async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result);
        })

        app.delete("/allservices/:id", async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        })


        // service review related api

        app.get("/service-reviews", async (req, res) => {
            const email = req.query.email;
            const query = email ? { reviewerEmail: email } : {};
            const result = await reviewCollection.find(query).toArray();

            for (const review of result) {
                const query1 = { _id: new ObjectId(review.serviceId) };
                const service = await serviceCollection.findOne(query1);
                if (service) {
                    review.company_name = service.company_name;
                    review.company_logo = service.company_logo;
                    review.service_name = service.service_name;
                }
            }
            res.send(result);
        })

        app.get("/service-reviews/:serviceId", async(req, res) => {
            const id = req.params.serviceId;
            const query = {serviceId: id};
            const result = await reviewCollection.find(query).toArray();
            res.send(result);
        })

        app.post("/service-reviews", async (req, res) => {
            const newReview = req.body;
            const result = await reviewCollection.insertOne(newReview);
            res.send(result);
        })

        app.delete("/service-reviews/:id", async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await reviewCollection.deleteOne(query);
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