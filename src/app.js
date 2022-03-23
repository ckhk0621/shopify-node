require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const customerRoute = require('./api/routes/customer');
const customersRoute = require('./api/routes/customers');
const ordersRoute = require('./api/routes/orders');
const checkoutRoute = require('./api/routes/checkout');
const metafieldRoute = require('./api/routes/metafield');

const app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.options('*', cors()); 

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use('/customer', customerRoute);
app.use('/customers', customersRoute);
app.use('/orders', ordersRoute);
app.use('/metafield', metafieldRoute);
app.use('/checkout', checkoutRoute);
///
module.exports = app;