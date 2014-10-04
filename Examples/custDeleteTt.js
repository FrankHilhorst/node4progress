/**
 * File-name    : custDeleteTt.js
 * Description  : Fetch a number of records from the customer table in the sports, find the last record in the set,
 *                copy it over into an empty dataset, send dataset with that customer record back to appserver to be
 *                deleted
 * Methods used :
 *   node4progress.setAppsvrProc         -> define appserver procdure to execute
 *   node4progress.setParameter          -> define parameter for appserver procedure to execute
 *   node4progress.invoke                -> invoke the appserver procedure
 *   node4progress.getTempTable          -> get a temp-table from the appserver output pulled from the appserver   
 *   TempTable.copyTempTabl              -> create copy of a temp-table (optionnally an empty copy)
 *   TempTable.findLast                  -> Find last record in temp-table 
 *                                             -> return reference to buffer for that record
 *   TempTable.findFirst                 -> Find first record in temp-table 
 *                                             -> return reference to buffer for that record 
 *   tempTable.bufferCreate()            -> creates new record in the temp-table
 *   tempTable.bufferCopy()              -> Copies values from a json document into a temp-table
 *   tempTable.bufferDelete()            -> Deletes record from a temp-table
 */
// Load configuration file
var conf = require("./config/config.json");
// Instantiate node4progress 
var node4progress = require("node4progress")(conf);
// Define appserver procedure to call
node4progress.setAppsvrProc("Examples/CustUpdTt.p","",false,true);
// Define parameters for appserver procedure to call
node4progress.setParameter("Imode","character","input","GetCustomer","");
node4progress.setParameter("iInputParameters","character","input","mode=FromTo|cust-num-from=1000|cust-num-to=9999","");
node4progress.setParameter("ttCustomer","table-handle","input-output","","Examples/CustUpdTt-SchemaProvider.p");
node4progress.setParameter("oOutputPars","character","output","","");
node4progress.setParameter("ErrMsg","character","output","","");
// Invoke Appserver procedure
node4progress.invoke(function(err,result){
	// Extract temp-table from appserver output 
	var ttCustomer = node4progress.getTempTable("ttCustomer",result);
	
	//Create empty copy of the temp-table 
	var ttCustomerCopy=ttCustomer.copyTempTable(true); //If passed true then temp-table will be empty, otherwise data is copied as well
	
	// find last record in temp-table
	var buffer = ttCustomer.findLast();
	
	// Delete record from source temp-table
	var deletedRecord=ttCustomer.bufferDelete();
	
	//copy record to destination temp-table 
	ttCustomerCopy.bufferCreate();
	ttCustomerCopy.bufferCopy(deletedRecord);
	//console.log("ttCustomerCopy.writeJson()->"+ttCustomerCopy.writeJson());
    // Define appserver procedure to call
	node4progress.setAppsvrProc("Examples/CustUpdTt.p","",false,true);
	// Define parameters for appserver procedure
	node4progress.setParameter("Imode","character","input","Delete","");
	node4progress.setParameter("iInputParameters","character","input","","");
	node4progress.setParameter("ttCustomer","table-handle","input-output",ttCustomerCopy.writeJson(),"Examples/CustUpdTt-SchemaProvider.p");
	node4progress.setParameter("oOutputPars","character","output","","");
	node4progress.setParameter("ErrMsg","character","output","","");
	// Invoke appserver procedure
	node4progress.invoke(function(err,result){
		jsonObj=JSON.parse(result);
		console.log("Customer Delete Result->"+
				    "\n   ->oOutputPars->"+jsonObj.output.oOutputPars+
				    "\n   ->ErrMsg->"+jsonObj.output.ErrMsg);
		if(!err){
			var buffer=ttCustomerCopy.findLast();		
			displayMsg = "Customer deleted\n" +
			     "Cust-num  : " + buffer.$("cust-num").$("screenValue") + "\n" +			
			 "Name      : " + buffer.$("name").$("screenValue") + "\n" +
			 "Address   : " + buffer.$("Address").$("screenValue")	+ "\n" +
			 "City      : " + buffer.$("City").$("screenValue")	+ "\n" +
			 "Country   : " + buffer.$("Country").$("screenValue")	+ "\n";	
			console.log(displayMsg);
		}
	});
	
	
});
