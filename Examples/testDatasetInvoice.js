/**
 * File-name    : testDatasetInvoice.js
 * Description  : Get dataset with a dynamic call, loop through the data 
 *                fields
 * Methods used :
 *    node4progress.callHandler     -> Execute handler procedure 
 *    node4progress.getDataset      -> Get dataset object from the appserver output, make changes to the data
 *                                     and display the data
 *    TempTable.forEach             -> Loop through records in a temp-table
 *    buffer.display(...)           -> Return a string with fields formatted in accordance with bufferfield.format
 *    
 */

var conf = require("./config/config.json");
var node4progress = require("node4progress")(conf);
node4progress.setAppsvrProc("Examples/InvoiceHandler.p","",false,true);
node4progress.setParameter("InputPars","longchar","input","NumInvoicesToPull=5","");
node4progress.setParameter("OutputPars","character","output","","");
node4progress.setParameter("dsInvoice","dataset-handle","output","","");
node4progress.setParameter("ErrMsg","character","output","","");
console.log("invoking Appserver Procedure");
node4progress.invoke(function(err,result){
	var dataset = null;
	var line = "";
	if(err){
		console.log("ERROR->"+err);
	}else{
		//console.log(result);
		var jsonObj=JSON.parse(result);
		try{
			dataset = node4progress.getDataset("dsInvoice",jsonObj);
		}catch(err){
			console.log(err);
		}
		var ttInvoice = dataset.$("ttInvoice");	
		var ttInvoiceNote = dataset.$("ttInvoice-Note");
		ttInvoice.forEach(function(invBuf){			
			ttInvoiceNote.forEach(function(invNoteBuf){
				invNoteBuf.$("Note").setAttr("format","x(20)");
				if(invNoteBuf.$("Invoice-num").$('value')===invBuf.$("Invoice-num").$("value")){
				   line=invBuf.display("Invoice-num Order-num cust-num Invoice-date");
				   line+=" "+invNoteBuf.display("EventDtTm EventDtTm-TZ Note");
				   console.log(line);
				}				
			});			
		});	
	}
});
