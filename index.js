/*
var async		= require("async"),
	clone		= require("clone"),
	util		= require("util"),
	http        = require("http"),
	fs          = require("fs"),
	sleep       = require("sleep");
*/
var http        = require("http"),
	moment		= require("moment"),
    numeral     = require('numeral');

//dynCallPromise -> promise object for dynamic call requests
function dynCallPromise(iNode4Progress,iDyncallJsonStr){
	this.node4progress=iNode4Progress;
	this.dynCallJsonStr=iDyncallJsonStr;
	this.callback=null;
}

dynCallPromise.prototype.execute = function(iCallback){
	if(iCallback){
        this.callback=iCallback;
	}
	if(this.node4progress.winstoneStarted === true){
		this.executeAppCall();
	} else {
		this.node4progress.dynCallPromises.push(this);
	}
};
dynCallPromise.prototype.executeAppCall = function(){
	var that = this;
	this.node4progress.prepareAppsvrCall(this.dynCallJsonStr,function(err,dynCallStr){		
		if(err & err!==null){
			that.callback(err,null);
		}else{
			that.node4progress.httpPost( dynCallStr, that.callback );
		}
	});			
};
//datasetPromise -> promise object for getDatasetScheme requests
function datasetPromise(iNode4Progress,iDyncallJsonStr,iCallback){
	this.node4progress=iNode4Progress;
	this.dynCallJsonStr=iDyncallJsonStr;
	this.callback=iCallback;
}
datasetPromise.prototype.execute = function(){
	if(this.node4progress.winstoneStarted === true){
		this.executeRequest();
	} else {
		this.node4progress.datasetPromises.push(this);
	}	
};
datasetPromise.prototype.executeRequest = function(){
	var that = this;
	this.node4progress.prepareAppsvrCall(this.dynCallJsonStr,function(err,dynCallStr){		
		if(err & err!==null){
			that.callback(err,null);
		}else{
			that.node4progress.httpPost( dynCallStr, that.callback );
		}
	});			
};

function handlerCallPromise(iNode4Progress){
	this.node4progress=iNode4Progress;
	this.handler = null;
	this.inputPars = null;
	this.callback = null;
}

handlerCallPromise.prototype.execute = function(iHandler,iInputPars,iCallBack){
	var that = this;
	if(iHandler){
		this.handler=iHandler;
	} 
	if(iInputPars){
		this.inputPars=iInputPars;
	} 
	if(iCallBack){
		this.callback=iCallBack;
	}
	if(this.node4progress.winstoneStarted === true){
		this.executeHandler();
	} else {		
		this.node4progress.handlerPromises.push(this);
	}	
};
handlerCallPromise.prototype.executeHandler = function(){
    var callBackNow = this.callback;
	this.node4progress.callHandler( this.handler, this.inputPars, this.callback );
};

function Dataset(iDatasetNm,iJsonObj){
	this.dataset=null;
	this.metaSchema=null;
	this.name = "";
	this.rootName="";
	this.getDataset(iDatasetNm,iJsonObj);
	if(this.name == ""){
		throw new Error("Dataset "+iDatasetNm+" not found");
	}
}

Dataset.prototype.$ = function(ttName){
	var targetTable = null;
	//var datasetContents = this.dataset[this.name];
	var datasetContents=null;
	for(var prop in this.dataset){
		datasetContents=this.dataset[prop];
		break;
	}
	var ttNm = "";
	for(tt in datasetContents){		
		if(tt.toString().toLowerCase() == ttName.toLowerCase()){
			targetTable = datasetContents[tt];
			ttNm=tt;
			break;
		}
	}
	return new TempTable(this,ttNm,targetTable,this.metaSchema[ttNm]);
};
Dataset.prototype.copyDataset = function(empty){
	var copyDatasetJsonObj = {};
	copyDatasetJsonObj[this.name] = JSON.parse(this.writeJson());	
    copyDatasetJsonObj[this.name+"MetaSchema"] = JSON.parse(JSON.stringify(this.metaSchema));
    copyDataset = new Dataset(this.name,copyDatasetJsonObj);
	if(empty === true){
		copyDataset.emptyDataset();		
	}
	return copyDataset;
};
Dataset.prototype.emptyDataset = function(){
	for(var prop in this.dataset[this.rootName]){
		this.$(prop).emptyTemptable();
	}
};
Dataset.prototype.getDataset = function(iDatasetNm,iJsonObj){
	var prop="";
	var prop2="";
	for(prop in iJsonObj){
		if(iJsonObj[prop][iDatasetNm] &&
				iJsonObj[prop][iDatasetNm+"MetaSchema"]){
			this.dataset=iJsonObj[prop];
			this.metaSchema=iJsonObj[prop][iDatasetNm+"MetaSchema"];
			this.name=prop.toString();
			for(prop2 in this.dataset){
				this.rootName=prop2;
				break;
			}
			break;
		}						
		/*
		if(iDatasetNm.toLowerCase() == prop.toString().toLowerCase()){
			if(iJsonObj[prop+"MetaSchema"]){			
				//this.dataset=iJsonObj[prop];
				this.dataset=iJsonObj;
				this.metaSchema=iJsonObj[prop+"MetaSchema"];
				this.name=prop.toString();
				for(prop2 in this.dataset){
					this.rootName=prop2;
					break;
				}
				break;
			}			
		}
*/
		if(typeof iJsonObj[prop] == "object"){
			this.getDataset(iDatasetNm,iJsonObj[prop]);
		}
	}
};
Dataset.prototype.writeJson = function(){
	var writeJson="";
	if(this.dataset){
		writeJson=JSON.stringify(this.dataset);
	}
	return writeJson;
};
function TempTable(iDataset,iName,ttRecordArray,iMetaSchema){
	this.dataset=iDataset.dataset;
	this.records=ttRecordArray;
	this.name=iName;
	this.metaSchema=iMetaSchema;
	this.buffer = new Buffer(this,this.metaSchema);
}
TempTable.prototype.emptyTemptable = function(){
	if(this.records){
		while(this.records.length>0){
			this.records.splice();
		}
	}
};

TempTable.prototype.forEach = function(callback){
	var that = this;
	this.records.forEach(function(currentRecord){
		that.buffer.setCurrentRecord(currentRecord);
		callback(that.buffer);
	});
};
TempTable.prototype.findFirst = function(){
	if(this.records.length>0){
		this.buffer.setCurrentRecord(this.records[0]);
	}
	return this.buffer;
};
TempTable.prototype.findLast = function(){
	if(this.records.length>0){
		this.buffer.setCurrentRecord(this.records[this.records.length-1]);
	}
	return this.buffer;
};
TempTable.prototype.bufferCreate = function(){
	var newRecord = {};
	var fieldDefs = null;
	var value = "";
	for(var prop in this.metaSchema){
		fieldDefs=this.metaSchema[prop];
        value=this.initial(fieldDefs.dataType,fieldDefs.initial);        
		newRecord[prop]=value;		
	}
	this.records.push(newRecord);
	this.buffer.setCurrentRecord(this.records[this.records.length-1]);
	return this.buffer;
};
TempTable.prototype.initial = function(iDataType,iValue){
	var value=null;
	if(iDataType.toLowerCase()==="integer"||iDataType.toLowerCase()==="decimal"){
		value=Number(iValue.replace(",",""));
	}else if(iDataType.toLowerCase()==="date"){
		if(iValue==="today"){
			value	= moment().format( "YYYY-MM-DD" );
		}else{
			value	= moment( iValue ).format( "YYYY-MM-DD" );
		}
	}else{
		value=iValue.toString();
	}
	return value;
};
TempTable.prototype.writeJson = function(){ 
	writeJson='{ "'+this.name+'":'+JSON.stringify(this.records) + "}";
	return writeJson;
};
TempTable.prototype.jsonObjectEmpty = function(jsonObj){
	var i = 0;
	jsonObjectEmpty=true;
	if(jsonObj !== null){
		for(var prop in jsonObj)
			++i;
		if(i > 0)
			jsonObjectEmpty=false;
	}
	return jsonObjectEmpty;	
};
function Buffer(iTempTable,iMetaSchema){
	this.currentRecord = null;
	this.tempTable = iTempTable;
	this.metaSchema = iMetaSchema;	
	this.bufferField = new BufferField();
}

Buffer.prototype.setCurrentRecord = function(iCurrentRecord){
	this.currentRecord=iCurrentRecord;
};
Buffer.prototype.$ = function(fieldNm){
	var value = "";
	var fieldMetaSchema = null;
	for(var prop in this.currentRecord){
		if(prop.toLowerCase() == fieldNm.toLowerCase()){
			value=this.currentRecord[prop];
			fieldMetaSchema=this.metaSchema[prop];	
			this.bufferField.setCurrenBufferField(prop,this.currentRecord,fieldMetaSchema);
			break;
		}
	}
	return this.bufferField;
};
Buffer.prototype.display = function(iFieldToDisplay){
	var fields = iFieldToDisplay.split(" ");
	var fieldStr = "";
	for(var i=0;i<fields.length;i++){
		if(i>0){fieldStr+=" ";}
		fieldStr+=this.$(fields[i]).$("screenValue");
	}
	return fieldStr;
};

function BufferField(){
	this.currentRecord=null;
	this.name="";
	this.value="";
	this.dataType="";
	this.initial="";
	this.format="";
	this.label="";
	this.metaSchema=null;
};
BufferField.prototype.setCurrenBufferField  = function(iName,iCurrentRecord,iFieldMetaSchema){
	this.name=iName;
	this.currentRecord=iCurrentRecord;
	this.metaSchema=iFieldMetaSchema;
	this.value=this.currentRecord[this.name];
	this.dataType=iFieldMetaSchema["dataType"];
	this.format=iFieldMetaSchema["format"];
	this.initial=iFieldMetaSchema["initial"];
	this.label=iFieldMetaSchema["label"];	
};
BufferField.prototype.$ = function(iAttribute){
	var attrVal="";
	
	switch ( iAttribute.toLowerCase() ) {
		case "buffervalue":
		case "buffer-value":
		   	if(this.dataType.toLowerCase() === "date"){
		   		attrVal		= moment( this.value ).toDate();
	    	}
	    	break;
	    	
	    case "value":
	    	if(this.dataType.toLowerCase()=="date"){
	    		attrVal=this.formattedValueDate();
	    	}else{
	    		attrVal=this.value;
	    	}
	    	break;
			
		case "format":
			attrVal		= this.format;
			break;
			
		case "initial":
			attrVal		= this.initial;
			break;

		case "label":
			attrVal		= this.label;
			break;
			
		case "datatype":
		case "data-type":
			attrVal		= this.dataType;
			break;
			
		case "screenvalue":
			attrVal		= this.formattedValue();
			break;
			
		default:
			throw new Error("Invalid buffer field attribute of '"+iAttribute+"' requested");
			break;
	}

    return attrVal;
};

BufferField.prototype.bufferValue = function(iValue){
	var day="";
	var month="";
	if( this.dataType.toLowerCase() === "date" ){
		this.currentRecord[this.name]		= moment( iValue ).format( "MM/DD/YYYY" );
	}else{
		this.currentRecord[this.name] = iValue;
	}
};

BufferField.prototype.setAttr = function(iAttrNm,iValue){
	if(iAttrNm.toLowerCase() === "format"){
		this.metaSchema["format"]=iValue;
	} else {
		throw new Error('Attribute "'+iAttrNm+'" cannot be set');
	}
};

BufferField.prototype.formattedValue = function(){
	var formattedValue,
		length,
		i;
	
	switch ( this.dataType.toLocaleLowerCase() ) {
		case "character":
			if(this.format.substring(1,2)=="("){
				length=this.format.substring(2,this.format.length-1);
			} else{
				length=this.format.length;
			}	
			if(length<this.value.length){
				formattedValue=this.value.substring(0, length);
			}else{
				for(i=this.value.length;i<length;i++){
					formattedValue+=" ";
				}
			}
			break;
			
		case "integer":
		case "decimal":
			formattedValue=this.formattedValueNumber();
			break;
			
		case "date":
			formattedValue=this.formattedValueDate();
			break;
			
		default:
	    	formattedValue=this.value;
	    	break;
	}
	
    return formattedValue;
};
BufferField.prototype.formattedValueNumber = function(){
	var decimalPrecision=0;
	var numeralFormat = "";
	var formattedValue="";
	var i = 0;
	var j = 0;
	if(this.format.indexOf(".",0)>=0){
       decimalPrecision=this.format.length-this.format.toString().indexOf('.',0)-1;
	} 
	if(decimalPrecision>0){
		numeralFormat="0.";
		for(i=0;i<decimalPrecision;i++){
			numeralFormat+="0";
		}
	}else{
		numeralFormat="0";
	}
	if(this.format.indexOf(",",0)>=0){
		numeralFormat="0,"+numeralFormat;
	}	
	formattedValue=numeral(this.value).format(numeralFormat);
	j=this.format.length-formattedValue.length;
	for(i=0;i<j;i++){
		if(i<j){
			if(this.format.substring(i,i+1)==="9"){
				formattedValue="0"+formattedValue; 
				
			}else{
				formattedValue=" "+formattedValue;
			}
		}
	}
	return formattedValue;
};
BufferField.prototype.formattedValueNumber2 = function(){
	var formattedValue=this.value;
    var str="";
	var char="";
	var i = 0;
	var j = 0;
	var k = 0;
	var value=null;
	var strLength=0;
	value=this.value;
	str=value.toString();
	length=this.format.length;				
	if(this.dataType.toLocaleLowerCase()=="decimal"){
		var decimalPrecision=0;
		if(this.format.indexOf(".",0)>=0){
	       decimalPrecision=this.format.length-this.format.toString().indexOf('.',0)-1;
		}
		value.toFixed(decimalPrecision);
		str=value.toString();
		k=str.lastIndexOf(".");
		if(k==-1){
			k=0;
			value+=".";
		}else{
			++k;
			k=str.length-k;
		}
		for(i=k;i<decimalPrecision;i++){
			value+="0";
		}
	}		
	formattedValue="";		
	for(i=0;i<this.format.length;i++){
		char=this.format.substring(i,i+1);			
		if(char==">"){formattedValue+=" ";}
		else if(char==","){formattedValue+=",";}
		else if(char=="9"){formattedValue+="0";}
		else if(char=="."){formattedValue+=".";}
		else if(char=="-"){formattedValue+="-";}
    }
	k=0;
	for(i=value.toString().length - 1;i>=0;i--){
	    j=length-value.toString().length+i+1-k;
		char=formattedValue.substring(j-1,j);
		if(char==","){
			j--;
			k++;
		}
		formattedValue=formattedValue.substring(0,j-1)+value.toString().substring(i,i+1)+formattedValue.substring(j,length);
	}
	for(i=0;i<formattedValue.length-1;i++){
		if(formattedValue.substring(i,i+1)=="," &&
		   (formattedValue.substring(i+1,i+2)==" " ||
			i == 0 ||
		   formattedValue.substring(i-1,i)==" ")){
		   formattedValue=formattedValue.substring(0,i) + " " + formattedValue.substring(i+1,formattedValue.length);	
		}
	}	
	
	if(this.value>=0){
		formattedValue=formattedValue.replace("-"," ");
	}else if(this.format.substring(0,1)=="-" &&
			this.format.length>=2 &&
			this.format.substring(1,2) == ">"){
		formattedValue=" "+formattedValue.substring(1,formattedValue.length);
	}		
	return formattedValue;
	
};
BufferField.prototype.formattedValueDate = function(){
	return formattedValue		= moment( this.value ).format( (this.format == "99/99/99") ? "DD/MM/YY" : "DD/MM/YYYY" );
};

function node4progress(conf) {
	var that = this;
	if(conf !== null){
       this.conf = conf;
	} else {
		this.conf = require(__dirname + "/config/config.json");
	}	
    //this.conf = require(__dirname + "/config/config.json");
	this.dynCall	= {};
	this.dynCallPromises = [];
	this.handlerPromises = [];
	this.datasetPromises = [];
	this.spawn = require('child_process').spawn;	
	this.winstoneStarted=false;
	this.appserverUrl = this.conf.AppserverUrl;
	this.appserverUserName = this.conf.AppserverUserName;
	this.appserverUserPassword = this.conf.AppserverPassword;
	this.appserverSessionModel = this.conf.AppserverSessionModel;
	this.winstoneSvrPort = this.conf.WinstoneSvrPort;
	this.winstone=null;
	this.env = process.env;
	this.startWinstone();
	
}

node4progress.prototype.startWinstone = function(){
	//this.env = process.env;
	var that = this;
	this.env.appserverUrl = this.appserverUrl;
	this.env.appserverUserName = that.appserverUserName;
	this.env.appserverUserPassword = that.appserverUserPassword;
	this.env.appserverSessionModel = that.appserverSessionModel;
	this.env.winstoneSvrPort = that.winstoneSvrPort;
	
	var args = ['-jar', __dirname + '/winstone/winstone-0.9.10.jar','--warfile',"./webapps/Node4ProgressServlet.war",'--httpPort='+this.winstoneSvrPort];
	var options = { 
			cwd: __dirname + "/winstone",
			env: this.env,
			detached: false,
			//stdio:['ignore',out,err],
			//stdio:[null,process.stdout],
			setsid: false		
		};	
	
	this.winstone = this.spawn('java', args, options);
	
	this.winstone.stdout.on('data', function (data) {
          console.log(""+data);
          //if(data.toString().indexOf("Listener started:") > 0){
          if(data.toString().indexOf("running:") > 0){
             that.winstoneStarted=true;
             for(var i=0;i<that.dynCallPromises.length;i++){
            	 that.dynCallPromises[i].execute(null);
             }
             for(var i=0;i<that.handlerPromises.length;i++){
                 that.handlerPromises[i].executeHandler();            	 
             }       
             for(var i=0;i<that.datasetPromises.length;i++){
            	 that.datasetPromises[i].executeRequest();
             }
           }	           
		});			
	this.winstone.stderr.on('data', function (data) {
           console.log('Winstone error: ' + data);
		});
	
	this.winstone.on('close', function (code) {
           console.log('Winstome server exited with code ' + code);
		});
	process.on('uncaughtException', function(err) {
          console.log('Exception: ' + err + "\n"+err.stack);
          that.winstone.kill('SIGHUP');
	});			
};
node4progress.prototype.handler = function(){
	return new handlerCallPromise(this);
};

node4progress.prototype.callHandler	= function( iHandler, iInputParameters, callback ){
	var post_data = iHandler + "|" + iInputParameters;
	this.httpPost(post_data, "text/plain", "CallHandler", callback);
};

node4progress.prototype.httpPost = function( post_data, callback ) {
      // An object of options to indicate where to post to
      var post_options = {
          host: 'localhost',
          port: this.winstoneSvrPort,
          path: '/TurboNode?callAppsvrProc',
          method: 'POST',
          headers: {
              'Content-Type':	"application/json;charset=UTF-8",
              'Content-Length': post_data.length
          }
      };
      // Set up the request
      var post_req = http.request(post_options, function(res) {
          var resultStr = "";
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
              resultStr+=chunk;
          });	     
          res.on('end',function(){	
              callback(null,resultStr);
          });	      
      });

      // post the data
      post_req.write(post_data);
      post_req.end();
};
node4progress.prototype.stopWinstone = function(callback){
	this.httpPost("","text/plain","stop",callback);
};
node4progress.prototype.setAppsvrProc = function(iProcName,iInternalProcName,iIsPersistent,iIncludeMetaSchemna){
	this.dynCall = {
		dsCallStack:	{
			ttCallProgram:		[],
			ttCallParameter:	[]
		}
	};
	this.dynCall.dsCallStack.ttCallProgram.push(
		{
			ProcName:			iProcName,
			internalProcName:	iInternalProcName,
			IsPersistent:		iIsPersistent,
			includeMetaSchema:  iIncludeMetaSchemna
		}
	);
};

node4progress.prototype.setParameter = function(parName,parDataType,parIoMode,parValue,SchemaProvider){
	this.dynCall.dsCallStack.ttCallParameter.push( {
		parIndex: 		this.dynCall.dsCallStack.ttCallParameter.length + 1,
		parDataType:	parDataType,
		parIoMode:		parIoMode,
		parName:		parName,
		parValue:		parValue,
		SchemaProvider: SchemaProvider
	});	
};
node4progress.prototype.setPar = function( elm ) {
	elm.parIndex	= this.dynCall.dsCallStack.ttCallParameter.length + 1;
	this.dynCall.dsCallStack.ttCallParameter.push( elm );	
};
node4progress.prototype.appProc = function(){
	var dynCallStr = JSON.stringify(this.dynCall);
	return new dynCallPromise(this,dynCallStr);
};

node4progress.prototype.invoke = function(callback){
	var dynCallStr = JSON.stringify(this.dynCall);
	var appCall = new dynCallPromise(this,dynCallStr);
	appCall.execute(callback);
};

node4progress.prototype.getEmptyDataset = function(iDatasetNm,iDatasetProvider,callback){
	var that=this;
	var dataset=null;
	this.setAppsvrProc("getSchema","",false,true);
	this.setParameter(iDatasetNm,"dataset-handle","output","",iDatasetProvider);
	var dsPromise = new datasetPromise(this,JSON.stringify(this.dynCall),function(err,iJsonDatasetStr){
		var jsonObj=null;
        try{
        	jsonObj=JSON.parse(iJsonDatasetStr);   
		    dataset=that.getDataset(iDatasetNm,iJsonDatasetStr);
        }catch(e){
        	if(jsonObj && jsonObj["error"]!==""){
        		err=jsonObj["error"] + "\n";
        	}
        	err+=e;
        }
		callback(err,dataset);
	});
	dsPromise.execute();
};

node4progress.prototype.prepareAppsvrCall = function(dsCallStack,callback){
    //var callParameter=null; 
    //var i=0;
	var j=0;
	var k=0;
	var ttLongcharChunk = null;
	var ttLongcharChunkRow; 
	var errObj=null;
	var chunkCharSize=15000;
	try{
		if(typeof dsCallStack == "string"){
			dsCallStack = JSON.parse(dsCallStack);
		}
		dsCallStack.dsCallStack.ttCallParameter.forEach( function(callParameter) {
			if(callParameter.parDataType.toLowerCase()=="dataset-handle" ||
               callParameter.parDataType.toLowerCase()=="table-handle" ||
               callParameter.parDataType.toLowerCase()=="longchar"){
               if(callParameter.parIoMode.toLowerCase()=="input"||
                  callParameter.parIoMode.toLowerCase()=="input-output"){
                  if(typeof callParameter.parValue == "object"){
                     callParameter.parValue = JSON.stringify(callParameter.parValue);
                  }
                  k=0;
                  for(j=0;j<callParameter.parValue.length;j+=chunkCharSize){
                      if(ttLongcharChunk===null){
                         ttLongcharChunk = [];
                      }
                      ++k;
                      ttLongcharChunkRow = {};
                      ttLongcharChunkRow.parIndex = callParameter.parIndex;
                      ttLongcharChunkRow.chunkSeq = k;
                      ttLongcharChunkRow.chunkChar = callParameter.parValue.substr(j,chunkCharSize);
                      ttLongcharChunk.push(ttLongcharChunkRow);
                      callParameter.parValue="";
                  }
               } 
			}
        });
        if(ttLongcharChunk!==null){
           dsCallStack.dsCallStack.ttLongcharChunk = ttLongcharChunk; 
        }	   		
	}catch(err){
		errObj=err;
	}
	callback(errObj,JSON.stringify(dsCallStack));
};
node4progress.prototype.getDataset = function(iDsName,iDynCallJson){
	if(typeof iDynCallJson == "string"){
		iDynCallJson=JSON.parse(iDynCallJson);
	}
	var dataset = new Dataset(iDsName,iDynCallJson);
	return dataset;
}
//export a new instance to the interface per call
module.exports	= function(conf) {
	return new node4progress(conf);
};
