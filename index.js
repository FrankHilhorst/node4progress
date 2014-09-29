var http        = require("http"),
	moment		= require("moment"),
    numeral     = require('numeral'),
    Dataset		= require('./dataset.js'),
    TempTable	= require('./temptable.js'),
    debug		= require('debug'),
    log			= debug("n4p:index");

debug.enable("n4p:*");

/*****************************************************************************************************/
//dynCallPromise -> promise object for dynamic call requests
function dynCallPromise(iNode4Progress,iDyncallJsonStr){
	log( "dCP create" );

	this.node4progress	= iNode4Progress;
	this.dynCallJsonStr	= iDyncallJsonStr;
	this.callback		= null;
}

dynCallPromise.prototype.execute = function(iCallback){
	log( "dCP:execute" );

	if(iCallback){
        this.callback	= iCallback;
	}
	if(this.node4progress.winstoneStarted === true){
		this.executeAppCall();
	} else {
		this.node4progress.dynCallPromises.push( this );
	}
};

dynCallPromise.prototype.executeAppCall = function(){
	log( "dCP:executeAppCall" );

	var that = this;
	
	this.node4progress.prepareAppsvrCall( this.dynCallJsonStr, function( err, dynCallStr ){		
		if(err & err!==null){
			that.callback( err, null );
		}else{
			//that.node4progress.httpPost( dynCallStr, that.callback );
			that.node4progress.httpPost(dynCallStr, "application/json","callAppsvrProc", that.callback);
		}
	});			
};

/*****************************************************************************************************/
//datasetPromise -> promise object for getDatasetScheme requests
function datasetPromise( iNode4Progress, iDyncallJsonStr, iCallback ){
	log( "dsP create" );

	this.node4progress		= iNode4Progress;
	this.dynCallJsonStr		= iDyncallJsonStr;
	this.callback			= iCallback;
}

datasetPromise.prototype.execute = function(){
	log( "dsP:execute" );

	if(this.node4progress.winstoneStarted === true){
		this.executeRequest();
	} else {
		this.node4progress.datasetPromises.push( this );
	}	
};
datasetPromise.prototype.executeRequest = function(){
	log( "dsP:executeRequest" );

	var that = this;
	this.node4progress.prepareAppsvrCall( this.dynCallJsonStr, function( err, dynCallStr ){		
		if( err & err!==null){
			that.callback( err,null );
		}else{
			//that.node4progress.httpPost( dynCallStr, that.callback );
			that.node4progress.httpPost(dynCallStr, "application/json","callAppsvrProc", that.callback);
		}
	});			
};

/*****************************************************************************************************/
//tamptablePromise -> promise object for getDatasetScheme requests
function tempTablePromise( iNode4Progress, iDyncallJsonStr,iCallback){
	log( "ttP create" );
	
	this.node4progress		= iNode4Progress;
	this.dynCallJsonStr		= iDyncallJsonStr;
	this.callback			= iCallback;
}

tempTablePromise.prototype.execute = function(){
	log( "ttP:execute" );

	if(this.node4progress.winstoneStarted === true){
		this.executeRequest();
	} else {
		this.node4progress.tempTablePromises.push(this);
	}
};

tempTablePromise.prototype.executeRequest = function(){
	log( "ttP:executeRequest" );

	var that = this;
	this.node4progress.prepareAppsvrCall(this.dynCallJsonStr,function(err,dynCallStr){
		if(err & err!==null){
			that.callback(err,null);
		}else{
			//that.node4progress.httpPost( dynCallStr, that.callback );
			that.node4progress.httpPost(dynCallStr, "application/json","callAppsvrProc", that.callback);
		}
	});
};


/*****************************************************************************************************/
// handlerCallPromise -> promise object for getDatasetScheme requests
function handlerCallPromise(iNode4Progress){
	log( "hcP create" );
	
	this.node4progress	= iNode4Progress;
	this.handler		= null;
	this.inputPars		= null;
	this.callback		= null;
}

handlerCallPromise.prototype.execute = function(iInputPars,iCallBack){
	log( "hcP:execute", iInputPars );

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
	log( "hcP:executeHandler" );
    //var callBackNow = this.callback;
	//this.node4progress.callHandler( this.handler, this.inputPars, this.callback );
	//this.node4progress.httpPost(this.inputPars,this.callback);
	this.node4progress.httpPost(this.inputPars, "text/plain", "CallHandler", this.callback);
};

function node4progress(conf) {
	log( "n4p create" );
	var that = this;
	if(conf !== null){
       this.conf = conf;
	} else {
		this.conf = require(__dirname + "/config/config.json");
	}	
    //this.conf = require(__dirname + "/config/config.json");
	this.dynCall			= {};
	this.dynCallPromises	= [];
	this.handlerPromises	= [];
	this.datasetPromises	= [];
	this.tempTablePromises	= [];
	this.spawn				= require('child_process').spawn;
	//this.spawn				= require('child_process').exec;
	this.winstoneStarted	=false;
	this.appserverUrl		= this.conf.AppserverUrl;
	this.appserverUserName	= this.conf.AppserverUserName;
	this.appserverUserPassword = this.conf.AppserverPassword;
	this.appserverSessionModel = this.conf.AppserverSessionModel;
	this.winstoneSvrPort	= this.conf.WinstoneSvrPort;
	this.dateFormat         = this.conf.DateFormat;
	this.winstone			= null;
	this.env				= process.env;
	this.startWinstone();
	
}

node4progress.prototype.startWinstone = function(){
	log( "startWinstone" );

	var that = this;
	this.env.appserverUrl			= this.appserverUrl;
	this.env.appserverUserName		= that.appserverUserName;
	this.env.appserverUserPassword	= that.appserverUserPassword;
	this.env.appserverSessionModel 	= that.appserverSessionModel;
	this.env.winstoneSvrPort		= that.winstoneSvrPort;
	
	var args = ['-jar', __dirname + '/winstone/winstone-0.9.10.jar','--warfile',"./webapps/Node4ProgressServlet.war",'--httpPort='+this.winstoneSvrPort];
	var options = { 
			cwd: 		__dirname + "/winstone",
			env: 		this.env,
			detached: 	false,
			setsid:		false		
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
         for(var i=0;i<that.tempTablePromises.length;i++){
        	 that.tempTablePromises[i].executeRequest();
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

	process.on('SIGHUP', function(err) {
        console.log('\'SIGHUP\' fired');
        that.stopWinstone(function(err,result){
        	console.log("stopWintone->"+result);
        });
	});			

};

node4progress.prototype.handler = function(){
	log( "handler" );
	return new handlerCallPromise(this);
};

node4progress.prototype.callHandler	= function( iHandler, iInputParameters,iIncludeMetaSchema, callback ){
	log( "callHandler", iHandler );

	var post_data = iHandler + "|" + iIncludeMetaSchema + "|" + iInputParameters;
	var handler = new handlerCallPromise(this);
	handler.execute(post_data,callback);
};

node4progress.prototype.httpPost = function(post_data,content_type,callMethod,callback) {
    // An object of options to indicate where to post to
    var post_options = {
        host: 'localhost',
        port: this.winstoneSvrPort,
        path: '/TurboNode?' + callMethod,
        method: 'POST',
        headers: {
            'Content-Type': content_type,
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
	log( "stopWinstone" );

	this.httpPost("","text/plain","stop",callback);
};

node4progress.prototype.setAppsvrProc = function(iProcName,iInternalProcName,iIsPersistent,iIncludeMetaSchemna){
	log( "setAppSvrProc", iProcName );

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
	log( "setParameter", parName );

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
	log( "setPar", elm.parName );

	elm.parIndex	= this.dynCall.dsCallStack.ttCallParameter.length + 1;
	this.dynCall.dsCallStack.ttCallParameter.push( elm );	
};
node4progress.prototype.appProc = function(){
	log( "appProc" );

	var dynCallStr = JSON.stringify(this.dynCall);
	return new dynCallPromise(this,dynCallStr);
};

node4progress.prototype.invoke = function(callback){
	log( "invoke" );

	var dynCallStr = JSON.stringify(this.dynCall);
	var appCall = new dynCallPromise(this,dynCallStr);
	appCall.execute(callback);
};

node4progress.prototype.getEmptyDataset = function(iDatasetNm,iDatasetProvider,callback){
	log( "getEmptyDataset", iDatasetNm );

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

node4progress.prototype.getEmptyTempTable = function(iTtNm,iTtProvider,callback){
	log( "getEmptyTempTable", iTtNm );

	var that=this;
	var tt=null;
	this.setAppsvrProc("getSchema","",false,true);
	this.setParameter(iTtNm,"table-handle","output","",iTtProvider);
	var ttPromise = new tempTablePromise(this,JSON.stringify(this.dynCall),function(err,iJsonDatasetStr){
		var jsonObj=null;
        try{
        	jsonObj=JSON.parse(iJsonDatasetStr);   
		    tt=that.getTempTable(iTtNm,iJsonDatasetStr);
        }catch(e){
        	if(jsonObj && jsonObj["error"]!==""){
        		err=jsonObj["error"] + "\n";
        	}
        	err+=e;
        }
		callback(err,tt);
	});
	ttPromise.execute();
};

node4progress.prototype.prepareAppsvrCall = function(dsCallStack,callback){
	log( "prepareAppsvrCall" );

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
	}
	catch(err){
		errObj=err;
	}
	
	callback(errObj,JSON.stringify(dsCallStack));
};

node4progress.prototype.getDataset = function(iDsName,iDynCallJson){
	log( "getDataset", iDsName );
	var dateFormatStr=this.dateFormat;
	if(typeof iDynCallJson == "string"){
		iDynCallJson=JSON.parse(iDynCallJson);
	}
	var dataset = new Dataset(iDsName, iDynCallJson,dateFormatStr);
	return dataset;
};

node4progress.prototype.getTempTable = function(iTtNm,iDynCallJson){
	log( "getTempTable", iTtNm );

	var tt = null;
	if(typeof iDynCallJson == "string"){
		iDynCallJson=JSON.parse(iDynCallJson);
	}
	tt=this.getTempTableS1(iTtNm, iDynCallJson);
	return tt;
};

node4progress.prototype.getTempTableS1 = function(iTtNm,iJsonObj){
	log( "getTempTableS1", iTtNm );
	
	for(var prop in iJsonObj){
		if(iJsonObj[prop][iTtNm] &&
		   iJsonObj[iTtNm+"MetaSchema"]){
			  tt = new TempTable(null,iTtNm,iJsonObj[prop][iTtNm],iJsonObj[iTtNm+"MetaSchema"],this.dateFormat);
		 }else if(typeof iJsonObj === "object"){
			 tt=this.getTempTableS1(iTtNm, iJsonObj[prop]);
		 }
	}
	return tt;
};

//export a new instance to the interface per call
module.exports	= function(conf) {
	return new node4progress(conf);
};
