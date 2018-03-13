let fs = require('fs');
let bodyParser = require('body-parser');
let express = require('express');
let WebSocketServer = require('ws').Server;
let serialP = require('serialport');
let Readline = serialP.parsers.Readline;
let U8256P = JSON.parse(fs.readFileSync('./U8256.json'));
let app = express();
let mysql = require('mysql');
let charts={
  "history":{
     "DT":[],
     "TPV":[],
     "TSV":[],
     "HPV":[],
     "HSV":[]
  }
};

/*
Mysql
*/
let con = mysql.createConnection({
  host:"localhost",
  user:"kenji",
  password:"chenjia1!",
  database:"THV"
});

con.connect((err)=>{
  if(err){
    console.log('error');
    return;
  }
  console.log('connection OK');
});

function savedata(){
  let sql = 'insert into Mar17 (TPV,TSV,TMV,HPV,HSV,HMV,status,trouble,TOF) ';
  sql += 'values (' + U8256P.StatusData.AnaData.TPV + ',' + U8256P.StatusData.AnaData.TSV +',';
  sql += U8256P.StatusData.AnaData.TMVV + ',' + U8256P.StatusData.AnaData.HPV +',';
  sql += U8256P.StatusData.AnaData.HSV + ',' + U8256P.StatusData.AnaData.HMVV +',';
  sql += U8256P.StatusData.DigiData.GP1 + ',' + U8256P.StatusData.DigiData.GP2 +',';
  sql += U8256P.StatusData.DigiData.GP3 + ')';
  //console.log(sql);
  con.query(sql);
}


/*
Serial port 

*/
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
      U1Cmd(U8256P.getDigi);
      parseAna(data);
      break;
    case '51':
      parseDigi(data);
      break;
    default:
      console.log(data);
      break;
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

app.get('/test',function(req,res){
  res.sendFile('/home/pi/U8256/index1.htm');
});

app.get('/gethis/:fdate/:tdate',function(req,res){
  let sql = "select DateTime,TPV,TSV,HPV,HSV from Mar17 where DateTime ";
  sql += "between" + req.params.fdate + " and " + req.params.tdate;
  con.query(sql,(error,result,field)=>{
    if(error){
      console.log(error.message);
    }
    for(let i=0;i<result.length;i++){
      charts.history.DT.push(result[i].DateTiime);  
      charts.history.TPV.push(result[i].TPV); 
      charts.history.TSV.push(result[i].TSV); 
      charts.history.HPV.push(result[i].HPV); 
      charts.history.HSV.push(result[i].HSV);
    }

    res.send(charts);
    res.end;

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


wss.on('connection',function (ws){
  ws.on('message',function(data){
  console.log(data);
  
  U1.write(data);
  });
});


function checkFS(cmd){
  console.log(cmd.length);
  let FS = cmd.charCodeAt(0);
  for(let i=1;i<cmd.length-3;i++){
    FS = FS ^ cmd.charCodeAt(i);
  }
  console.log(FS.toString(16));
}

function calva(va){
  if(va < 32767){
    return va/100;
  }else if(va == 32767){
    return 0;
  }else{
    return (va - 65536)/100;
  }

}




function parseAna(data){
  U8256P.StatusData.AnaData.TPV = calva(parseInt(data.slice(5,9),16));
  U8256P.StatusData.AnaData.HPV = calva(parseInt(data.slice(9,13),16));
  U8256P.StatusData.AnaData.TSV = calva(parseInt(data.slice(13,17),16));
  U8256P.StatusData.AnaData.HSV = calva(parseInt(data.slice(17,21),16));
  U8256P.StatusData.AnaData.AHR = parseInt(data.slice(21,27),16);
  U8256P.StatusData.AnaData.AMin = parseInt(data.slice(27,29),16);
  U8256P.StatusData.AnaData.Steps = parseInt(data.slice(29,33),16);
  U8256P.StatusData.AnaData.Patt = parseInt(data.slice(33,35),16);
  U8256P.StatusData.AnaData.TRC = parseInt(data.slice(36,40),16);
  U8256P.StatusData.AnaData.TRNC = parseInt(data.slice(40,44),16);
  U8256P.StatusData.AnaData.PRC = parseInt(data.slice(44,48),16);
  U8256P.StatusData.AnaData.PRNC = parseInt(data.slice(48,52),16);
  U8256P.StatusData.AnaData.PRSS = parseInt(data.slice(52,56),16);
  U8256P.StatusData.AnaData.PRES = parseInt(data.slice(56,60),16);
  U8256P.StatusData.AnaData.NHR = parseInt(data.slice(60,64),16);
  U8256P.StatusData.AnaData.NMin = parseInt(data.slice(64,66),16);
  U8256P.StatusData.AnaData.TMVV = parseInt(data.slice(66,68),16);
  U8256P.StatusData.AnaData.HMVC = parseInt(data.slice(68,70),16);
  U8256P.StatusData.AnaData.HMVV = parseInt(data.slice(70,72),16);
  U8256P.StatusData.AnaData.TMVC = parseInt(data.slice(72,74),16);
  U8256P.StatusData.AnaData.Mon = parseInt(data.slice(74,76),16);
  U8256P.StatusData.AnaData.Day = parseInt(data.slice(76,78),16);
  U8256P.StatusData.AnaData.Year = parseInt(data.slice(78,80),16);
  U8256P.StatusData.AnaData.NHR = parseInt(data.slice(80,82),16);
  U8256P.StatusData.AnaData.NMin = parseInt(data.slice(82,84),16);
  U8256P.StatusData.AnaData.NSec = parseInt(data.slice(84,86),16);
  //sendall(JSON.stringify(U8256P.AnaData));
  //console.log(U8256P.AnaData.TPV);
  //console.log(data + '\n');
}


function parseDigi(data){
  U8256P.StatusData.DigiData.GP1 = data.slice(5,9);
  U8256P.StatusData.DigiData.GP2 = data.slice(9,13);
  U8256P.StatusData.DigiData.GP3 = data.slice(13,17);
  //console.log(data + '\n');
  sendall(JSON.stringify(U8256P.StatusData));
  savedata();
}

var t1 = setInterval(()=>U1Cmd(U8256P.getAna),1000);


