let fs = require('fs');
let bodyParser = require('body-parser');
let express = require('express');
let WebSocketServer = require('ws').Server;
let serialP = require('serialport');
let Readline = serialP.parsers.Readline;
let U8256P = JSON.parse(fs.readFileSync('U8256.json'));
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
  checkFS(data);
  sendall(data);
});

function U1Cmd(cmd){
  U1.write(cmd);
}

/*
web 
*/

app.use(express.static(__dirname));
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

function checkFS(cmd){
  console.log(cmd.length);
  let FS = 0x40;
  for(let i=1;i<cmd.length-3;i++){
    FS = FS ^ cmd.charCodeAt(i);
  }

  console.log(FS.toString(16));

}

var t1 = setInterval(()=>U1Cmd(U8256P.getAna),10000);


