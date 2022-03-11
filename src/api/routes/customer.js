const express = require("express");
const router = express.Router();
const { axiosGraphQL, shopifyClient, shopifyGraphql } = require("../../config");
const _ = require("lodash");

router.get("/get", async (req, res, next) => {

  const { input } = req.body;

  const id = JSON.stringify(`gid://shopify/Customer/${input.id}`)

  const result = await shopifyGraphql.query({
    data: `{ customer(id: ${id}) {
      id
      firstName
      lastName
      acceptsMarketing
      email
      phone
      ordersCount
      totalSpentV2 {
        amount,
        currencyCode
      }
      averageOrderAmountV2 {
        amount,
        currencyCode
      }
      createdAt
      updatedAt
      note
      verifiedEmail
      validEmailAddress
      tags
      lifetimeDuration
      defaultAddress {
        formattedArea
        address1
      }
      addresses {
        address1
      }
      image { src }
      downLine: metafield(namespace: "affiliate", key: "downline") {
        value
      }
      upLine: metafield(namespace: "affiliate", key: "upline") {
        value
      }
    }
  }`,
  });

  res.send(result);
});

router.post("/customerAccessTokenCreate", async (req, res, next) => {
  const { input } = req.body;
  const graphqlQuery = {
    query: customer.customerAccessTokenCreate,
    variables: { input },
  };

  const result = await axiosGraphQL({
    data: graphqlQuery,
  })
    .then((response) => response.data)
    .then(async (result) => {
      if (
        _.isEmpty(result.data.customerAccessTokenCreate?.customerAccessToken)
      ) {
        const { customerUserErrors } = result.data.customerAccessTokenCreate;
        const errors = {
          code: customerUserErrors[0]?.code,
          message: customerUserErrors[0]?.message,
        };
        return { errors, status: "FAIL" };
      }

      const { customerAccessToken } = result.data?.customerAccessTokenCreate;

      const customerQuery = await shopifyClient.query({
        data: `query {
          customer(customerAccessToken: ${JSON.stringify(
            customerAccessToken.accessToken
          )}) {
            id
            firstName
            lastName
            acceptsMarketing
            email
            phone
          }
        }`,
      });

      if (customerQuery?.body.data.customer) {
        return {
          customerAccessToken,
          customer: customerQuery?.body.data.customer,
          status: "OK",
        };
      } else {
        return { status: "FAIL" };
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
