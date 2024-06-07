const express = require("express");
const {
  getUserByEmail,
  saveUserEmails,
  saveUserData,
} = require("../services/elasticServices");
const { getEmails, loadMore } = require("../services/graphServices");
const router = express.Router();

// Middleware to check if the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("User not authenticated. Please sign in first.");
}

router.get("/get-mails/:id", async (req, res) => {
  try {
    console.log("id", req.params.id);
    // const userAccessToken = req.session.accessToken;
    const needEmailData = [];
    const encodedId = req.params.id;
    const isUserExist = await getUserByEmail(encodedId);
    if (isUserExist) {
      // const getEmail = isUserExist.email
      const emailData = isUserExist?.emails;
      console.log(emailData[0]);
      for (let i = 0; i < emailData.length; i++) {
        const useremail = {
          createdDateTime: emailData[i].createdDateTime,
          subject: emailData[i].subject,
          bodyPreview: emailData[i].bodyPreview,
          parentFolderId: emailData[i].parentFolderId,
          isRead: emailData[i].isRead,
          isDraft: emailData[i].isDraft,
          body: emailData[i].body,
          id: emailData[i].id,
          sender:
            emailData[i]?.sender?.emailAddress?.name ||
            emailData[i]?.sender?.emailAddress?.address ||
            "donotreply",
        };
        needEmailData.push(useremail);
      }
      res.status(200).send({
        linkedwithOutlook: isUserExist?.linkedwithOutlook,
        data: needEmailData,
      });
    } else {
      console.log("Document not found");
      res.status(404).json({
        linkedwithOutlook: false,
        message: "Document not found",
      });
    }
  } catch (error) {
    res.status(500).send(error);
    console.log("Error fetching messages:", error.message);
  }
});

router.post("/loadmoreemail", async (req, res) => {
  try {
    const userExist = await getUserByEmail(req.body.email);

    if (userExist?.localMail === req.body.email) {
      const responseEmail = await getEmails(userExist.accessToken);

      if (responseEmail.length >= 10) {
        await loadMore(userExist.accessToken, responseEmail.length).then(
          async (loadedResponse) => {
            responseEmail.push(...loadedResponse);
            await saveUserData({
              emails: responseEmail,
              localMail: userExist.localMail,
            });
          }
        );
      }

      res.send("Email Synced");
    } else {
      res.send("userNotFound");
    }
  } catch (error) {
    res.status(500).send("Error fetching messages");
    console.error("Error fetching messages:", error);
  }
});

module.exports = router;
