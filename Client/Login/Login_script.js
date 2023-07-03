var running = false;
let usr;
const socket = io("http://localhost:4000", {
  query: {
    sessionId: "LoginHTML", // Replace with the actual session ID
  },
});
socket.on("connect", () => {
  sessionStorage.setItem("socketId", socket.id);
});

function formvalid() {
  var validpass = document.getElementById("pass").value;
  if (validpass.length <= 8 || validpass.length >= 20) {
    document.getElementById("vaild-pass").innerHTML = "Minimum 8 characters";
    return false;
  } else {
    document.getElementById("vaild-pass").innerHTML = "";
  }
};

function show() {
  var x = document.getElementById("pass");
  if (x.type === "password") {
    document.getElementById("showing").src ="https://static.thenounproject.com/png/777494-200.png";
    x.type = "text";
  } else {
    document.getElementById("showing").src ="https://cdn2.iconfinder.com/data/icons/basic-ui-interface-v-2/32/hide-512.png";
    x.type = "password";
  }
};

function send() {
  if (running == true) return;
  running = true;
  usr= document.getElementById('user').value;
  socket.emit("user",(usr));
  // console.log(`User emitted from Login!`)
}
document.getElementById("user").addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    usr= document.getElementById('user').value;
    socket.emit("user",(usr));
    // console.log(`User emitted from Login!`)
    }
});