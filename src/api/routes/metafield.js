const express = require("express");
const router = express.Router();
const {shopifyGraphql, axiosGraphQL} = require("../../config")
const _ = require("lodash");


router.get("/get", async (req, res, next) => {

  const { input } = req.body;

  const id = JSON.stringify(`gid://shopify/MetafieldDefinition/${input.id}`)

  const data = await shopifyGraphql.query({
    data: `{
      metafieldDefinition(id: ${id}) {
        name
      }
    }`,
  });

  res.send(data);

})


router.get("/gets", async (req, res, next) => {

  const data = await shopifyGraphql.query({
    data: `{
      metafieldDefinitions(first: 250, ownerType: CUSTOMER) {
        edges {
          node {
            id
            name
            namespace
            ownerType
          }
        }
      }
    }`,
  });

  res.send(data);

})

module.exports = router;
