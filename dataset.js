var TempTable       = require('./temptable.js');

function Dataset( iDatasetNm , iJsonObj ) {
	this.dataset	= null;
	this.metaSchema	= null;
	this.name		= "";
	this.rootName	= "";
	this.tempTables	= {};
	this.getDataset(iDatasetNm,iJsonObj);
	if( this.name === "" ){
		throw new Error( "Dataset " + iDatasetNm + " not found" );
	}
}

Dataset.prototype.$ = function(ttName){
	var targetTable     = null,
	    datasetContents = null,
	    ttNm            = "";

    ttName      = ttName.toLowerCase();
    
    this.dataset.some( function(item) {
		datasetContents = item;
		return true;
    });

    datasetContents.some( function( item, tt ) {
        if ( tt.toString().toLowerCase() == ttName ) {
			targetTable = datasetContents[tt];
			ttNm        = tt;
			return true;
        }
        return false;
    });
    
	if( !this.tempTables[ttNm] ){
		this.tempTables[ttNm]   = new TempTable( this, ttNm, targetTable, this.metaSchema[ttNm] );
	}
	
	return this.tempTables[ttNm];
};

Dataset.prototype.copyDataset = function(empty){
	var copyDatasetJsonObj = {},
	    copyDataset;

	copyDatasetJsonObj[ this.rootName ]     = JSON.parse( this.writeJson() );
    copyDatasetJsonObj[ this.rootName ][ this.name + "MetaSchema" ] = JSON.parse( JSON.stringify( this.metaSchema ) );
    
    copyDataset = new Dataset( this.name, copyDatasetJsonObj );

	if(empty){
		copyDataset.emptyDataset();		
	}

	return copyDataset;
};

Dataset.prototype.emptyDataset = function(){
    var that    = this;
    
    this.dataset[this.rootName].forEach( function( item, prop ) {
		that.$( prop ).emptyTemptable();
    });
};

Dataset.prototype.getDataset = function(iDatasetNm,iJsonObj){
	var prop,
	    prop2;
	    
	for(prop in iJsonObj){

		if( iJsonObj[ prop ][ iDatasetNm ] && iJsonObj[ prop ][ iDatasetNm + "MetaSchema" ] ) {
			this.dataset    = iJsonObj[ prop ];
			this.metaSchema = iJsonObj[ prop ][ iDatasetNm + "MetaSchema" ];
			this.name       = prop.toString();
			for(prop2 in this.dataset){
				this.rootName   = prop2;
				break;
			}
			break;
		}						

		if( typeof iJsonObj[ prop ] == "object" ){
			this.getDataset( iDatasetNm, iJsonObj[ prop ] );
		}
	}
};

Dataset.prototype.writeJson = function(){
	var writeJson   = "",
	    jsonObj     = {};
	
	if( this.dataset ){
		jsonObj[ this.rootName ]    = this.dataset[ this.rootName ];		
		writeJson                   = JSON.stringify( jsonObj );
	}
	return writeJson;
};

module.exports	= function( name, obj ) {
    return new Dataset( name, obj );
};