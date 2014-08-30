var async		= require("async"),
	clone		= require("clone"),
	util		= require("util"),
	http        = require("http"),
	fs          = require("fs"),
	sleep       = require("sleep");

function dynCallPromise(iNode4Progress,iDyncallJsonStr){
	this.node4progress=iNode4Progress;
	this.dynCallJsonStr=iDyncallJsonStr;
	this.callback=null;
}

dynCallPromise.prototype.uponCompletion = function(iCallback){
	this.callback=iCallback;
	if(this.node4progress.winstoneStarted === true){
		this.execute();
	} else {
		this.node4progress.dynCallPromises.push(this);
	}
};
dynCallPromise.prototype.execute = function(){
	var that = this;
	this.node4progress.prepareAppsvrCall(this.dynCallJsonStr,function(err,dynCallStr){		
		if(err & err!==null){
			that.callback(err,null);
		}else{
			that.node4progress.httpPost(dynCallStr, "application/json","callAppsvrProc", that.callback);
		}
	});			
};

function node4progressHttp(conf) {
	var that = this;
	if(conf !== null){
       this.conf = conf;
	} else {
		this.conf = require(__dirname + "/config/config.json");
	}	
    //this.conf = require(__dirname + "/config/config.json");
	this.dynCall	= {};
	this.dynCallPromises = new Array();
	this.spawn      = require('child_process').spawn;
	
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

node4progressHttp.prototype.startWinstone = function(){
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
          console.log('stdout fired: ' + data);          
          if(data.toString().indexOf("Listener started:") > 0){
             console.log("BINGO -> Winstone started");
             that.winstoneStarted=true;
             while(that.dynCallPromises.length>0){
            	 that.dynCallPromises[0].execute();
            	 that.dynCallPromises.splice(0);
             }
          }	           
		});			
	this.winstone.stderr.on('data', function (data) {
		  console.log('stderr: ' + data);
		});
	
	this.winstone.on('close', function (code) {
		  console.log('child process exited with code ' + code);
		});
	process.on('uncaughtException', function(err) {
		  console.log('Exception: ' + err + "\n"+err.stack);
		  that.winstone.kill('SIGHUP');
	});			
};
/*
node4progressHttp.prototype.startWinstone2 = function(){
	var that = this;
	var winstoneStarted=false;
	var args = ['-jar', __dirname + '/winstone/winstone-0.9.10.jar','--warfile',"./webapps/Node4ProgressServlet.war",'--httpPort='+this.winstoneSvrPort];
	var env = process.env;
	var out = fs.openSync(__dirname+"/winstone/winstone"+this.winstoneSvrPort+".log", "w", 0666); //fs.openSync('./mydoc.js', 'a', 0666);
	var err = fs.openSync(__dirname+"/winstone/winstone"+this.winstoneSvrPort+".log", "w", 0666);
	env.appserverUrl = this.appserverUrl;
	env.appserverUserName = that.appserverUserName;
	env.appserverUserPassword = that.appserverUserPassword;
	env.appserverSessionModel = that.appserverSessionModel;
	env.winstoneSvrPort = that.winstoneSvrPort;
	env.winstoneStarted="";
	var options = { 
		cwd: __dirname + "/winstone",
		env: env,
		detached: false,
		//stdio:['ignore',out,err],
		//stdio:[null,process.stdout],
		setsid: false		
	};	
console.log("starting winstone");	
	this.winstone = this.spawn('java', args, options);
console.log("start polling for winstone output->that.winstone.stdout"+that.winstone.stdout);
	this.winstone.stdout.on('data',function(data){
console.log("ondata->"+data);		
		if(data.indexOf("running")>0){			
			winstoneStarted=true;
		};
	});
	this.winstone.stderr.on('data', function (data) {
		  console.log('stderr: ' + data);
		});
	
	this.winstone.on('close', function (code) {
		  console.log('child process exited with code ' + code);
		});	
};
*/
node4progressHttp.prototype.callHandler	= function( iHandler, iInputParameters, callback ){
	var that      = this;
	var post_data = iHandler + "|" + iInputParameters;
	this.httpPost(post_data, "text/plain", "CallHandler", callback)
};

node4progressHttp.prototype.httpPost = function(post_data,content_type,callMethod,callback) {
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
node4progressHttp.prototype.stopWinstone = function(callback){
	this.httpPost("","text/plain","stop",callback);
};
node4progressHttp.prototype.setAppsvrProc = function(iProcName,iInternalProcName,iIsPersistent,iIncludeMetaSchemna){
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

node4progressHttp.prototype.setParameter = function(parName,parDataType,parIoMode,parValue,SchemaProvider){
	this.dynCall.dsCallStack.ttCallParameter.push( {
			parIndex: this.dynCall.dsCallStack.ttCallParameter.length + 1,
			parDataType : parDataType,
			parIoMode : parIoMode,
			parName : parName,
			parValue : parValue,
			SchemaProvider : SchemaProvider
	});	
};
/*
node4progressHttp.prototype.invoke = function(callback){
	var that = this;	
	this.prepareAppsvrCall(this.dynCall,function(err,dynCallStr){		
		if(err & err!=null){
			callback(err,null);
		}else{
			that.httpPost(dynCallStr, "application/json","callAppsvrProc", callback);
		}
	});
};
*/
node4progressHttp.prototype.invoke = function(){
	var dynCallStr = JSON.stringify(this.dynCall);
	return new dynCallPromise(this,dynCallStr);
};

node4progressHttp.prototype.prepareAppsvrCall = function(dsCallStack,callback){
	var callParameter=null;
	var i=0;
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
        if(ttLongcharChunk!=null){
           dsCallStack.dsCallStack.ttLongcharChunk = ttLongcharChunk; 
        }	   		
	}catch(err){
		errObj=err;
	}
	callback(errObj,JSON.stringify(dsCallStack));
};

//export a new instance to the interface per call
module.exports	= function(conf) {
	return new node4progressHttp(conf);
};
