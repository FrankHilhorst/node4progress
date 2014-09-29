/**
 * File-name    : testDatasetCustomer.js
 * Description  : Get dataset with a dynamic call, loop through the data 
 *                fields
 * Methods used :
 *    node4progress.callHandler     -> Execute handler procedure 
 *    node4progress.getDataset      -> Get dataset object from the appserver output, make changes to the data
 *                                     and display the data
 *    TempTable.forEach             -> Loop through records in a temp-table
 *    buffer.display(...)           -> Return a string with fields formatted in accordance with bufferfield.format
 *    bufferField.setAttr           -> Set format field of a bufferField 
 *    
 */

//Load the configuration file
var conf = require("./config/config.json");
//Instantiate node4progress
var node4progress = require("node4progress")(conf);
//Define appserver procedure to call
node4progress.setAppsvrProc("Examples/CustomerHandler.p","",false,true);
//Define the appserver parameters
node4progress.setParameter("InputPars","longchar","input","NumCustomersToPull=10&batchNum=1","");
node4progress.setParameter("OutputPars","character","output","","");
node4progress.setParameter("dsCustomer","dataset-handle","output","","");
node4progress.setParameter("ErrMsg","character","output","","");
//Invoke the appserver procedure with the callback procedure
console.log("invoking Appserver Procedure");
node4progress.invoke(function(err,result){
	var dataset = null;
	var modName = "";
	if(err){
		console.log("ERROR->"+err);
	}else{
		//console.log(result);
		var jsonObj=JSON.parse(result);
		try{
			//get the dataset object from the appserver output
			dataset = node4progress.getDataset("dsCustomer",jsonObj);
		}catch(err){
			console.log(err);
		}
		var ttCustomer = dataset.$("ttCustomer");
		//Uopdate the ttCutsomer.name value by appending "->modified to it 
		ttCustomer.forEach(function(buffer){
			var line = buffer.$("cust-num").$("label") + ":" + buffer.$("cust-num").$("value") + "\n" + buffer.$("name").$("label") + ":" + buffer.$("name").$("value");
			buffer.$("name").bufferValue(buffer.$("name").$("value") + "->Modified");
		});			
		
	               //000001 Lift Line Skiing 3->Modified             Boston       MA                       42,568.01
	     var header="Cust#  Name                                     City         ST                         Balance\n"+
	                "====== ======================================== ============ ============ ===================== ";
	     console.log(header);
		//Display the modified values
		ttCustomer.forEach(function(buffer){
			//Set the format of the name field to 40 characters "x(40)"
			buffer.$("name").setAttr("format","x(40)");
			buffer.$("cust-num").setAttr("format","999999");
			var line=buffer.display("cust-num name city state balance");
			console.log(line);
		});	
	}
});
