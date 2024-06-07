const { default: axios } = require("axios");

async function getUserData(accessToken) {
  try {
    const response = await axios.get("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

async function getEmails(accessToken) {
  try {
    const allEmails = [];

    // Fetching emails from the first response
    await axios
      .get("https://graph.microsoft.com/v1.0/me/messages", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then(async (response) => {
        console.log("response.data.valu", response?.data?.value?.length);
        // Add emails from the first response to the allEmails array
        allEmails.push(...response?.data?.value);
        
        // Fetching more emails from the second response
        console.log("allEmails", allEmails.length);
        return allEmails
      })
      .catch((err) => {
        console.log("err", err);
      });
      return allEmails;
  } catch (error) {
    console.error("Error fetching user Mails:", error);
    throw error;
  }
}

async function loadMore(accessToken, skipNum) {
  try {
    const response = await axios.get(
      `https://graph.microsoft.com/v1.0/me/messages?$top=10&$skip=${skipNum}`, //loading more mails
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response?.data.value;
  } catch (error) {
    console.log("Error",error);
    throw error;
  }
}

module.exports = { getUserData, getEmails, loadMore };
