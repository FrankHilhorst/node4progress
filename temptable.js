
var Buffer      = require('./buffer.js'),
    debug		= require('debug'),
	log			= debug('n4p:temptable');

function TempTable( iDataset, iName, ttRecordArray, iMetaSchema,iDateFormat ){
	log( "tt create", iName );
	this.dateFormat=iDateFormat;
	this.dataset=null;	
	if(iDataset){
       this.dataset=iDataset.dataset;
	}
	this.records=ttRecordArray;
	this.name=iName;
	this.metaSchema=iMetaSchema;
	
	this.currentRecord={};
	this.currentRecordIndex=-1;
	this.buffer = new Buffer( this, this.metaSchema,this.dateFormat);
	return this;	
}

TempTable.prototype.available = function() {
	log( "tt:available" );	
	return (this.currentRecordIndex>=0);
};

TempTable.prototype.bufferCreate = function(){
	log( "tt:bufferCreate" );

	var newRecord   = {},
	    fieldDefs   = null,
	    value       = "";
	    
	for(var prop in this.metaSchema){
		fieldDefs=this.metaSchema[prop];
        value=this.initial(fieldDefs.dataType,fieldDefs.initial);        
		newRecord[prop]=value;		
	}
	
	this.records.push(newRecord);
	this.currentRecordIndex=this.records.length-1;
	this.buffer.setCurrentRecord(this.records[this.records.length-1]);
	return this.buffer;
};

TempTable.prototype.bufferCopy = function(iRecordJson){
	log( "tt:bufferCopy" );

	if(this.currentRecordIndex >=0){
		if(typeof iRecordJson === "string"){
			iRecordJson=JSON.parse(iRecordJson);
		}
		if(iRecordJson instanceof Buffer){
			var jsonObj=iRecordJson.writeJson();
			jsonObj=JSON.parse(jsonObj);
			this.bufferCopy(jsonObj);
		}else if(typeof iRecordJson === "object"){
		   for(var prop in iRecordJson){
			   if(this.buffer.$(prop)){
				   this.buffer.$(prop).bufferValue(iRecordJson[prop]);
			   }
		   }
		}		
	}else{
		throw new Error("No record selected to bufferCopy to");
	}
};

TempTable.prototype.bufferDelete = function(){
	log( "tt:bufferDelete" );

	var deletedRecordJson=null;
	if(this.currentRecordIndex>=0){
		deletedRecordJson=this.records.splice(this.currentRecordIndex);
	}
	if(this.records.length === 0){
		this.currentRecordIndex=-1;
	}else if(this.currentRecordIndex> this.records.length-1){
		this.records.length=this.records.length-1;
	}
	if(deletedRecordJson[0]){
		return deletedRecordJson[0];
	}else{
		return null;
	}
};

TempTable.prototype.copyTempTable = function(empty){
	log( "tt:copyTempTable" );

	var copyTempTableJsonObj = {};
	copyTempTableJsonObj[this.name] = this.records;	
    copyTempTableJsonObj.metaSchema = this.metaSchema;
	var copyTempTableStr = JSON.stringify(copyTempTableJsonObj);
	copyTempTableJsonObj = JSON.parse(copyTempTableStr);
    var copyTempTable = new TempTable(null,this.name,copyTempTableJsonObj[this.name],copyTempTableJsonObj.metaSchema,this.dateFormat);
    if(empty === true){
        copyTempTable.emptyTempTable();		
	}
	return copyTempTable;
};

TempTable.prototype.emptyTempTable = function(){
	log( "tt:emptyTempTable" );
	if(this.records){
		while(this.records.length>0){
			this.records.splice(0);
		}
	}
	this.currentRecordIndex=-1;
/*
	this.records	= [];
*/	
};

TempTable.prototype.forEach = function(callback){
	log( "tt:forEach" );

	this.records.forEach( function(item, i ) {
		this.currentRecordIndex     = i;
		this.buffer.setCurrentRecord( item );
	    callback( this.buffer );
	}, this );
};

TempTable.prototype.findFirst = function(){
	log( "tt:findFirst" );

	if(this.records.length>0){
		this.currentRecordIndex=0;
		this.buffer.setCurrentRecord(this.records[0]);
	}else{
		this.currentRecordIndex=-1;
	}
	return this.buffer;
};

TempTable.prototype.findLast = function(){
	log( "tt:findLast" );

	if(this.records.length>0){
		this.currentRecordIndex=this.records.length-1;
		this.buffer.setCurrentRecord(this.records[this.records.length-1]);
	}else {
		this.currentRecordIndex=-1;
	}
	return this.buffer;
};

TempTable.prototype.initial = function(iDataType,iValue){
	log( "tt:initial" );

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
	log( "tt:writeJson" );

    var obj     = {};
    
    obj[ this.name ]    = this.records;
    
	return JSON.stringify( obj );
};

TempTable.prototype.jsonObjectEmpty = function(jsonObj){
	log( "tt:jsonObjectEmpty" );

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

module.exports	= function( iDataset,iName,ttRecordArray,iMetaSchema,iDateFormat ) {
    return new TempTable( iDataset,iName,ttRecordArray,iMetaSchema,iDateFormat );
}