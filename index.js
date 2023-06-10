const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `${process.env.DB_URI}`;

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
    const database = client.db("Fun_with_Art_Craft");

    app.get("/", async (req, res) => {
      res.send("Server is running.");
    });

    app.get("/all_details", async (req, res) => {
      const all_details = await database
        .collection("all class's details")
        .find()
        .toArray();
      res.send(all_details);
    });

    app.get("/popularClasses", async (req, res) => {
      const query = {};

      const options = {
        sort: {
          availableSeats: 1,
        },

        projection: {
          _id: 1,
          className: 1,
          classImage: 1,
          availableSeats: 1,
          price: 1,
        },
      };

      const popularClasses = await database
        .collection("all class's details")
        .find(query, options)
        .toArray();

      res.send(popularClasses);
    });

    app.get("/popularInstructors", async (req, res) => {
      const query = {};

      const options = {
        sort: {
          availableSeats: 1,
        },

        projection: {
          _id: 1,
          className: 1,
          instructorName: 1,
          instructorImage: 1,
        },
      };

      const popularInstructors = await database
        .collection("all class's details")
        .find(query, options)
        .toArray();

      res.send(popularInstructors);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

app.listen(port);
