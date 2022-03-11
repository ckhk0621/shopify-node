const express = require("express");
const router = express.Router();
const {shopifyGraphql} = require("../../config")
const _ = require("lodash");

router.get("/get", async (req, res, next) => {

  const result = await shopifyGraphql.query({
    data: `{
      customers(first: 10) {
        edges {
          node {
            id
            email
            totalSpentV2 {
              amount,
              currencyCode
            }
          }
        }
      }
    }`,
  }).then((res) => res.body.data).then(res => res.customers);

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
