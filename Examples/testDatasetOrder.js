/**
 * File-name    : testDatasetOrder.js
 * Description  : Get Order/Orderline dataset with a dynamic call, loop through the data 
 *                fields
 * Methods used :
 *    node4progress.setAppsvrProc   -> Define appserver procedure to call
 *    node4progress.setParameter    -> Define parameter for appserver procedure to call 
 *    node4progress.invoke          -> invoke appserver procedure to call 
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
node4progress.setAppsvrProc("Examples/OrderHandler.p","",false,true);
//Define parameters for appserver procedure to call
node4progress.setParameter("InputPars","longchar","input","NumOrdersToPull=20","");
node4progress.setParameter("OutputPars","character","output","","");
node4progress.setParameter("dsOrder","dataset-handle","output","","");
node4progress.setParameter("ErrMsg","character","output","","");
console.log("invoking Appserver Procedure");
//Invoke the appserver procedure with callback procedure
node4progress.invoke(function(err,result){
	var dataset = null;
	var cnt=1;
	var mnth=1;
//console.log("result->"+result);	
	if(err){
		console.log("ERROR->"+err);
	}else{
		try{
			//Extract dataset object from the appserver output
			dataset = node4progress.getDataset("dsOrder",result);
		}catch(err){
			console.log(err);
		}
		//get ttOrder temp-table from dataset
		var ttOrder = dataset.$("ttOrder");
		//get ttOrderline from dataset
		var ttOrderline = dataset.$("ttOrderLine");
		//Update the ttOrder.order-date field 
		ttOrder.forEach(function(buffer){
			var dt = buffer.$("order-date").$("buffer-value");
			var line = "Cust-num->"+buffer.$("Cust-num").$("value") + "->"+buffer.$("Order-num").$("value")+"->"+
			           buffer.$("Order-date").$("value");
			++cnt;
			++mnth;
			var dt=new Date(2014,mnth,cnt);
			buffer.$("Order-date").bufferValue(dt);
			//console.log(line);
		});	
		          //   53     1 02/03/14 03/02/93    1   1 00054     131.22
		var hdr =  "Cust#  Ord# Order Dt Prom. Dt Ord# Ln# item#     Amount\n"+
		           "===== ===== ======== ======== ==== === ======= ========";
		console.log(hdr);
		//Show the data in the ttOrder and the ttOrderLine table joining them
		ttOrder.forEach(function(buffer){
			var orderNum=buffer.$("order-num").$("value");
			var line=buffer.display("cust-num order-num order-date promise-date");
			var line2="";
			//Find the ttOrderLine records for the ttOrder table
			ttOrderline.forEach(function(buffer){
				if(buffer.$("order-num").$("value")==orderNum){
					line2=buffer.display("order-num line-num item-num Extended-Price");
					console.log(line + line2);
				}
				
			});
		});	
	}
});

