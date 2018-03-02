let url = "ws://suzhou.accutherm.com.cn:8887";
//let url = "ws://192.168.0.12:8887";
let user;
let socket;

socket = new WebSocket(url);
socket.onmessage = function(msg){
  let StatusData = JSON.parse(msg.data);
  $("#TPV").text((StatusData.AnaData.TPV).toFixed(2));
  $("#TSV").text((StatusData.AnaData.TSV).toFixed(2));
  $("#TMV").text((StatusData.AnaData.TMVV));
  $("#HPV").text((StatusData.AnaData.HPV).toFixed(2))
  $("#HSV").text((StatusData.AnaData.HSV).toFixed(2));
  $("#HMV").text((StatusData.AnaData.HMVV));
  $("#NHR").text(StatusData.AnaData.NHR);
  $("#NMin").text(StatusData.AnaData.NMin);
  $("#NSec").text(StatusData.AnaData.NSec);
  $("#Steps").text(StatusData.AnaData.Steps);
  $("#Patt").text(StatusData.AnaData.Patt);
  $("#GP1").text(StatusData.DigiData.GP1);
  $("#GP2").text(StatusData.DigiData.GP2);
  $("#GP3").text(StatusData.DigiData.GP3);

}
/*
$('#getSteps').bind('click',function(){
  console.log(this.id);
});

$('#getcells').bind('click',function(){
  let cell = document.getElementsByTag('td');
  console.log(cell.length);
});
*/
function fcsSend(cmd){
  cmd = cmd + checkFCS(cmd) + '*\r\n';
  $('#sd').val(cmd);
  console.log($('#sd').val());
  socket.send(cmd);
}

function getSteps(cmd){
  


}


function checkFCS(cmd){
  let fcs = cmd.charCodeAt(0);
  for(let i=1;i<cmd.length;i++){
    fcs = fcs ^ cmd.charCodeAt(i);
  }
  console.log(fcs);
  fcs = '0' + fcs.toString(16).toUpperCase();
  console.log(fcs);
  return fcs.slice(-2);
}

$(document).ready(function(){

$('#getSteps').bind('click',function(){
  alert(this.id);
});

$('#getcells').bind('click',function(){
  let cell = document.getElementsByTagName('td');
  alert(cell.length);
});

$('#fcsSend').bind('click',function(){
  fcsSend($('#sd').val());
});

});
