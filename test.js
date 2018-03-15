let express = require('express');
let app = express();
let mysql = require('mysql');
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
});


let charts={
  "DT":[],
  "TPV":[],
  "TSV":[],
  "HPV":[],
  "HSV":[]
}

let sql = 'select DateTime,TPV,TSV,HPV,HSV from Mar17 where DateTime between "2018-03-04 00:00:00" and "2018-03-04 01:00:00"';

con.query(sql,(error,result,fields)=>{
  if(error){
    return console.error(error.message);
  }
   for(let i=0;i<result.length;i++){
     charts.DT.push(result[i].DateTime.toString());
     charts.TPV.push(result[i].TPV);
     charts.TSV.push(result[i].TSV);
     charts.HPV.push(result[i].HPV);
     charts.HSV.push(result[i].HSV);
   }
   console.log(charts);
});



