/**
 * File-name    : custAddDs.js
 * Purpose      : Show how to use the dataset object to add new records to the customer table in the sports database
 * Methods used :
 *   node4progress.getEmptyDataset(..) -> fetches an empty dataset from the appserver
 *   dataset.$("..")                   -> passes handle to a temp-table
 *   tempTable.bufferCreate()          -> creates new record in the temp-table
 *   buffer.$("..")                    -> Passes a reference to a buffer field
 *   bufferField.bufferValue(....)     -> Set the bufferValue of a buffer-field
 *   node4progress.setAppsvrProc       -> define appserver procdure to execute
 *   node4progress.setParameter        -> define parameter for appserver procedure to execute
 *   node4progress.invoke              -> invoke the appserver procedure
 */

var conf = require("./config/config.json");
var node4progress = require("node4progress")(conf);

node4progress.getEmptyDataset("dsCustomer","Examples/CustUpdDs-SchemaProvider.p",function(err,dsCustomer){
	var ttCustomer=null;
	var ttCustBuf=null;
	if(err){
		console.log("ERROR->"+err);
	}else{
		//Define the parameters for the new customer
		var custName    = "John Doe";
		var custAddr    = "757 Kendall drive";
		var custCity    = "Miami";
		var custState   = "FL";
		var postalCode  = "33102";
		var custPhone   = "777-777-7777";
		var creditLimit = 10000;
		//Get a instance of customer Temp-tabke object
		ttCustomer=dsCustomer.$("ttCustomer");
		//Create new record in the ttCustomer temp-table and get a instance of the customer buffer object
		ttCustBuf=ttCustomer.bufferCreate();
		//Populate the newly created record
		ttCustBuf.$("cust-num").bufferValue(-1);
		ttCustBuf.$("name").bufferValue(custName);
		ttCustBuf.$("Address").bufferValue(custAddr);
		ttCustBuf.$("City").bufferValue(custCity);
		ttCustBuf.$("State").bufferValue(custState);
		ttCustBuf.$("Postal-Code").bufferValue(postalCode);
		ttCustBuf.$("Phone").bufferValue(custPhone);
		ttCustBuf.$("Credit-Limit").bufferValue(creditLimit);
		//Define appserver procedure to call
		node4progress.setAppsvrProc("Examples/CustUpdDs.p","",false,true);
		//Define parameters for appserver procedure
		node4progress.setParameter("Imode","character","input","ADD","");
		node4progress.setParameter("iInputParameters","character","input","","");
		node4progress.setParameter("dsOrder","dataset-handle","input-output",dsCustomer.writeJson(),"Examples/CustUpdDs-SchemaProvider.p");
		node4progress.setParameter("oOutputPars","character","output","","");
		node4progress.setParameter("ErrMsg","character","output","","");
		//Invoke appserver procedure
		console.log("invoking Appserver Procedure CustUpdDs.p");		
		node4progress.invoke(function(err,result){
			jsonObj=JSON.parse(result);
			console.log("Customer Add Result->"+
					    "\n   ->oOutputPars->"+jsonObj.output.oOutputPars+
					    "\n   ->ErrMsg->"+jsonObj.output.ErrMsg);
			var dsCust = node4progress.getDataset("dsCustomer",result);
			var ttCustomer = dsCust.$("ttCustomer");
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
