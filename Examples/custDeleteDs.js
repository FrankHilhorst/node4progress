/**
 * File-name    : custDeleteDs.js
 * Description  : Fetch a number of records from the customer table in the sports, find the last record in the set,
 *                copy it over into an empty dataset, send dataset with that customer record back to appserver to be
 *                deleted
 * Methods used :
 *   node4progress.setAppsvrProc         -> define appserver procdure to execute
 *   node4progress.setParameter          -> define parameter for appserver procedure to execute
 *   node4progress.invoke                -> invoke the appserver procedure
 *   node4progress.getDataset            -> get a dataset from the appserver output pulled from the appserver   
 *   dataset.copyDataset                 -> create copy of a dataset (optionnally an empty copy)
 *   TempTable.findLast                  -> Find last record in temp-table 
 *                                             -> return reference to buffer for that record
 *   TempTable.findFirst                 -> Find first record in temp-table 
 *                                             -> return reference to buffer for that record 
 *   tempTable.bufferCreate()            -> creates new record in the temp-table
 *   tempTable.bufferCopy()              -> Copies values from a json document into a temp-table
 *   tempTable.bufferDelete()            -> Deletes record from a temp-table
 */

// Load configuration values
var conf = require("./config/config.json");
// Instantiate node4progress
var node4progress = require("node4progress")(conf);
// Define appserver procedure to call
node4progress.setAppsvrProc("Examples/CustUpdDs.p","",false,true);
// Define parameters for appserver procedure to call
node4progress.setParameter("Imode","character","input","GetCustomer","");
node4progress.setParameter("iInputParameters","character","input","mode=FromTo|cust-num-from=1000|cust-num-to=9999","");
node4progress.setParameter("dsCustomer","dataset-handle","input-output","","Examples/CustUpdDs-SchemaProvider.p");
node4progress.setParameter("oOutputPars","character","output","","");
node4progress.setParameter("ErrMsg","character","output","","");
//Invoke the appserver procedure
node4progress.invoke(function(err,result){

	//Extract dataset from appserver output
	var dsCustomer = node4progress.getDataset("dsCustomer",result);
	// Get an empty copy of the dataset
	var dsCustomerCopy=dsCustomer.copyDataset(true);  //true parameter indicates to create an empty dataset

	//Find last record in the customer temp-table
	var buffer=dsCustomer.$("ttCustomer").findLast();
	
	//Delete record from temp-table
	var deletedRecord=dsCustomer.$("ttCustomer").bufferDelete();
	
	//Copy record over to the new dataset
	dsCustomerCopy.$("ttCustomer").bufferCreate();
	dsCustomerCopy.$("ttCustomer").bufferCopy(deletedRecord);
	
	//Define appserver procedure to call
	node4progress.setAppsvrProc("Examples/CustUpdDs.p","",false,true);
	//Define appserver parameters 
	node4progress.setParameter("Imode","character","input","Delete","");
	node4progress.setParameter("iInputParameters","character","input","","");
	node4progress.setParameter("dsCustomer","dataset-handle","input-output",dsCustomerCopy.writeJson(),"Examples/CustUpdDs-SchemaProvider.p");
	node4progress.setParameter("oOutputPars","character","output","","");
	node4progress.setParameter("ErrMsg","character","output","","");
	//Invoke appserver procedure with the callback procedure
	node4progress.invoke(function(err,result){
		//console.log(result);
		jsonObj=JSON.parse(result);
		console.log("Customer Add Result->"+
				    "\n   oOutputPars  : "+jsonObj.output.oOutputPars+
				    "\n   ErrMsg       : "+jsonObj.output.ErrMsg);
		var ttCustBuf = dsCustomerCopy.$("ttCustomer").findFirst(); 
		displayMsg = "Customer deleted\n" +
		"Cust-num  : " + ttCustBuf.$("cust-num").$("screenValue") + "\n" +			
	    "Name      : " + ttCustBuf.$("name").$("screenValue") + "\n" +
	    "Address   : " + ttCustBuf.$("Address").$("screenValue")	+ "\n" +
	    "City      : " + ttCustBuf.$("City").$("screenValue")	+ "\n" +
	    "Country   : " + ttCustBuf.$("Country").$("screenValue")	+ "\n";	
		console.log(displayMsg);		
	});
		
	
});
