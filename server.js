
require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const { Configuration, OpenAIApi } = require("openai");
const async=require("async");
// const bodyParser = require('body-parser');
const csv = require('csv-parser');
const aws= require("aws-sdk");
const cheerio = require('cheerio');
const session = require("express-session");
const sessionMiddleware = session({
  secret: "your-session-secret",
  resave: true,
  saveUninitialized: true,
});

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;
const io = socketIO(server);

// OpenAI API configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const wd="/Users/omkarpatil/Desktop/Contentive/Backend_API/Contentive_Domain_Chatbot";
app.use(express.static(wd));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.get('/', (req, res) => {
//   // userEmail=req.body.email;
//   res.sendFile(wd+'/Client/Login/Login.html');
// });
app.get('/', (req, res) => {
  res.sendFile(wd + '/Client/Login/Login.html');
});
let Domain="Human Resource";
let userDetails;
let email;
let homepageid=null;
let msg;

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
aws.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey
})
const s3 = new aws.S3();
const bucketName = 'contentivechatbotdestination';
const fileKey = 'leadsBackUP/updated_peoples.csv';

function getUserDataByEmail(email, userData) {
  for (let i = 0; i < userData.length; i++) {
    if (userData[i].email === email) {
      return userData[i];
    }
  }
  return null; // Return null if no user with the specified email is found
}
const csvData = [];
const params = {
  Bucket: bucketName,
  Key: fileKey,
};
s3.getObject(params)
  .createReadStream()
  .pipe(csv())
  .on('data', (data) => {
    csvData.push(data);
  })
  .on("end", () => {
    io.on("connection", (socket) => {
      // Initialize the conversation history
      // console.log(`Socket with socket_ID: ${socket.id} started!\n`)
      socket.on("user",(email)=>{
        email=email
        // console.log(`New User with ${email} just connected to Backend\n\n`);
        userDetails = JSON.stringify(getUserDataByEmail(email, csvData));
        console.log(`User details are is ${userDetails}\n ${JSON.parse(userDetails).title}`);
      });
      if(homepageid==null){
        socket.on('homepage',socketid=>{
        console.log(`Socket with socket_ID: ${socket.id} started!\n`)
          homepageid=socket;
          // console.log(`The user now connected via: ${socketid}`)
          socket.emit('user',email);
          socket.emit('userDetails',userDetails);
        })
      }
      // socket.on("framework",(user, msg,role) =>{
      //   socket.emit('respMessage',user,msg,role);
      //   // console.log(`${role}`)
      // })
      const conversationHistory = [];
      socket.on('chathistory',data=>{
        const messageHistory=[]
        messageHistory.push(JSON.parse(data));
        const htmlCode = cheerio.load(messageHistory[0]);
        // Create an empty object to store the chat messages
        const chatMessages = {
          "userQuery": {},
          "chatbotResponse": {}
        };
        // Select all the chat message elements with class "chat-message-div"
        const chatMessageDivs = htmlCode('.chat-message-div');

        // Iterate over the chat message elements and extract the content
        chatMessageDivs.each((index, element) => {
          const sentMessage = htmlCode(element).find('.chat-message-sent');
          const receivedMessage = htmlCode(element).find('.chat-message-received');

          if (sentMessage.length > 0 & index>0) {
            chatMessages["userQuery"]["Query-"+index] = sentMessage.text().trim();
          }

          if (receivedMessage.length > 0 & index>1) {
            chatMessages["chatbotResponse"]["Response-"+(index-1)] = receivedMessage.text().trim();
          }
        });

        // Convert the chatMessages object to JSON
        const jsonList = JSON.parse(JSON.stringify(chatMessages));

        // console.log(jsonList[`userQuery`]);
        // console.log(jsonList[`chatbotResponse`]);
      });

      socket.on("respMessage", async (user, msg, role, callback) => {
        try {
          // Add the user message to the conversation history
          const sysprompt=`You are ADA, an AI-powered Domain Assistant, for ${Domain} domain. Share your identity as ADA along with your domain only if asked by user. Respond if query: "${msg}" is related to the ${Domain} domain. If not related to ${Domain} domain, ask the user to strictly stick to the ${Domain} domain, do not mention anything other than that unless asked by the user.`
          msg=msg+` for my Job-title as ${role} and my domain ${Domain}`
          conversationHistory.push({ role: "user", content: msg });
          console.log(`${user} has sent the response`);
          const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{role:"system",content:sysprompt},{ role: "user", content: msg }],
            temperature:0.1,
            top_p:1,
            presence_penalty:2,
            frequency_penalty:2,
          });

          const response = completion.data.choices[0].message.content;
          console.log(`${response}\n`);
          // Add the assistant's response to the conversation history
          conversationHistory.push({role:'assistant',content:response});
          socket.emit("message", response);
          callback();
        } catch (error) {
          console.error(error);
          callback("Error: Unable to connect to the chatbot");
        }
      });

      socket.on("disconnect", () => {
        // console.log(`Client with ID ${socket.id} disconnected\n`);
        if (socket === homepageid) {
          homepageid = null;
        }
      });
    });

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    })
})
  .on("error", (error) => {
    console.error("Error processing CSV file:", error);
  });
