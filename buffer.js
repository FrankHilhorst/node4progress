var BufferField     = require('./bufferfield.js');

function Buffer(iTempTable,iMetaSchema){
	this.currentRecord  = null;
	this.tempTable      = iTempTable;
	this.metaSchema     = iMetaSchema;	
	this.bufferField    = new BufferField();
}

Buffer.prototype.setCurrentRecord = function(iCurrentRecord){
	this.currentRecord=iCurrentRecord;
};

Buffer.prototype.$ = function(fieldNm){

	fieldNm     = fieldNm.toLowerCase();
	
	this.currentRecord.some( function( rec, prop ) {
		if( prop.toLowerCase() == fieldNm ){
			this.bufferField.setCurrenBufferField( prop, this.currentRecord, this.metaSchema[prop] );
			return true;
		}
		return false;
	}, this );

	return this.bufferField;
};

Buffer.prototype.display = function(iFieldToDisplay){
	var fields      = iFieldToDisplay.split(" "),
	    fieldStr    = "";

    fields.forEach( function(field) {
        fieldStr && (fieldStr  += " ");
        fieldStr    += this.$( field ).$("screenvalue");
    }, this );

	return fieldStr;
};

module.exports	= function() {
    return new Buffer();
};