const socket = io("http://localhost:4000", {
  transportOptions: {
    polling: {
      extraHeaders: {
        'socket-id': sessionStorage.getItem('socketId'), // Get the stored socket ID
      }
    }
  }
});
const homepageURL = `homepage.html`;
  setTimeout(() => {
    window.location.href = "homepage.html"; // Redirect to homepage.html
  }, 2500);

// let usr; // Declare usr variable outside the event listener

// socket.on("connect", () => {
//   socket.on('user', receivedUsr => {
//     usr = receivedUsr; // Assign receivedUsr to usr variable
//     console.log(usr);
//   });
// Retrieve the email parameter from the URL
// const urlParams = new URLSearchParams(window.location.search);
// const email = urlParams.get('email');

// Redirect to the homepage with the email parameter
// const homepageURL = `homepage.html`;
//   setTimeout(() => {
//     window.location.href = homepageURL; // Redirect to homepage.html
//     socket.on("user",usr=>{
//       socket.emit(usr)
//     })
//   }, 5000);

  // console.log(`Here is the Redirect Page along with ${email} data`);
// });

// const socket = io.connect("http://localhost:3000", {
//   transportOptions: {
//     polling: {
//       extraHeaders: {
//         'socket-id': sessionStorage.getItem('socketId'), // Get the stored socket ID
//       }
//     }
//   }
// });

// let usr; // Declare usr variable outside the event listener

// socket.on("connect", () => {
//   socket.on('user', receivedUsr => {
//     usr = receivedUsr; // Assign receivedUsr to usr variable
//     console.log(usr);

//     // Introduce a delay of 2.5 seconds before transitioning to the homepage
//     setTimeout(() => {
//       // Fetch the homepage content dynamically using AJAX
//       fetch('homepage/homepage.html')
//         .then(response => response.text())
//         .then(content => {
//           // Update the current page with the fetched homepage content
//           document.documentElement.innerHTML = content;
          
//           // You can now access the homepage elements and interact with the socket as needed
//           const welcomeMessage = document.getElementById('welcome-message');
//           welcomeMessage.textContent = `Welcome, ${usr}!`;
          
//           // ... Additional logic for the homepage
//         })
//         .catch(error => {
//           console.error('Error fetching homepage content:', error);
//         });
//     }, 2500); // Delay of 2.5 seconds (2500 milliseconds)
//   });

//   console.log(`Here is the Redirect Page along with ${usr} data`);
// });
