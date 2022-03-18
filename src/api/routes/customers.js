const express = require("express");
const router = express.Router();
const {shopifyGraphql} = require("../../config")
const _ = require("lodash");

router.get("/get", async (req, res, next) => {

  const result = await shopifyGraphql.query({
    data: `{
      customers(first: 30) {
        edges {
          node {
            id
            email
            downLine: metafield(namespace: "affiliate", key: "downline") {
              id
              value
            }
            upLine: metafield(namespace: "affiliate", key: "upline") {
              id
              value
            }
            referral_code: metafield(namespace: "affiliate", key: "referral_code") {
              id
              value
            }
            type: metafield(namespace: "customer", key: "type") {
              id
              value
            }
          }
        }
      }
    }`,
  }).then((res) => res.body.data).then(res => res.customers).catch((err) => console.error(err));

  res.send(result);
});

module.exports = router;
