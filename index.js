const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const cors = require("cors");
require("dotenv").config();
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);
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
    const database = client.db("Fun_with_Art_Craft");
    const confirmedClasses = database.collection("confirmed classes");
    const enrollmentClasses = database.collection("enrollment classes");
    const paymentsHistory = database.collection("payment history");

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

    app.get("/confirmedClasses", async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }

      const query = { studentEmail: email };
      const result = await confirmedClasses.find(query).toArray();
      res.send(result);
    });

    app.post("/confirmedClasses", async (req, res) => {
      const studentDetails = req.body;
      const result = await confirmedClasses.insertOne(studentDetails);
      res.send(result);
    });

    app.delete("/confirmedClasses", async (req, res) => {
      const email = req.query.email;
      const query = { studentEmail: { $regex: email } };
      const result = await confirmedClasses.deleteMany(query);
      res.send(result);
    });

    app.delete("/confirmedClasses/:classId", async (req, res) => {
      const id = req.params.classId;
      const query = { classId: id };
      const result = await confirmedClasses.deleteOne(query);
      res.send(result);
    });

    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/payment-details", async (req, res) => {
      const paymentDetails = req.body;
      const result = await paymentsHistory.insertOne(paymentDetails);
      res.send(result);
    });

    app.get("/payments-history", async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }

      const query = { email: email };
      const result = await paymentsHistory.find(query).toArray();
      res.send(result);
    });

    app.post("/enrollmentClasses", async (req, res) => {
      const enrollmentClassesDetails = req.body;
      const result = await enrollmentClasses.insertOne(
        enrollmentClassesDetails
      );
      res.send(result);
    });

    app.get("/enrollmentClasses", async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }

      const query = { studentEmail: email };
      const result = await enrollmentClasses.find(query).toArray();
      res.send(result);
    });
  } catch {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

app.listen(port);
