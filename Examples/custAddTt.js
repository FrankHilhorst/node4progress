/**
 * File-name    : custAddTt.js
 * Purpose      : Show how to use the temp-table object to add new records to the customer table in the sports database
 * Methods used :
 *   node4progress.getEmptyTempTable(..) -> fetches an empty dataset from the appserver
 *   tempTable.bufferCreate()            -> creates new record in the temp-table
 *   buffer.$("..")                      -> Passes a reference to a buffer field
 *   bufferField.bufferValue(....)       -> Set the bufferValue of a buffer-field
 *   node4progress.setAppsvrProc         -> define appserver procdure to execute
 *   node4progress.setParameter          -> define parameter for appserver procedure to execute
 *   node4progress.invoke                -> invoke the appserver procedure
 */
var conf = require("./config/config.json");
var node4progress = require("node4progress")(conf);

node4progress.getEmptyTempTable("ttCustomer","Examples/CustUpdTt-SchemaProvider.p",function(err,ttCustomer){
	var ttCustBuf=null;
	if(err){
		console.log("ERROR->"+err);
	}else{		
		//Define the parameters for the new customer
		var custName    = "Fred Node4Progres";
		var custAddr    = "757 Node4progress drive";
		var custCity    = "Miami";
		var custState   = "FL";
		var postalCode  = "33102";
		var custPhone   = "777-777-7777";
		var creditLimit = 11000;
		//Create new record in temp-table ttCustomer
		ttCustBuf=ttCustomer.bufferCreate();
		//Assign buffer values
		ttCustBuf.$("cust-num").bufferValue(-1);
		ttCustBuf.$("name").bufferValue(custName);
		ttCustBuf.$("Address").bufferValue(custAddr);
		ttCustBuf.$("City").bufferValue(custCity);
		ttCustBuf.$("State").bufferValue(custState);
		ttCustBuf.$("Postal-Code").bufferValue(postalCode);
		ttCustBuf.$("Phone").bufferValue(custPhone);
		ttCustBuf.$("Credit-Limit").bufferValue(creditLimit);
		//Define appserver procedure to call
		node4progress.setAppsvrProc("Examples/CustUpdTt.p","",false,true);
		//Define parameters for appserver procedure to call
		node4progress.setParameter("Imode","character","input","ADD","");
		node4progress.setParameter("iInputParameters","character","input","","");
		node4progress.setParameter("ttCustomer","table-handle","input-output",ttCustomer.writeJson(),"Examples/CustUpdTt-SchemaProvider.p");
		node4progress.setParameter("oOutputPars","character","output","","");
		node4progress.setParameter("ErrMsg","character","output","","");
		
		console.log("invoking Appserver Procedure");		
		//Invoke appsrever procedure with call back procedure
		node4progress.invoke(function(err,result){
			//console.log("result->"+result);
			jsonObj=JSON.parse(result);
			console.log("Customer Add Result->"+
					    "\n   ->oOutputPars->"+jsonObj.output.oOutputPars+
					    "\n   ->ErrMsg->"+jsonObj.output.ErrMsg);
			var ttCustomer = node4progress.getTempTable("ttCustomer",result);
			var ttCustBuf = ttCustomer.findFirst();
			var displayMsg = "";
			
			displayMsg = "New customer added\n" +
	         			 "Cust-num  : " + ttCustBuf.$("cust-num").$("screenValue") + "\n" +			
				         "Name      : " + ttCustBuf.$("name").$("screenValue") + "\n" +
		                 "Address   : " + ttCustBuf.$("Address").$("screenValue")	+ "\n" +
		                 "City      : " + ttCustBuf.$("City").$("screenValue")	+ "\n" +
		                 "Country   : " + ttCustBuf.$("Country").$("screenValue")	+ "\n";	
			console.log(displayMsg);
			
		});
	}
});
