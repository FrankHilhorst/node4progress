/**
 * File-name    : testCallHandler.js
 * Description  : Call 2 handler procedures on the appserver, loop through the temp-tables returned and display some 
 *                fields
 * Methods used :
 *    node4progress.callHandler     -> Execute handler procedure 
 *    node4progress.getDataset      -> Get dataset object from the appserver output
 *    TempTable.forEach             -> Loop through records in a temp-table
 *    buffer.display(...)           -> Return a string with fields formatted in accordance with bufferfield.format
 *    
 */
//Load the configuration file
var conf = require("./config/config.json");
// Instantiate node4progress
var node4progress = require("node4progress")(conf);
//Define handler to call
var handler="Examples/CustomerHandler.p";
// Define Input parameters for handler 
var inputPars = 'NumCustomersToPull=5';
//Invoke the handler
node4progress.callHandler(handler,inputPars,true,function(err,result){
	console.log("CUSTOMER HANDLER RESULT");
	// Get dataset from appserver output
	var dataset = node4progress.getDataset("dsCustomer",result);	
	var ttCustomer = dataset.$("ttCustomer");
	var header = "Cust # Customer name                            City         ST                    Credit Limit\n"+
	             "====== ======================================== ============ ==                   =============";
		         //"     1 Lift Line Skiing 3                       Boston       MA                       42,568.01"
	console.log(header);
	//Loop through customer records and display some fields
	ttCustomer.forEach(function(buffer){
		buffer.$("name").setAttr("format","x(40)");
		var line=buffer.display("cust-num name city state balance");
		console.log(line);
	});	
    console.log("\n\n");	
});

//Second handler to call Examples/OrderHandler.p
handler="Examples/OrderHandler.p";
//Define input parameters for the 2nd handler
inputPars = 'NumOrdersToPull=5'; 

node4progress.callHandler(handler,inputPars,true,function(err,result){
	var dataset;
	try{
		//Get dataset from appserver output
		dataset = node4progress.getDataset("dsOrder",result);
	}catch(err){
		console.log(err);
	}
	
	// Get ttOrder and ttOrderLine handle
	var ttOrder = dataset.$("ttOrder");
	var ttOrderline = dataset.$("ttOrderLine");
	var header = "Cust# Order Order Dt Prom Dt Line Item#     Amount\n" +
	             "===== ===== ======== ======= ==== ===== ==========";
	console.log(header);
	// Loop though ttOrder records and link to ttOrderLine records
	ttOrder.forEach(function(buffer){		
		var orderNum=buffer.$("order-num").$("value");
		var line=buffer.display("cust-num order-num order-date promise-date");
		var line2="";
		ttOrderline.forEach(function(buffer){
			if(buffer.$("order-num").$("value")==orderNum){
				line2=buffer.display("line-num item-num Extended-Price");
				console.log(line + line2);
			}
			
		});
	});	
	
});
