const express = require("express");
const router = express.Router();
const {axiosGraphQL, shopifyClient} = require("../../config")
const _ = require("lodash");

router.post("/customerAccessTokenCreate", async (req, res, next) => {
  const {input} = req.body;
  const graphqlQuery = {
    query: customer.customerAccessTokenCreate,
    variables: {input}
  };

  const result = await axiosGraphQL({
    data: graphqlQuery,
  })
    .then((response) => response.data)
    .then(async (result) => {

      if(_.isEmpty(result.data.customerAccessTokenCreate?.customerAccessToken)){
        const {customerUserErrors} = result.data.customerAccessTokenCreate
        const errors = {
          code: customerUserErrors[0]?.code,
          message: customerUserErrors[0]?.message,
        }
        return {errors, status: 'FAIL'};
      }

      const {customerAccessToken} =
        result.data?.customerAccessTokenCreate;

      const customerQuery = await shopifyClient.query({
        data: `query {
          customer(customerAccessToken: ${JSON.stringify(customerAccessToken.accessToken)}) {
            id
            firstName
            lastName
            acceptsMarketing
            email
            phone
          }
        }`,
      });
    

      if(customerQuery?.body.data.customer){
        return {customerAccessToken, customer: customerQuery?.body.data.customer, status: 'OK'};
      } else {
        return {status: 'FAIL'};
      }
    })
    .catch((error) => error);

  res.send(result);
});

const customer = {
  customerAccessTokenCreate: `mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }`,
};

module.exports = router;
