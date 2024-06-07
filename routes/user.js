const express = require("express");
const router = express.Router();

const { PublicClientApplication } = require("@azure/msal-node");
const axios = require("axios");
const oauth2 = require("simple-oauth2");
const { getEmails, getUserData } = require("../services/graphServices");
const {
  saveUserData,
  getUserByEmail,
  saveUserEmails,
} = require("../services/elasticServices");
// Configurations
const config = {
  auth: {
    clientId: process.env.CLIENT_ID,
    authority: "https://login.microsoftonline.com/common",
    clientSecret: process.env.SECRET_KEY,
    redirectUri: "http://localhost:3000/auth/redirect",
  },
};

const pca = new PublicClientApplication(config);

// Set up OAuth2 client
const client = new oauth2.AuthorizationCode({
  client: {
    id: config.auth.clientId,
    secret: config.auth.clientSecret,
  },
  auth: {
    tokenHost: "https://login.microsoftonline.com",
    authorizePath: "common/oauth2/v2.0/authorize",
    tokenPath: "common/oauth2/v2.0/token",
  },
});

// Generate a random state value to mitigate CSRF attacks
const state = Math.random().toString(36).substring(7);

// Authorization URL
const authorizationUri = client.authorizeURL({
  redirect_uri: config.auth.redirectUri,
  scope: "https://graph.microsoft.com/.default",
  state: state,
});
router.post("/createLocalUser", async (req, res) => {
  try {
    // Check if user exists using search by email
    const email = req.body.email;
    const existingUser = await getUserByEmail(email);
    req.session.email = email;
    if (existingUser?.localMail == email) {
      res.status(200).send({
        success: true,
        message: "User already exists",
        data: existingUser,
      });
    } else {
      // Create new user using saveUserData
      const userData = { localMail: email, linkedwithOutlook: false }; // Assuming other required fields are handled elsewhere
      const response = await saveUserData(userData);

      res.status(201).send({
        // Use 201 for created resources
        success: true,
        message: "User created successfully",
        data: {
          email,
        },
      });
    }
  } catch (error) {
    console.error("Error creating local user:", error);
    res.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
});
// Redirect to the authorization URL
router.get("/", (req, res) => {
  res.redirect(authorizationUri);
});

// Callback service parsing the authorization token and asking for the access token
router.get("/redirect", async (req, res) => {
  const { code, state: receivedState } = req.query;

  // Validate state to prevent CSRF attacks
  if (receivedState !== state) {
    return res.status(400).send("Invalid state parameter");
  }
  console.log("rece", receivedState);
  const tokenParams = {
    code: code,
    redirect_uri: config.auth.redirectUri,
    scope: "https://graph.microsoft.com/.default",
  };

  try {
    const accessToken = await client.getToken(tokenParams);
    const profileData = await getUserData(accessToken.token.access_token);
    profileData.accessToken = accessToken.token.access_token;
    await getEmails(accessToken.token.access_token).then(
      async (getAllEmails) => {
        profileData.emails = getAllEmails;
        profileData.linkedwithOutlook = true;
        profileData.localMail = req.session.email;
        const saveData = await saveUserData(profileData);
      }
    );

    //get email problem will look at this
    res.redirect("/list");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Function to get emails

module.exports = router;
