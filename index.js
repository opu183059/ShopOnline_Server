const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ljsyrma.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const userDB = client.db("ShopOnline").collection("userDB");
    const productDB = client.db("ShopOnline").collection("productDB");
    const cartDB = client.db("ShopOnline").collection("cartDB");

    // save users and code to handle duplicate email input
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userDB.updateOne(query, updateDoc, options);
      res.json(result);
    });

    // Get all Products
    app.get("/allProducts", async (req, res) => {
      const result = await productDB.find({}).toArray();
      res.json(result);
    });

    app.get("/productDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productDB.findOne(query);
      res.json(result);
    });

    // Product add to cart added
    app.post("/addToCart", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      const result = await cartDB.insertOne(body);
      res.json(result);
    });

    // --------------------------------------------------------------------------------------------------------
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Server running output message
app.get("/", (req, res) => {
  res.send("ShopOnline server is running");
});

app.listen(port, () => {
  console.log(`ShopOnline in running on port ${port}`);
});
