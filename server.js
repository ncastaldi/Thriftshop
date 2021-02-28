require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const session = require("express-session");
const MongoStore = require('connect-mongo').default;

const routes = require("./routes");

const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ entended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGODB_URI || "mongodb://localhost/thriftshop",
    ttL: process.env.SESSION_MAX_AGE
  })
}));

app.use(express.static("client/build"));

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost/thriftshop", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

app.get("/api/config", (req, res) => {
  res.json({
    success: true,
  });
});

const stripe = require("stripe")(
  "sk_test_51IPhcIG7oxYUGKJCr6L1Htx1gIPshDLMp6gW1vkTl9dEmSJeVEPxqTJwU2c0xaoEklaTwFHEycrr5dUe36h4vaxg00vAFVLSjZ"
);

app.post("/create-checkout-session", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "T-shirt",
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "https://example.com/success.html",
    cancel_url: "https://example.com/cancel.html",
  });
  res.json({ id: session.id });
});

app.use("/api", routes);

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "client/build/index.html"));
// });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
