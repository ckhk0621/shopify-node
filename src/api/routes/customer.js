const express = require("express");
const router = express.Router();
const { axiosGraphQL, shopifyClient, shopifyGraphql } = require("../../config");
const _ = require("lodash");

const handleMapReferrer = async (referrer, id) => {
  const ID = /[^/]*$/.exec(`${id}`)[0];
};

router.post("/affiliateCreate", async (req, res, next) => {
  const { input } = req.body;

  const graphqlQuery = {
    query: `mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          firstName
          lastName,
          email,
          phone,
          acceptsMarketing
        }
        customerUserErrors { field, message, code }
      }
    }`,
    variables: { input },
  };

  const result = await shopifyClient
    .query({
      data: graphqlQuery,
    })
    .then((response) => {
      return response.body.data;
    })
    .then(async (data) => {
      if (data.customerCreate.customer?.id) {
        const customerUpdateQuery = {
          query: `mutation customerUpdate($input: CustomerInput!) {
            customerUpdate(input: $input) {
              customer {
                id
              }
              userErrors { 
                field 
                message 
              }
            }
          }`,
          variables: {
            input: {
              id: data.customerCreate.customer?.id,
              metafields: [
                {
                  namespace: "customer",
                  key: "type",
                  value: "affiliate",
                  type: "single_line_text_field",
                },
                {
                  namespace: "affiliate",
                  key: "referral_code",
                  value: /[^/]*$/.exec(
                    `${data.customerCreate.customer?.id}`
                  )[0],
                  type: "single_line_text_field",
                },
              ],
            },
          },
        };

        await shopifyGraphql.query({
          data: customerUpdateQuery,
        });

        return data.customerCreate;
      }

      return data;
    });

  res.send(result);
});

router.post("/customerCreate", async (req, res, next) => {
  const { input, referralCode } = req.body;

  console.log("referralCode-", referralCode);

  const graphqlQuery = {
    query: `mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          firstName
          lastName,
          email,
          phone,
          acceptsMarketing
        }
        customerUserErrors { field, message, code }
      }
    }`,
    variables: { input },
  };

  const result = await shopifyClient
    .query({
      data: graphqlQuery,
    })
    .then((response) => {
      return response.body.data;
    })
    .then(async (data) => {
      if (data.customerCreate.customer?.id) {
        // Update self user type
        const customerUpdateQuery = {
          query: `mutation customerUpdate($input: CustomerInput!) {
            customerUpdate(input: $input) {
              customer {
                id
              }
              userErrors { 
                field 
                message 
              }
            }
          }`,
          variables: {
            input: {
              id: data.customerCreate.customer?.id,
              metafields: [
                {
                  namespace: "customer",
                  key: "type",
                  value: "customer",
                  type: "single_line_text_field",
                },
              ],
            },
          },
        };

        await shopifyGraphql.query({
          data: customerUpdateQuery,
        });

        // Update map mapReferrer type
        // ["6008047075489","6008047075489","6008047075489"]

        if (referralCode) {
          const id = JSON.stringify(`gid://shopify/Customer/${referralCode}`);

          await shopifyGraphql
            .query({
              data: `{ customer(id: ${id}) {
              id
              downLine: metafield(namespace: "affiliate", key: "downline") {
                value
              }
            }
          }`,
            })
            .then((response) => {
              if (response.data.customer) {
                console.log("response.data.customer", response.data.customer);
              }
            });
        }

        return data.customerCreate;
      }

      return data;
    });

  res.send(result);
});

router.put("/updateMetafield", async (req, res, next) => {
  const { input } = req.body;
  const graphqlQuery = {
    query: `mutation customerUpdate($input: CustomerInput!) {
      customerUpdate(input: $input) {
        customer {
          id
        }
        userErrors { 
          field 
          message 
        }
      }
    }`,
    variables: { input },
  };

  const result = await shopifyGraphql.query({
    data: graphqlQuery,
  });
  res.send(result);
});

router.put("/updateDownLine", async (req, res, next) => {
  const { input } = req.body;
  const graphqlQuery = {
    query: `mutation customerUpdate($input: CustomerInput!) {
      customerUpdate(input: $input) {
        customer {
          id
        }
        userErrors { 
          field 
          message 
        }
      }
    }`,
    variables: { input },
  };

  const result = await shopifyGraphql.query({
    data: graphqlQuery,
  });
  res.send(result);
});

router.post("/customerAccessTokenCreate", async (req, res, next) => {
  const { input } = req.body;
  const graphqlQuery = {
    query: `mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
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

router.get("/get", async (req, res, next) => {
  const { input } = req.body;

  const id = JSON.stringify(`gid://shopify/Customer/${input.id}`);

  const result = await shopifyGraphql.query({
    data: `{ customer(id: ${id}) {
      id
      firstName
      lastName
      acceptsMarketing
      email
      phone
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
      referralCode: metafield(namespace: "affiliate", key: "referral_code") {
        value
      }
      type: metafield(namespace: "customer", key: "type") {
        value
      }
    }
  }`,
  });

  res.send(result);
});

module.exports = router;
