let prev;
let ready = false;
let thisme
let room;
const cleanInput = input => $('<div/>').text(input).html();
const socket = io();

const displayNotification = (room,nick,sender,text) => {
  if (Notification.permission == 'granted' && document.hidden) {
    navigator.serviceWorker.getRegistration().then(function(reg) {
      const options = {
        data : {
          nick,
          room
        },
        icon: 'images/icons/icon-72x72.png'
      }
      reg.showNotification(`${sender} : ${text}`,options);
    });
  }
}

const params = (new URL(document.location)).searchParams;
if(!ready){
  if(!params.get('nick')){
  }
  else {
    const nick = cleanInput(params.get('nick').trim());
    params.get('room') ? room = params.get('room') : room = ''
    thisme = nick;
    socket.emit("join", nick,room);
    ready = true;
    document.querySelector('.mainwrapper').style.display = 'flex'
    document.querySelector('#login').style.display = 'none'
    if('Notification' in window){
      Notification.requestPermission(function(status) {
        console.log('Notification permission status:', status);
      });
    }
  }
}

$("#sendform").submit( () => {
  const message = cleanInput($('#m').val());
  
  if(message){
    socket.emit('chat message', $('#m').val(),room);
    $('#m').val('');
  }
  
  return false;
});


socket.on("add-person", (nick,id) => {
  console.log(nick)
  if(ready){
    $('#online').append('<li id="' + id + '">' + nick);
  }
    
  })  

socket.on("remove-person", (nick) => {
  console.log(nick);
  $('#'+nick).remove();
});

socket.on("update", (msg) => {
  $('#messages').append('<li id="update" >' + msg);
  prev='';
})

socket.on("people-list", (people) => {
  for (person in people) {
      $('#online').append('<li id="' + people[person].id + '">' + people[person].nick);
  }
});

socket.on("disconnect", () => {
  $('#messages').append("<li id=\"update\">You have lost connection to server, check your internet or try to refresh the page");
  $('#sendform').hide();
});
socket.on("reconnect", ()=>{
  location.reload()
})
socket.on('chat message', (nick, msg) => {
  if (prev == nick) {
    $('#messages li:last-child > div').append("<div>" + msg + "</div>");
  } else {
    $('#messages').append("<li> <strong>" + nick + "</strong> : " + "<div id=\"innermsg\">" + msg + "</div></li>")
  }
  if(thisme != nick)
      displayNotification(room,thisme,nick,msg)
  prev = nick;
  $("#messages").animate({
    scrollTop: $('#messages').prop("scrollHeight")
  }, 100);
});

socket.on('message que', (nick, msg) => {
  if (prev == nick) {
    $('#messages li:last-child > div').append("<div>" + msg + "</div>");
  } else {
    $('#messages').append("<li> <strong>" + nick + "</strong> : " + "<div id=\"innermsg\">" + msg + "</div></li>");
  }

  prev = nick;
});