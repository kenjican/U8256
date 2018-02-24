let url = "ws://suzhou.accutherm.com.cn:8887";
let user;
let socket;

socket = new WebSocket(url);
socket.onmessage = function(msg){
  document.getElementById("fb").innerHTML = msg.data;
}

function fcsSend(cmd){



function checkFCS(cmd){
  let fcs = cmd[0].charCodeAt(0);
  for(let i=1;i<cmd.length;i++){
    fcs = fcs ^ cmd[i].charCodeAt(i);
  }
  fcs = '0' + fcs.toStirng(16).toUpperCase();
  return fcs;
}
