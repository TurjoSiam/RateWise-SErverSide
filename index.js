require('dotenv').config()
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://ratewise-turjosiam.netlify.app",
        "https://assignment-11-beta.vercel.app"
    ],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token

    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorize access' })
        }
        req.user = decoded;
        next();
    })

}

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
   };
  



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

        // auth related api
        app.post("/jwt", async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5h' });
            res.cookie('token', token, cookieOptions).send({ success: true });
        })

        app.post("/logout", (req, res) => {
            res.clearCookie('token', {...cookieOptions, maxAge: 0}).send({ success: true });
        })



        app.get("/services", async (req, res) => {
            const cursor = serviceCollection.find().limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/allservices", async (req, res) => {
            const filter = req.query.filter;
            const search = req.query.search;
            const regexValue = String(search);
            let query = {
                service_name: {
                    $regex: regexValue,
                    $options: 'i'
                }
            };
            if (filter) {
                query.category = filter;
            }
            const cursor = serviceCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/allservices/service", verifyToken, async (req, res) => {
            const email = req.query.email;
            const query = { added_email: email };

            if (req.user.email !== req.query.email) {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const result = await serviceCollection.find(query).toArray();
            res.send(result);
        })

        app.get("/allservices/:id", async (req, res) => {
            const jobId = req.params.id;
            const query = { _id: new ObjectId(jobId) };
            const result = await serviceCollection.findOne(query);
            res.send(result);
        })

        app.get("/allservices/updateservice/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await serviceCollection.findOne(query);
            res.send(result);
        })

        app.post("/allservices", async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result);
        })

        app.put("/allservices/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedService = req.body;
            const update = {
                $set: {
                    website: updatedService.website,
                    service_name: updatedService.service_name,
                    company_logo: updatedService.company_logo,
                    price: updatedService.price,
                    category: updatedService.category,
                    description: updatedService.description
                }
            }
            const result = await serviceCollection.updateOne(filter, update, options);
            res.send(result);
        })

        app.delete("/allservices/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        })




        // service review related api

        app.get("/service-reviews", verifyToken, async (req, res) => {
            const email = req.query.email;
            const query = email ? { reviewerEmail: email } : {};

            if (req.user.email !== req.query.email) {
                return res.status(403).send({ message: 'forbidden access' })
            }

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

        app.get("/service-reviews/:serviceId", async (req, res) => {
            const id = req.params.serviceId;
            const query = { serviceId: id };
            const result = await reviewCollection.find(query).toArray();
            res.send(result);
        })

        app.get("/service-reviews/updatereview/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await reviewCollection.findOne(query);
            res.send(result);
        })

        app.post("/service-reviews", async (req, res) => {
            const newReview = req.body;
            const result = await reviewCollection.insertOne(newReview);
            res.send(result);
        })

        app.put("/service-review/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedReview = req.body;
            const update = {
                $set: {
                    review: updatedReview.review,
                    date: updatedReview.date,
                    rating: updatedReview.rating
                }
            }
            const result = await reviewCollection.updateOne(filter, update, options);
            res.send(result);
        })


        app.delete("/service-reviews/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
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