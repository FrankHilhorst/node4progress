

function TempTable( iDataset, iName, ttRecordArray, iMetaSchema ){
	this.dataset            = null;

	iDataset && (this.dataset     = iDataset.dataset);

	this.records            = ttRecordArray;
	this.name               = iName;
	this.metaSchema         = iMetaSchema;
	this.currentRecord      = {};
	this.currentRecordIndex = -1;

	this.buffer             = new Buffer( this, this.metaSchema );
	
	return this;
}

TempTable.prototype.available = function() {
	return (this.currentRecordIndex>=0);
};

TempTable.prototype.bufferCreate = function(){
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
	if(this.currentRecordIndex >=0){
		if(typeof iRecordJson === "string"){
			iRecordJson=JSON.parse(iRecordJson);
		}
		if(typeof iRecordJson === "object"){
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
	var deletedRecordJson=null;
	if(this.currentRecordIndex>=0){
		deletedRecordJson=this.records.splice(this.currentRecordIndex);
	}
	if(this.records.length === 0){
		this.currentRecordIndex=-1;
	}else if(this.currentRecordIndex> this.records.length-1){
		this.records.length=this.records.length-1;
	}
	return deletedRecordJson[0];
};

TempTable.prototype.copyTempTable = function(empty){
	var copyTempTableJsonObj = {};
	copyTempTableJsonObj[this.name] = this.records;	
    copyTempTableJsonObj.metaSchema = this.metaSchema;
	var copyTempTableStr = JSON.stringify(copyTempTableJsonObj);
	copyTempTableJsonObj = JSON.parse(copyTempTableStr);
    var copyTempTable = new TempTable(null,this.name,copyTempTableJsonObj[this.name],copyTempTableJsonObj.metaSchema);
    if(empty === true){
        copyTempTable.emptyTempTable();		
	}
	return copyTempTable;
};

TempTable.prototype.emptyTemptable = function(){
	if(this.records){
		while(this.records.length>0){
			this.records.splice(0);
		}
	}
};

TempTable.prototype.forEach = function(callback){
	var that = this;
	
	this.records.forEach( function(item, i ) {
		that.currentRecordIndex     = i;
		that.buffer.setCurrentRecord( item );
	    callback( that.buffer );
	});
};

TempTable.prototype.findFirst = function(){
	if(this.records.length>0){
		this.currentRecordIndex=0;
		this.buffer.setCurrentRecord(this.records[0]);
	}else{
		this.currentRecordIndex=-1;
	}
	return this.buffer;
};

TempTable.prototype.findLast = function(){
	if(this.records.length>0){
		this.currentRecordIndex=this.records.length-1;
		this.buffer.setCurrentRecord(this.records[this.records.length-1]);
	}else {
		this.currentRecordIndex=-1;
	}
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
    var obj     = {};
    
    obj[ this.name ]    = this.records;
    
	return JSON.stringify( obj );
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

module.exports	= function( iDataset,iName,ttRecordArray,iMetaSchema ) {
    return new TempTable( iDataset,iName,ttRecordArray,iMetaSchema );
}