const functions = require("firebase-functions");


// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const admin = require("firebase-admin");
const Busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");
const {Storage} = require("@google-cloud/storage");

// Initialize Firebase Admin and Cloud Storage
admin.initializeApp();
const storage = new Storage({
  projectId: "test-project-38dc7",
});
const bucket = storage.bucket("test-project-38dc7.appspot.com");

exports.uploadFileAndSendEmail = functions.https.onRequest((req, res) => {
  const busboy = new Busboy({headers: req.headers});
  const formData = {};

  busboy.on("file", (file, filename, mimetype) => {
    const filepath = path.join(os.tmpdir(), filename);
    file.pipe(fs.createWriteStream(filepath));
    formData["file"] = {filepath, mimetype};
  });

  busboy.on("field", (fieldname, val) => {
    formData[fieldname] = val;
  });

  busboy.on("finish", async () => {
    // Upload the file to Cloud Storage
    const fileUpload = formData["file"];
    if (fileUpload) {
      bucket.upload(fileUpload.filepath, {
        uploadType: "media",
        metadata: {
          metadata: {
            contentType: fileUpload.mimetype,
          },
        },
      })
          .then((data) => {
            const file = data[0];
            return file.makePublic().then(() => {
              return file.metadata.mediaLink; // URL of the uploaded file
            });
          })
          .then((publicUrl) => {
            // Now send email with the URL link to the file
            // sendEmailFunction is function you've defined to send emails
            return sendEmailFunction(formData["name"], formData["email"],
                formData["phone"], formData["subject"],
                formData["message"], publicUrl);
          })
          .then(() => res.status(200).send("Email sent with file link."))
          .catch((err) => {
            console.error(err);
            res.status(500).send("Failed to upload and send email.");
          });
    }
  });

  busboy.end(req.rawBody);
});

const sgMail = require("@sendgrid/mail");

// Set SendGrid API key
sgMail.setApiKey(functions.config().sendgrid.key);
/**
* send email.
* @param {text} name
* @param {text} email
* @param {text} phone
* @param {text} subject
* @param {text} message
* @param {text} fileUrl
* @return {text} the email is sent
*/
function sendEmailFunction(name, email, phone, subject, message, fileUrl) {
  const msg = {
    to: "reynandainc1@gmail.com",
    from: "yvanreddit@gmail.com",
    subject: subject,
    html: `Name: ${name}<br>Email: ${email}<br>Phone: ${phone}
    <br>Message: ${message}<br>File: <a href="${fileUrl}">View File</a>`,
  };
  return sgMail.send(msg);
}
