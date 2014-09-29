/**
 * New node file
 */
/**
 * New node file
 */
var conf = require("./config/config.json");
var sleep = require('sleep');
var node4progress = require("node4progress")(conf);

node4progress.setAppsvrProc("Examples/FatalRecurse.p","",false,true);
node4progress.setParameter("InputPars","integer","output","","");
console.log("invoking Appserver Procedure");
node4progress.appProc().execute(function(err,result){
	console.log("FatalRecurse RESULT");
	if(err){
		console.log("ERROR->"+err);
	}else{
		console.log(result);
	}
	sleep.sleep(10);
	node4progress.setAppsvrProc("handlers/OrderHandler.p","",false,true);
	node4progress.setParameter("InputPars","longchar","input","NumOrdersToPull=2","");
	node4progress.setParameter("OutputPars","character","output","","");
	node4progress.setParameter("dsOrder","dataset-handle","output","","");
	node4progress.setParameter("ErrMsg","character","output","","");
	console.log("invoking Appserver Procedure");
	node4progress.appProc().execute(function(err,result){
		console.log("ORDERS RESULT");
		if(err){
			console.log("ERROR->"+err);
		}else{
			try{
				result = result.toString();
				console.log("result->ORDERS->"+result);
				//result=JSON.parse(result);
				//console.log("parsed results~n"+result);
			}catch(err){
				
			}
		}
		sleep.sleep(10);
		node4progress.setAppsvrProc("handlers/CustomerHandler.p","",false,true);
		node4progress.setParameter("InputPars","longchar","input","NumCustomersToPull=5&batchNum=2","");
		node4progress.setParameter("OutputPars","character","output","","");
		node4progress.setParameter("dsCustomer","dataset-handle","output","","");
		node4progress.setParameter("ErrMsg","character","output","","");
		console.log("invoking Appserver Procedure");
		node4progress.appProc().execute(function(err,result){
			console.log("CUSTOMERS RESULT");
			if(err){
				console.log("ERROR->"+err);
			}else{
				try{
					console.log("CUSTOMERS->"+result);
					result=JSON.parse(result);
					console.log("parsed results~n"+result);
					sleep.sleep(10);					
				}catch(err){
					
				}
				node4progress.setAppsvrProc("handlers/OrderHandler.p","",false,true);
				node4progress.setParameter("InputPars","longchar","input","NumOrdersToPull=2","");
				node4progress.setParameter("OutputPars","character","output","","");
				node4progress.setParameter("dsOrder","dataset-handle","output","","");
				node4progress.setParameter("ErrMsg","character","output","","");
				console.log("invoking Appserver Procedure");
				node4progress.appProc().execute(function(err,result){
					result = result.toString();
					console.log("result->ORDERS->"+result);					
				});
				
			}
		});
		
	});
	
});


