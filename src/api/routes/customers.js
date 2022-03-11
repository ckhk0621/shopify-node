const express = require("express");
const router = express.Router();
const {shopifyGraphql} = require("../../config")
const _ = require("lodash");

router.get("/get", async (req, res, next) => {

  const result = await shopifyGraphql.query({
    data: `{
      customers(first: 10, sortKey: ORDERS_COUNT, reverse: true) {
        edges {
          node {
            id
            email
            totalSpentV2 {
              amount,
              currencyCode
            }
            downLine: metafield(namespace: "affiliate", key: "downline") {
              value
            }
            upLine: metafield(namespace: "affiliate", key: "upline") {
              value
            }
          }
        }
      }
    }`,
  }).then((res) => res.body.data).then(res => res.customers);

  res.send(result);
});

module.exports = router;
