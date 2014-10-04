/**
 * File-name    : testDatasetInvoice.js
 * Description  : Get dataset with a dynamic call, loop through the data 
 *                fields
 * Methods used :
 *    node4progress.setAppsvrProc   -> Define appserver procedure to call
 *    node4progress.setParameter    -> Define parameter for appserver procedure to call 
 *    node4progress.invoke          -> invoke appserver procedure to call 
 *    node4progress.getDataset      -> Get dataset object from the appserver output, make changes to the data
 *                                     and display the data
 *    TempTable.forEach             -> Loop through records in a temp-table
 *    buffer.display(...)           -> Return a string with fields formatted in accordance with bufferfield.format    
 */

// Load configuration file
var conf = require("./config/config.json");
// Instantiate node4progress
var node4progress = require("node4progress")(conf);
// Define appserver procedure to call
node4progress.setAppsvrProc("Examples/invoiceHandler.p","",false,true);
// Define parameters
node4progress.setParameter("InputPars","longchar","input","NumInvoicesToPull=5","");
node4progress.setParameter("OutputPars","character","output","","");
node4progress.setParameter("dsInvoice","dataset-handle","output","","");
node4progress.setParameter("ErrMsg","character","output","","");
console.log("invoking Appserver Procedure");
// Invoke appserver procedures
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
		        //     1     1    53 08/02/93 27/09/14 12:26:34.894 pm 27/09/2014 12:26:34.894 pm -07:00 Invoive created 
		var hdr = "Inv # Ord # Cust#    Inv Dt Event date/time          Event date/time TZ                Note\n" +
		          "===== ===== ===== ========= ======================== ================================= ================";
		console.log(hdr);
		//Loop throiugh the data
		ttInvoice.forEach(function(invBuf){			
			ttInvoiceNote.forEach(function(invNoteBuf){
				invNoteBuf.$("Note").setAttr("format","x(20)");
				invNoteBuf.$("EventDtTm").setAttr("format","99/99/99 HH:MM:SS.SSS AM");
				invNoteBuf.$("EventDtTm-TZ").setAttr("format","99/99/9999 HH:MM:SS.SSS AM +HH:MM");
				if(invNoteBuf.$("Invoice-num").$('value')===invBuf.$("Invoice-num").$("value")){
				   line=invBuf.display("Invoice-num Order-num cust-num Invoice-date");
				   line+=" "+invNoteBuf.display("EventDtTm EventDtTm-TZ Note");
				   console.log(line);
				}				
			});			
		});	
	}
});
