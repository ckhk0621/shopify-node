const axios = require("axios");
const { Shopify } = require("@shopify/shopify-api");

const storeFrontHeaders = {
  "Content-Type": "application/json",
  "X-Shopify-Storefront-Access-Token": process.env.STORE_FRONT_ACCESS_TOKEN,
  "X-Shopify-Api-Version": process.env.API_VERSION,
};

const axiosGraphQL = axios.create({
  baseURL: process.env.API_GRAPHQL,
  headers: storeFrontHeaders,
  method: "post",
});

const shopifyClient = new Shopify.Clients.Storefront(
  process.env.STORE_NAME,
  process.env.STORE_FRONT_ACCESS_TOKEN
);

module.exports = {shopifyClient, axiosGraphQL};