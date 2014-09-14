var BufferField     = require('./bufferfield.js'),
	debug			= require('debug'),
	log				= debug('n4p:buffer');

function Buffer(iTempTable,iMetaSchema){
	log( "Buffer create", iTempTable );
	this.currentRecord  = null;
	this.tempTable      = iTempTable;
	this.metaSchema     = iMetaSchema;	
	this.bufferField    = new BufferField();
    return this;
}

Buffer.prototype.setCurrentRecord = function(iCurrentRecord){
	log( "Buffer:setCurrentRecord" );
	
	this.currentRecord=iCurrentRecord;
};

Buffer.prototype.$ = function(fieldNm){
	log( "Buffer:$", fieldNm );

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
	/*
	this.currentRecord.some( function( rec, prop ) {
		if( prop.toLowerCase() == fieldNm ){
			this.bufferField.setCurrenBufferField( prop, this.currentRecord, this.metaSchema[prop] );
			return true;
		}
		return false;
	}, this );    
	return this.bufferField;
	*/
};

Buffer.prototype.display = function(iFieldToDisplay){
	log( "Buffer:display", iFieldToDisplay );
	var fields = iFieldToDisplay.split(" ");
	var fieldStr = "";
	for(var i=0;i<fields.length;i++){
		if(i>0){fieldStr+=" ";}
		fieldStr+=this.$(fields[i]).$("screenValue");
	}
	return fieldStr;
/*
	var fields      = iFieldToDisplay.split(" "),
	    fieldStr    = "";

    fields.forEach( function(field) {
        fieldStr && (fieldStr  += " ");
        fieldStr    += this.$( field ).$("screenvalue");
    }, this );

	return fieldStr;
	*/
};
Buffer.prototype.writeJson = function(){
	var jsonStr="";
	if(this.currentRecord){
		jsonStr=JSON.stringify(this.currentRecord);
	}
	return jsonStr;
};

module.exports	= function(iTempTable,iMetaSchema) {
    return new Buffer(iTempTable,iMetaSchema);
};