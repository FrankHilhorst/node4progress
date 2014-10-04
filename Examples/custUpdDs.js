/**
 * File-name    : custUpdDs.js
 * Description  : Fetch a number of records from the customer table in the sports, find the last record in the set,
 *                Update this record, copy it over into an empty dataset, sent copy dataset to appserver to
 *                update the customer
 * Methods used :
 *   node4progress.setAppsvrProc         -> define appserver procdure to execute
 *   node4progress.setParameter          -> define parameter for appserver procedure to execute
 *   node4progress.invoke                -> invoke the appserver procedure
 *   node4progress.geDataset             -> get a dataset from the appserver output pulled from the appserver  
 *   TempTable.findLast                  -> Find last record in temp-table 
 *                                             -> return reference to buffer for that record   
 *   dataset.copyDataset(..)             -> Create a copy of a dataset  
 *   Temp-table.bufferCreate()           -> create record in temp-table
 *   Temp-table.bufferCopy()             -> create record in temp-table
 */
var conf = require("./config/config.json");
// instantiate node4progress
var node4progress = require("node4progress")(conf);
// Define appserver procedure to call
node4progress.setAppsvrProc("Examples/CustUpdDs.p","",false,true);
// Define appserver parameters 
node4progress.setParameter("Imode","character","input","GetCustomer","");
node4progress.setParameter("iInputParameters","character","input","mode=FromTo|cust-num-from=1000|cust-num-to=9999","");
node4progress.setParameter("dsCustomer","dataset-handle","input-output","","Examples/CustUpdDs-SchemaProvider.p");
node4progress.setParameter("oOutputPars","character","output","","");
node4progress.setParameter("ErrMsg","character","output","","");
// Invoke appserver procedure
node4progress.invoke(function(err,result){
	var newName = "John Doe the 2nd";
	var newAddress = "1567 Leisure Lane";
	var newCity = "Port Saint Lucie";
	var newState = "FL";
	var newCountry = "USA";
    
	// Get dataset from appserver output 
	var dsCust = node4progress.getDataset("dsCustomer",result);
	var ttCustomer = dsCust.$("ttCustomer");
	// Get last record in customer temp-table
	var ttCustBuf = ttCustomer.findLast();
	var displayMsg = "";	
	
	displayMsg = "Pre-uodate values\n" +
	             "Cust-num : " + ttCustBuf.$("cust-num").$("screenValue") + "\n" +
		         "Name     : " + ttCustBuf.$("name").$("screenValue") + "\n" +
                 "Address  : " + ttCustBuf.$("Address").$("screenValue")	+ "\n" +
                 "City     : " + ttCustBuf.$("City").$("screenValue")	+ "\n" +
                 "Country  : " + ttCustBuf.$("Country").$("screenValue")	+ "\n";
	
	console.log(displayMsg);
	
	// update buffer values
	ttCustBuf.$("name").bufferValue(newName);
	ttCustBuf.$("Address").bufferValue(newAddress);
	ttCustBuf.$("City").bufferValue(newCity);
	ttCustBuf.$("Country").bufferValue(newCountry);
	ttCustBuf.$("State").bufferValue(newState);

	displayMsg = "Post-uodate values\n" +
  			     "Cust-num : " + ttCustBuf.$("cust-num").$("screenValue") + "\n" +
				 "Name     : " + ttCustBuf.$("name").$("screenValue") + "\n" +
				 "Address  : " + ttCustBuf.$("Address").$("screenValue")	+ "\n" +
				 "City     : " + ttCustBuf.$("City").$("screenValue")	+ "\n" +
				 "Country  : " + ttCustBuf.$("Country").$("screenValue")	+ "\n";
	
	console.log(displayMsg);
	//Create an empty copy of the dataset
	var dsCustomerCopy=dsCust.copyDataset(true); //true creates an empty copy, false creates a populated copy
	//Copy updated values into copy dataset 
	dsCustomerCopy.$("ttCustomer").bufferCreate();
	dsCustomerCopy.$("ttCustomer").bufferCopy(ttCustBuf.writeJson());
    // Define appserver procedure to call 
	node4progress.setAppsvrProc("Examples/CustUpdDs.p","",false,true);
	// Define appserver procedure to call
	node4progress.setParameter("Imode","character","input","UPDATE","");
	// Define appserver parameters 
	node4progress.setParameter("iInputParameters","character","input","","");
	node4progress.setParameter("dsCustomer","dataset-handle","input-output",dsCustomerCopy.writeJson(),"Examples/CustUpdDs-SchemaProvider.p");
	node4progress.setParameter("oOutputPars","character","output","","");
	node4progress.setParameter("ErrMsg","character","output","","");
	// Invoke the appserver procedure
	node4progress.invoke(function(err,result){
		if(err){
			console.log(err);
		}else{
			jsonObj=JSON.parse(result);		
			console.log("Customer Update Result->"+
					    "\n   ->oOutputPars->"+jsonObj.output.oOutputPars+
					    "\n   ->ErrMsg->"+jsonObj.output.ErrMsg);
		}
	});
});

