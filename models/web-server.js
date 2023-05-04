const http = require('http');
const express = require('express');
const morgan = require('morgan');
const webServerConfig = require('../config/web-server.js');
const database = require('./database.js');
let httpServer;
let mo=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function initialize() {
  return new Promise((resolve, reject) => {
    const app = express();
    app.set('view engine', 'ejs');
    httpServer = http.createServer(app);

    // Combines logging info from request and response
    app.use(morgan('combined'));

    app.get('/', async (req, res) => {
        res.sendFile("D:/program files/pharma project/views/main.html");
    });
    app.get('/get_user',async (req, res) => {
        var fname=req.query.first_name;
        var lname=req.query.last_name;
        var name=fname+" "+lname;
        const result=await database.simpleExecute('select * from customer where name= :name',{name:name});
        res.render("D:/program files/pharma project/views/customer.ejs",result.rows[0]);
    });
    app.get('/supplier',async (req,res) => {
      if(req.query.supplier){
        const result= await database.simpleExecute('select supid from supplier where name= :name',{name:req.query.supplier});
        const result2= await database.simpleExecute('select orderid,order_date,drugid,quantity from s_order where supid= :id',{id:result.rows[0].SUPID});
        console.log(result2);
        res.render("D:/program files/pharma project/views/supplier.ejs",{data:result2.rows});
      }
      else
      res.render("D:/program files/pharma project/views/supplier.ejs",{});
    });
    app.get('/order',async (req,res) => {
      if(req.query.name){
        const result=await database.simpleExecute('select * from customer where name= :name',{name:req.query.name});
        var result1 = 'temp';
      if(req.query.day=='today'){
        const date=new Date();
        var day=date.getDay();var month=date.getMonth();var year=date.getFullYear();
        if(day<10) day='0'+day;
        var d=day+"-"+mo[month]+"-"+year;
        result1=await database.simpleExecute('select BILLID,BDATE,TOTALAMOUNT from bill where customerid= :id and bdate= :bdate',{id:result.rows[0].CUSTOMERID,bdate:d});
      }
      else if(req.query.day=='month'){
        const date=new Date();
        var day=date.getDay();var month=date.getMonth();var year=date.getFullYear();
        var d2=day+"-"+mo[month]+"-"+year;
        var d1=day+"-"+mo[(date.getMonth()-1)]+"-"+year;
        result1=await database.simpleExecute('select BILLID,BDATE,TOTALAMOUNT from bill where customerid= :id and bdate<=:d2 and bdate>=:d1',{id:result.rows[0].CUSTOMERID,d1:new Date(d1),d2:new Date(d2)});
      }
      else{
        result1=await database.simpleExecute('select BILLID,BDATE,TOTALAMOUNT from bill where customerid= :id',{id:result.rows[0].CUSTOMERID});
      }  
        res.render("D:/program files/pharma project/views/order.ejs",{data:result1.rows});
      }
      else{
        res.render("D:/program files/pharma project/views/order.ejs",{});
      }
    });
    app.get('/inventory',async (req,res) => {
      if(req.query.name){
        const result=await database.simpleExecute('select * from drugs where name= :name',{name:req.query.name});
        const result1=await database.simpleExecute('select quantity from inventory where DRUGID= :id',{id:result.rows[0].DRUGID});
        res.render("D:/program files/pharma project/views/inventory.ejs",{data:result1.rows,name:req.query.name});
        }
        else{
          res.render("D:/program files/pharma project/views/inventory.ejs",{});
        }
    });
    app.get('/supplier_order',async (req,res) => {
      if(req.query.qut){
        const date=new Date();
        var day=date.getDay();var month=date.getMonth();var year=date.getFullYear();
        var d=day+"-"+month+"-"+year;
        const m=await database.simpleExecute('select max(orderid) as mz from s_order');
        const sup=await database.simpleExecute('select SUPID from supplier where name= :name',{name:req.query.sname});
        const drug=await database.simpleExecute('select * from drugs where name= :name',{name:req.query.dname});
        const result2=await database.simpleExecute('insert into s_order values(:id,:sdate,:sid,:did,:qut)',{id:m.rows[0].MZ+1,sdate:new Date(d),did:drug.rows[0].DRUGID,sid:sup.rows[0].SUPID,qut:req.query.qut},{ autoCommit: true });
        var p=drug.rows[0].PRICE*req.query.qut;
        console.log(result2);
        res.render("D:/program files/pharma project/views/supplier_order.ejs",{data:p});
      }
      else
      res.render("D:/program files/pharma project/views/supplier_order.ejs",{});
    });
    app.get('/buy',async (req,res) => {
      if(req.query.pno){
        const date=new Date();
        var day=date.getDay();var month=date.getMonth();var year=date.getFullYear();
        var d=day+"-"+month+"-"+year;
        const result=await database.simpleExecute('select max(billid) as id from bill');
        const cus=await database.simpleExecute('select * from customer where phnumber=:p',{p:req.query.pno});
        const result1=await database.simpleExecute('insert into bill values(:id,:bdate,:cid,:v,:did)',{v:0,id:result.rows[0].ID+1,cid:cus.rows[0].CUSTOMERID,did:req.query.did,bdate:new Date(d)},{autoCommit: true});
        res.render("D:/program files/pharma project/views/items.ejs",{data:0});
      }
      res.render("D:/program files/pharma project/views/buy.ejs",{});
    });
    app.get('/items',async (req,res) =>{
      if(req.query.item){
        const result=await database.simpleExecute('select max(billid) as id from bill');
        const did=await database.simpleExecute('select * from drugs where name=:name',{name:req.query.item});
        const stock=await database.simpleExecute('select quantity from inventory where drugid=:id',{id:did.rows[0].DRUGID});
        if(stock.rows[0].QUANTITY>=req.query.qut){
          var num=stock.rows[0].QUANTITY-req.query.qut;
          const ll=await database.simpleExecute('update inventory set quantity=:value where drugid=:id',{id:did.rows[0].DRUGID,value:num},{autoCommit: true});
          var price=did.rows[0].PRICE*req.query.qut;
          const result1=await database.simpleExecute('insert into c_order values(:price,:qut,:did,:oid)',{price:price,qut:req.query.qut,oid:result.rows[0].ID,did:did.rows[0].DRUGID},{autoCommit: true});
          const result2=await database.simpleExecute('update bill set totalamount=(select sum(price) from c_order where orderid=:id)-(select sum(price) from c_order where orderid=:id)*(select percentage from discounts join bill on discounts.discountid=bill.discount where bill.billid=:id) where billid=:id',{id:result.rows[0].ID},{autoCommit:true});
          const amount=await database.simpleExecute('select * from bill where billid=:id',{id:result.rows[0].ID});
          res.render("D:/program files/pharma project/views/items.ejs",{data:amount.rows[0].TOTALAMOUNT});
        }
        else{
          res.render("D:/program files/pharma project/views/items.ejs",{data:"OUT OF STOCK"});
        }
      }
      else{
        res.render("D:/program files/pharma project/views/items.ejs",{date:0});
      }
    });
    httpServer.listen(webServerConfig.port)
      .on('listening', () => {
        console.log(`Web server listening on localhost:${webServerConfig.port}`);

        resolve();
      })
      .on('error', err => {
        reject(err);
      });
  });
}

module.exports.initialize = initialize;

function close() {
  return new Promise((resolve, reject) => {
    httpServer.close((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

module.exports.close = close;
