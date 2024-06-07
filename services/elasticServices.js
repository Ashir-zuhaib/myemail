const { elasticClient } = require("../utils/elastic-client");

const saveUserData = async (userData) => {
  try {
      const response = await elasticClient.index({
          index: 'users',
          id: userData.localMail,
          body: {
            localMail:userData.localMail,
              email: userData?.mail,
              name: userData?.name,
              id: userData?.id,
              accessToken: userData?.accessToken,
              timestamp: new Date(),
              emails:userData?.emails,
              linkedwithOutlook:userData?.linkedwithOutlook
          },
          refresh: 'true' 
      });
      return response;
  } catch (error) {
      console.error('Error saving user data to Elasticsearch:', error);
      throw error;
  }
};

const saveUserEmails = async (emailData, email) => {
    try {
        const response = await elasticClient.index({
            index: 'users',
            id: email, 
            body: {emails:emailData}
        });
        return response;
    } catch (error) {
        console.error('Error saving email data to Elasticsearch:', error);
        throw error;
    }
};
async function getUserByEmail(email) {

    try {
        const response = await elasticClient.search({
            index: 'users',
            body: {
                "query": {
                    "match_phrase": {
                        "localMail": email
                    }
                }
            }
        });
        const hits = response.hits.hits;
        console.log("hits", hits);
        if (hits.length > 0) {
            return hits[0]._source; // First document matching the email
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error searching user by email:', error);
        throw error; // Re-throw for handling in the main route
    }
}


module.exports={saveUserData,saveUserEmails,getUserByEmail}