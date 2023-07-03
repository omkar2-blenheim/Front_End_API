///////////Define Socket data//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const socket = io("http://localhost:4000", {
  transportOptions: {
    polling: {
      extraHeaders: {
        'socket-id': sessionStorage.getItem('socketId'), // Get the stored socket ID
      }
    }
  }
});

///////////Emit socket data to the server.js//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
socket.emit("homepage",socket.id)
///////////Create Global Variables for chatbot processes and functionality/////////////////////////////////////////////////////////////////////////////////////////////////////////////
let usr;
let usrfirstName;
let usrNullValues = [];
let Domain="HRD";
let updatedUserData;
let nocounter=0;
let skipcounter=0;
let all_vars=['buttonText','noButton','submitButton','skipButton']
let buyerguidedata=['email','firstName','lastName', 'jobtitle','country','company','Company_Turnover__c','title','jobSeniority' ,'No_of_Employees__c_contact','departmentBudget','learningAreas'];
let buttonmsg;
// for (let variable of all_vars) {
//   delete window[variable]; // Assuming the variables are global
// }

///////////Create action functionality to send queries to Query-Matching API for responses/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function send() {
  var msg = document.getElementById("message").value;
  if (msg == "") return;
  addMsg(msg);
  //DELEAY MESSAGE RESPOSE Echo
  getqueryresponse(msg,usrfirstName);
  const initial= document.getElementById('initial');
  const presetHolder= document.getElementById('preset-holder');
  const inputDiv= document.getElementById('inputDiv');
  if (presetHolder.style.display === 'none') {
    // 👇️ this SHOWS the form
    // initial.style.display = 'none';
    // presetHolder.style.display = 'block';
    // inputDiv.style.display = 'flex';
  } else {
    // 👇️ this HIDES the form
    initial.style.display = 'flex';
    presetHolder.style.display = 'none';
    inputDiv.style.display = 'flex';
    
  }
 
}

///////////Create action functionality for static frameworks for reducing user interaction time by 25%/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function framework(button) {
  buttonmsg = button.innerText;
  // console.log(buttonmsg);
  var msgnum = button.id;
  if (buttonmsg == "") return;
  if (usrNullValues.length>0 && msgnum!='Option-5'){
    addResponseMsg(`Hi ${usrfirstName}, it seems we don't have ${usrNullValues.length} detail about you which may hinder us from providing you with a tailored product Buyer-Guides and query responses! <br></br><br>Do you wish to provide these details to us?</br>`)
    generateYesNo('chatbot')
    handleYesButtonClick()
    handleNoButtonClick()
  }else if (usrNullValues.length===0 && msgnum==='Option-5'){
    window.setTimeout(addResponseMsg, 1000, `Sure ${usrfirstName}! Browse through our chatbot and in case you have trouble navigating, we have a few built-in preset choices present. Just click "Chat-initiate" to start using our select choices!`);
  }else{    
    // Emit the data to the backend
    addMsg(`${buttonmsg}`);
    let role=usr.title;
    socket.emit("respMessage", usrfirstName, buttonmsg, role, (error) => {
      if (error) {
        return alert(error);
      }
    });
    // Delayed message response echo
    socket.once("message", response =>{
      window.setTimeout(addResponseMsg, 1000, response)
    });
    const initial = document.getElementById('initial');
    const presetHolder = document.getElementById('preset-holder');
    const inputDiv = document.getElementById('inputDiv');
    if (presetHolder.style.display === 'none') {
      // Show the form
      initial.style.display = 'none';
      presetHolder.style.display = 'block';
      inputDiv.style.display = 'flex';
    } else {
      // Hide the form
      initial.style.display = 'flex';
      presetHolder.style.display = 'none';
      inputDiv.style.display = 'flex';
    }
  }
}

///////////Create Chat Initiate functionality at the start of the chat to initiate the chat-flow/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function initiateChat() {
  const initial = document.getElementById('initial');
  const presetHolder = document.getElementById('preset-holder');
  const inputDiv = document.getElementById('inputDiv');

  if (presetHolder.style.display === 'none') {
    // This SHOWS the form
    initial.style.display = 'none';
    presetHolder.style.display = 'block';
    inputDiv.style.display = 'flex';
  } else {
    // This HIDES the form
    initial.style.display = 'none';
    presetHolder.style.display = 'block';
    inputDiv.style.display = 'flex';
  }
  document.getElementById("message-box").scrollTop = document.getElementById(
    "message-box"
  ).scrollHeight;
}

function provideDetails() {  
  addResponseMsg(`${usrfirstName}, it seems that we do not have a few details about you which may hinder us from providing you with tailored product Buyer-Guides and query responses! <br></br><br>Do you wish to provide these details to us?</br>`);
  generateYesNo("chatbot");
  // Call the function to handle the click event of the "Yes" button
  handleYesButtonClick();
  // Call the function to handle the click event of the "No" button
  handleNoButtonClick();
}

function handleYesButtonClick() {
  const buttonText = this.textContent;
  yesno=document.getElementById('yesno');
  console.log('Returned Button Text:', buttonText);
  // Use the returned button text as needed
  if (buttonText === 'Yes') {
    yesno.style.display = "none";
    generateDataForm(usrNullValues, 'chatbot');
    addMsg(`Thank you ${usrfirstName}! You've selected "Yes" as your answer!`);
    const res = `Below are the fields that do not have your details! Please fill them one by one so we can move forward!`;
    window.setTimeout(addResponseMsg, 1000, res);

    const subbtn = document.getElementById('subbtn');
    const skpbtn = document.getElementById('skipbtn');

    subbtn.removeEventListener('click', handleSubButtonClick);
    subbtn.addEventListener('click', handleSubButtonClick);

    skpbtn.removeEventListener('click', handleSkipButtonClick);
    skpbtn.addEventListener('click', handleSkipButtonClick);
  }
}

function handleNoButtonClick() {
  const buttonText = this.textContent;
  yesno=document.getElementById('yesno')
  console.log('Returned Button Text:', buttonText);
  // Use the returned button text as needed
  if (buttonText === 'No') {
    yesno.style.display = "none";
    nocounter+=1
    const presetHolder = document.getElementById('preset-holder');
    const inputDiv = document.getElementById('inputDiv');
    presetHolder.style.display = 'block';
    inputDiv.style.display = 'flex';
    addMsg(`${usrfirstName}, You selected "No" as your answer!`);
    const res = `${usrfirstName}, at Contentive, we respect everyone's privacy! When it comes to sharing details we make it our priority to keep your data confidential! It's sad that you want to skip over but we understand! Feel free to use our chatbot for generic queries. And if you feel like coming back to get your tailored Buyer-Guides and query responses, we'd be happy to assist you! Just restart the chatbot from the corner and we should be able to help you!`;
    window.setTimeout(addResponseMsg, 1000, res);
  }
}

function handleSubButtonClick() {
  const submitButton = document.getElementById('subbtn');
  const initial = document.getElementById('initial');
  const formContainer = document.querySelector('.data-form');
  const inputs = formContainer.querySelectorAll('input');
  
  const buttonText = submitButton.textContent;
  console.log('Returned Button Text:', buttonText);
  // Use the returned button text as needed
  if (buttonText === 'Submit') {
    const isAnyFieldEmpty = Array.from(inputs).some(input => input.value.trim() === '');
    if (isAnyFieldEmpty) {
      alert('Please fill in all fields before submitting!');
      return;
    } else {
      document.getElementById('dataform').style.display = "none";
      document.getElementById('submitskip').style.display = "none";
      initial.style.display = 'flex';
      let buttonText = '';
      console.log(buttonText);
      // Retrieve field values from the form
      const formValues = {};
      inputs.forEach(input => {
        const key = input.name;
        const value = input.value.trim();
        formValues[key] = value;
      });

      // Populate missing data from userData JSON list
      updatedUserData = { ...usr, ...formValues };
      userData = [];
      for (const [key, value] of Object.entries(updatedUserData)) {
        userData.push({key,value });
      }
      // Populate the Null Value array for enrichment: -
      usrNullValues = userData.filter(item => (item.value === null || item.value === '') && (!item.key.includes("enriched"))).map(item => item.key);
      usrNullValues = usrNullValues.filter(column => buyerguidedata.includes(column));
      console.log(usrNullValues); 
      console.log(updatedUserData);
      const inputDiv = document.getElementById('inputDiv');
      inputDiv.style.display = 'flex';
      let role=usr.title;
      addMsg(buttonmsg);
      socket.emit("respMessage", usrfirstName, buttonmsg, role, (error) => {
        if (error) {
          return alert(error);  
        }
      });
      // Delayed message response echo
      socket.once("message", response =>{
        window.setTimeout(addResponseMsg, 1000, response)
      });
    }
  }
}


function handleSkipButtonClick() {
  const skipButton = document.getElementById('skipbtn');
  const initial = document.getElementById('initial');

  const buttonText = skipButton.textContent;
  console.log('Returned Button Text:', buttonText);
  // Use the returned button text as needed
  if (buttonText === 'Skip') {
    skipcounter+=1
    document.getElementById('dataform').style.display = "none";
    document.getElementById('submitskip').style.display = "none";
    initial.style.display = 'flex';
    let buttonText = '';
    console.log(buttonText);
  }
}
///////////Add Chat form to initiate Data-collection for user-data enrichment/////////////////////////////////////////////////////////////////////////////////////////////////////////////
let bgcols=[]
usrNullValues.forEach(column => {
  if (buyerguidedata.includes(column)) {
    bgcols.push(column)
    console.log(`Matching column found: ${column}`);
    // Perform actions for matching column
  } else {
    console.log(`No matching column found for: ${column}`);
    // Perform actions for non-matching column
  }
});

///////////Create Buyer Guide functionality at the start of the chat to call the Buyer-Guide API/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const buyer = document.getElementById('buyer');
buyer.addEventListener('click', handleBuyerClick);

function handleBuyerClick() {
  const initial = document.getElementById('initial');
  const inputDiv = document.getElementById('inputDiv');
  const buttonText = document.getElementById('buyer').innerText;
  if (buttonText === "") return;
  if (usrNullValues.length>0){
    addResponseMsg(`Hi ${usrfirstName}, it seems we don't have ${usrNullValues.length} detail about you which may hinder us from providing you with a tailored product Buyer-Guides and query responses! <br></br><br>Do you wish to provide these details to us?</br>`)
    generateYesNo('chatbot')
    handleYesButtonClick()
    handleNoButtonClick()
    initial.style.display="none"
  }else{
    const response = `Preparing your ${buttonText}!`;
    addMsg(`You clicked ${buttonText}!`);
    setUser(usr);
    // Delayed message response echo
    setTimeout(() => {
      addResponseMsg(response);
      inputDiv.style.display = 'flex';
    }, 1000);
  }
}


// This is in the preset choices with same functionality
const buyerpreset = document.getElementById('buyer-preset');
buyerpreset.addEventListener('click', handleBuyerPresetClick);

function handleBuyerPresetClick() {
  const presetHolder = document.getElementById('preset-holder');
  const initial = document.getElementById('initial');
  if (usrNullValues.length>0){
    addResponseMsg(`Hi ${usrfirstName}, it seems we don't have ${usrNullValues.length} detail about you which may hinder us from providing you with a tailored product Buyer-Guides and query responses! <br></br><br>Do you wish to provide these details to us?</br>`)
    generateYesNo('chatbot')
    handleYesButtonClick()
    handleNoButtonClick()
    initial.style.display === 'none'
  }else{
    if (initial.style.display === 'none') {
      // Show the form
      initial.style.display = 'flex';
      presetHolder.style.display = 'none';
      
      const buttonText = document.getElementById('buyer-preset').innerText;
      if (buttonText === "") return;
      
      const response = `Preparing your ${buttonText}!`;
      addMsg(`You clicked ${buttonText}!`);
      setUser(usr);
      // Delayed message response echo
      setTimeout(() => {
        addResponseMsg(response);
      }, 1000);
    } else {
      // Hide the form
      initial.style.display = 'none';
      presetHolder.style.display = 'block';
    }
  }
}




///////////Create User-Query functionality to populate the chatbot area/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function addMsg(msg) {
  var div = document.createElement("div");
  div.innerHTML =
    "<span style='flex-grow:1'></span><div class='chat-message-sent'>" +
    msg +
    "</div>";
  div.className = "chat-message-div";
  document.getElementById("message-box").appendChild(div);
  //SEND MESSAGE TO API
  document.getElementById("message").value = "";
  document.getElementById("message-box").scrollTop = document.getElementById(
    "message-box"
  ).scrollHeight;
  showTypingIndicator();
}

///////////Create Chatbot-Response functionality to populate the chatbot area/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function addResponseMsg(msg) {
  removeTypingIndicator();
  var div = document.createElement("div");
  div.innerHTML = "<div class='chat-message-received'>"+ msg +"</div>";
  div.className = "chat-message-div";
  document.getElementById("message-box").appendChild(div);
  document.getElementById("message-box").scrollTop = document.getElementById(
    "message-box"
  ).scrollHeight;
}

///////////Create Typing-Indicator functionality to populate the chatbot area/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function showTypingIndicator() {
  var div = document.createElement("div");
  div.innerHTML = "<div class='typing-indicator'></div>";
  div.className = "chat-message-div";
  div.id = "typing-indicator";
  document.getElementById("message-box").appendChild(div);
  document.getElementById("message-box").scrollTop = document.getElementById("message-box").scrollHeight;
}

function removeTypingIndicator() {
  var typingIndicator = document.getElementById("typing-indicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }
}
///////////Create Text-Input functionality to populate the chatbot area/////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("message").addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    send();
    }
});


///////////Access User-Data from server.js for further processing and data enrichment/////////////////////////////////////////////////////////////////////////////////////////////////////////////

socket.on("userDetails", userDetails => {
  setTimeout(() => {
    usr = JSON.parse(userDetails);
    updatedUserData = { ...usr }
    // Access the usrfirstName value here: -
    usrfirstName=usr.firstName
    usrfirstName=usrfirstName[0]+usrfirstName.toLowerCase().substring(1)
    // console.log(`User Details received at Homepage: ${userDetails}`)
    console.log(usr);
    userData = [];
    for (const [key, value] of Object.entries(updatedUserData)) {
      userData.push({key,value });
    }
    // console.log(`First Name: ${usrfirstName}`);
    // Populate the Null Value array for enrichment: -
    usrNullValues = userData.filter(item => (item.value === null || item.value === '') && (!item.key.includes("enriched"))).map(item => item.key);
    console.log(usrNullValues);  
  }, 10);
});
///////////Creata Chatbot Functionality to initiate the chat window at login/////////////////////////////////////////////////////////////////////////////////////////////////////////////

setTimeout(() => {
  document.getElementById("chatbot").classList.remove("collapsed");
  document.getElementById("chatbot_toggle").children[0].style.display = "none";
  document.getElementById("chatbot_toggle").children[1].style.display = "";
  // initial.style.display = 'flex';
  addResponseMsg(`Hi ${usrfirstName}, welcome to your AI-powered Domain-Assistant (A.D.A.), would you like to:<li>Chat and explore what we have to offer? <dd>- Click Chat Initiate</dd></li><li>Create your specific product Buyer's guide? <dd>- Click Buyer's Guide</dd></li>`);
  // Add click event listener to the chat preset button
  const chatInitiate = document.getElementById('chatpreset');
  chatInitiate.addEventListener('click', initiateChat);
  document.getElementById("message-box").scrollTop = document.getElementById(
    "message-box"
  ).scrollHeight;
  
},1000)

///////////Next step for user-data enrichment from the user/////////////////////////////////////////////////////////////////////////////////////////////////////////////



///////////Creata Chatbot Functionality to initiate the chat window at login/////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("chatbot_toggle").onclick = function () {
  if (document.getElementById("chatbot").classList.contains("collapsed")) {
    document.getElementById("chatbot").classList.remove("collapsed");
    document.getElementById("chatbot_toggle").children[0].style.display = "none";
    document.getElementById("chatbot_toggle").children[1].style.display = "";
    addResponseMsg(`Hi ${usrfirstName}, welcome to your AI-powered Domain-Assistant (A.D.A.), would you like to:<li>Chat and explore what we have to offer? <dd>- Click Chat Initiate</dd></li><li>Create your specific product Buyer's guide? <dd>- Click Buyer's Guide</dd></li>`);
    const presetHolder = document.getElementById('preset-holder');
    const yesno = document.getElementById('yesno');
    if (presetHolder.style.display === 'none') {
      initial.style.display = 'flex';
      presetHolder.style.display = 'none';
      yesno.style.display = "none";
    } else {
      initial.style.display = 'flex';
      presetHolder.style.display = 'none';
      yesno.style.display = "none";
    }
  } else {
    document.getElementById("chatbot").classList.add("collapsed");
    document.getElementById("chatbot_toggle").children[0].style.display = "";
    document.getElementById("chatbot_toggle").children[1].style.display = "none";
    const presetHolder = document.getElementById('preset-holder');
    const yesno = document.getElementById('yesno');
    if (presetHolder.style.display === 'none') {
      initial.style.display = 'flex';
      presetHolder.style.display = 'none';
      yesno.style.display = "none";
    } else {
      initial.style.display = 'flex';
      presetHolder.style.display = 'none';
      yesno.style.display = "none";
    }
    const chatContainer = document.getElementById("message-box");
    socket.emit('chathistory', JSON.stringify(chatContainer.innerHTML));
    chatContainer.innerHTML = "";
  }
}

///////////Utilise Query-Matching API to receive query responses based on user data provided/////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function getqueryresponse(msg, uservalue,domain) {
  const url = 'http://localhost:5000/SearchQuery';
  const data = {
    query: msg,
    domain: domain,
    user_details: {
      name: uservalue
    }
  };

  fetch(url, {
    method: 'POST',
    mode:"cors",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(result=>{
      // Handle the response data here
      const responseValue = result.response;
      const formattedResult = JSON.stringify(responseValue, null, 2);
      const formattedHTML1 = `${formattedResult.replace(/\\n\\n/g, '<br>').replace(/\\n/g, '').replace(/^"(.*)"(.*)$/, '$1').replace(/(.*)"$/, '')}`;
      const formattedHTML2 =`${formattedHTML1}`;
      addResponseMsg(JSON.stringify(formattedHTML2));
    })
    .catch(error => {
      // Handle any errors that occur during the request
      console.error('Error:', error);
    });
}

///////////Utilise Buyer's Guide API to send Buyer-Guide outputs to the S3 bucket/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function setUser(userdata) {
  const url = 'http://localhost:5000/set_user';
  const data = userdata;

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(result => {
      // Handle the response data here
      console.log(result);
    })
    .catch(error => {
      // Handle any errors that occur during the request
      console.error('Error:', error);
    });
}
///////////Generate a Chat form to initiate Data-collection for user-data enrichment/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function generateDataForm(usrNullValues, chatAreaId) {
  // Remove previous form container
  const oldFormContainer = document.getElementById('dataform');
  if (oldFormContainer) {
    oldFormContainer.remove();
  }

  // Remove previous buttons container
  const oldButtonsContainer = document.getElementById('submitskip');
  if (oldButtonsContainer) {
    oldButtonsContainer.remove();
  }

  // Generate the data form HTML
  const formContainer = document.createElement('div');
  formContainer.id = 'dataform';
  formContainer.className = 'data-form';
  formContainer.style.display = 'flex';
  formContainer.style.flexWrap = 'wrap';
  formContainer.style.gap = '10px';

  usrNullValues.forEach(key => {
    const inputContainer = document.createElement('div');
    inputContainer.style.display = 'flex';
    inputContainer.style.flexDirection = 'column';
    inputContainer.className = 'form-input-div'; // Assign the desired class name

    const input = document.createElement('input');
    input.type = 'text';
    input.name = key;
    input.placeholder = key;
    input.className = 'form-input-message';
    inputContainer.appendChild(input);

    formContainer.appendChild(inputContainer);
  });

  // Create a container for the buttons and form
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';

  // Append the form container to the container
  container.appendChild(formContainer);

  // Add submit button
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Submit';
  submitButton.className = 'submit-button';
  submitButton.id = 'subbtn';
  submitButton.removeEventListener('click', handleSubButtonClick); // Remove previous event listener
  submitButton.addEventListener('click', handleSubButtonClick);

  // Add skip button
  const skipButton = document.createElement('button');
  skipButton.textContent = 'Skip';
  skipButton.className = 'skip-button';
  skipButton.id = 'skipbtn';
  skipButton.removeEventListener('click', handleSkipButtonClick); // Remove previous event listener
  skipButton.addEventListener('click', handleSkipButtonClick);

  // Create a container for the buttons
  const buttonsContainer = document.createElement('div');
  buttonsContainer.id = 'submitskip';
  buttonsContainer.className = 'subskip-container';
  buttonsContainer.style.display = 'flex';
  buttonsContainer.style.gap = '10px';

  buttonsContainer.appendChild(submitButton);
  buttonsContainer.appendChild(skipButton);

  // Append the buttons container to the container
  container.appendChild(buttonsContainer);

  // Append the container to the chat area
  const chatArea = document.getElementById(chatAreaId);
  chatArea.appendChild(container);
}

let buttonText = '';


function generateYesNo(chatAreaId) {
  const presetHolder = document.getElementById('preset-holder');
  const inputDiv = document.getElementById('inputDiv');
  presetHolder.style.display = 'none';
  inputDiv.style.display = 'none';

  // Remove previous container
  const oldButtonsContainer = document.getElementById('yesno');
  if (oldButtonsContainer) {
    oldButtonsContainer.remove();
  }

  // Remove previous event listeners
  const yesButton = document.getElementById('yesbtn');
  const noButton = document.getElementById('nobtn');
  if (yesButton) {
    yesButton.removeEventListener('click', handleYesButtonClick);
  }
  if (noButton) {
    noButton.removeEventListener('click', handleNoButtonClick);
  }

  // Add yes button
  const newYesButton = document.createElement('button');
  newYesButton.textContent = 'Yes';
  newYesButton.className = 'yes-button';
  newYesButton.id = 'yesbtn';
  newYesButton.addEventListener('click', handleYesButtonClick);

  // Add no button
  const newNoButton = document.createElement('button');
  newNoButton.textContent = 'No';
  newNoButton.className = 'no-button';
  newNoButton.id = 'nobtn';
  newNoButton.addEventListener('click', handleNoButtonClick);

  // Create a container for the buttons
  const buttonsContainer = document.createElement('div');
  buttonsContainer.id = 'yesno';
  buttonsContainer.className = 'yesno-container';
  buttonsContainer.style.display = 'flex';
  buttonsContainer.style.gap = '10px';
  buttonsContainer.style.flexDirection = 'column';
  buttonsContainer.appendChild(newYesButton);
  buttonsContainer.appendChild(newNoButton);

  // Append the buttons container to the chat area
  const chatArea = document.getElementById(chatAreaId);
  chatArea.appendChild(buttonsContainer);
}







///////////Below this is old edits that did not work but may be needed for future testing/////////////////////////////////////////////////////////////////////////////////////////////////////////////

// function getParameterByName(name, url) {
//   if (!url) url = window.location.href;
//   name = name.replace(/[\[\]]/g, '\\$&');
//   var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
//     results = regex.exec(url);
//   if (!results) return null;
//   if (!results[2]) return '';
//   return decodeURIComponent(results[2].replace(/\+/g, ' '));
// }

// // Get the value of the 'uservalue' parameter from the URL
// var uservalue = getParameterByName('email');
// console.log(uservalue)
// userJSON=JSON.stringify(uservalue)
// function handleSubmit() {
//   const formContainer = document.querySelector('.data-form');
//   const inputs = formContainer.querySelectorAll('input');

//   // Check if any field is empty
//   const isAnyFieldEmpty = Array.from(inputs).some(input => input.value.trim() === '');
//   if (isAnyFieldEmpty) {
//     alert('Please fill in all fields before submitting!');
//     return;
//   }

//   // Retrieve field values from the form
//   const formValues = {};
//   inputs.forEach(input => {
//     const key = input.name;
//     const value = input.value.trim();
//     formValues[key] = value;
//   });

//   // Populate missing data from userData JSON list
//   updatedUserData = { ...usr, ...formValues };

//   // Handle form submission logic
//   // You can access the updatedUserData object and process it as needed
//   addResponseMsg(`Great! Thank you for submitting the requested data, ${usrfirstName}, we can now move with your queries!`);
//   console.log(`Form submitted and here is the updated data ${JSON.stringify(updatedUserData)}`);

//   // Hide the form container
//   formContainer.style.display = 'none';
// }


// function handleSkip() {
//   // Handle skip button logic here
//   addResponseMsg(`No worries, ${usrfirstName}! Thank you for letting us know, we will try our level-best to provide responses to your queries but due to the missing information, those would be generic!`)
//   console.log('Skipped');
// }
