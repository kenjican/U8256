let fs = require('fs');
let bodyParser = require('body-parser');
let express = require('express');
let WebSocketServer = require('ws').Server;
let serialP = require('serialport');
let Readline = serialP.parsers.Readline;
let U8256P = JSON.parse(fs.readFileSync('./U8256.json'));
let app = express();

let U1 = new serialP('/dev/ttyUSB0',{
	   baudRate:U8256P.COM.baudRate,
	   dataBits:U8256P.COM.dataBits,
	   stopBits:U8256P.COM.stopBits,
	   parity:U8256P.COM.parity,
//	   parser:serialP.parsers.readline('\r\n')
});

let parser = U1.pipe(new Readline({delimiter:'\r\n'}));


parser.on('data',function(data){
  //checkFS(data);
  //sendall(data);
  switch(data.slice(3,5)){
    case '01':
      //setTimeout(()=>U1Cmd(U8256P.getDigi),200);
      parseAna(data);
    case '51':
      parseDigi(data);
    default:
    //sendall(data);
  }
});

function U1Cmd(cmd){
  U1.write(cmd);
}

/*
web 
*/

app.use('/client',express.static('../client'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.get('/',function(req,res){
  res.sendFile('/home/pi/U8256/index.htm');
});

app.listen(8888);
/*
web socket
*/

let wss = new WebSocketServer({port:8887});

function sendall(buf){
  wss.clients.forEach(function(conn){
    conn.send(buf);
  });
}
/*
wss.on('connection',function (ws){
  ws.on('message',function(data){
  console.log(JSON.parse(data));
  
 // U1.write(data);
  });
});

*/

function checkFS(cmd){
  console.log(cmd.length);
  let FS = cmd.charCodeAt(0);
  for(let i=1;i<cmd.length-3;i++){
    FS = FS ^ cmd.charCodeAt(i);
  }
  console.log(FS.toString(16));
}

function parseAna(data){
  U8256P.AnaData.TPV = parseInt(data.slice(5,9),16)/100;
  U8256P.AnaData.HPV = parseInt(data.slice(9,13),16)/100;
  U8256P.AnaData.TSV = parseInt(data.slice(13,17),16)/100;
  U8256P.AnaData.HSV = parseInt(data.slice(17,21),16)/100;
  U8256P.AnaData.AHR = parseInt(data.slice(21,27),16);
  U8256P.AnaData.AMin = parseInt(data.slice(27,29),16);
  U8256P.AnaData.Steps = parseInt(data.slice(29,33),16);
  U8256P.AnaData.Patt = parseInt(data.slice(33,35),16);
  U8256P.AnaData.TRC = parseInt(data.slice(36,40),16);
  U8256P.AnaData.TRNC = parseInt(data.slice(40,44),16);
  U8256P.AnaData.PRC = parseInt(data.slice(44,48),16);
  U8256P.AnaData.PRNC = parseInt(data.slice(48,52),16);
  U8256P.AnaData.PRSS = parseInt(data.slice(52,56),16);
  U8256P.AnaData.PRES = parseInt(data.slice(56,60),16);
  U8256P.AnaData.NHR = parseInt(data.slice(60,64),16);
  U8256P.AnaData.NMin = parseInt(data.slice(64,66),16);
  U8256P.AnaData.TMVV = parseInt(data.slice(66,68),16);
  U8256P.AnaData.HMVC = parseInt(data.slice(68,70),16);
  U8256P.AnaData.HMVV = parseInt(data.slice(70,72),16);
  U8256P.AnaData.TMVC = parseInt(data.slice(72,74),16);
  U8256P.AnaData.Mon = parseInt(data.slice(74,76),16);
  U8256P.AnaData.Day = parseInt(data.slice(76,78),16);
  U8256P.AnaData.Year = parseInt(data.slice(78,80),16);
  U8256P.AnaData.NHR = parseInt(data.slice(80,82),16);
  U8256P.AnaData.NMin = parseInt(data.slice(82,84),16);
  U8256P.AnaData.NSec = parseInt(data.slice(84,86),16);
  //sendall(JSON.stringify(U8256P.AnaData));
  //console.log(U8256P.AnaData.TPV);
  console.log(data + '\n');
}


function parseDigi(data){
  U8256P.DigiData.GP1 = data.slice(5,9);
  U8256P.DigiData.GP2 = data.slice(9,13);
  U8256P.DigiData.GP3 = data.slice(13,17);
  console.log(data + '\n');
  //sendall(JSON.stringify(U8256P.DigiData));

}

var t1 = setInterval(()=>U1Cmd(U8256P.getAna),5000);


