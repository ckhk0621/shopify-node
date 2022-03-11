const express = require("express");
const router = express.Router();
const {shopifyGraphql} = require("../../config")
const _ = require("lodash");

router.get("/get", async (req, res, next) => {

  const result = await shopifyGraphql.query({
    data: `{
      orders(first: 10, query: "financial_status:AUTHORIZED") {
        edges {
          node {
            id
            displayFinancialStatus
          }
        }
      }
    }`,
  }).then((res) => res.body.data).then(res => res.orders);

  res.send(result);
});

// const customer = {
//   customerAccessTokenCreate: `mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
//     customerAccessTokenCreate(input: $input) {
//       customerAccessToken {
//         accessToken
//         expiresAt
//       }
//       customerUserErrors {
//         code
//         field
//         message
//       }
//     }
//   }`,
// };

module.exports = router;
