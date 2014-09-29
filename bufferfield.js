var moment      = require('moment'),
	debug		= require('debug'),
	numeral     = require('numeral')
	log			= debug('n4p:bufferfield');

function BufferField(iDateFormat){
	log( "BF create" );
    this.dateFormat     = "";
    if(iDateFormat.toLowerCase() === 'dd/mm'){
    	this.dateFormat="DD/MM";
    }else{
    	this.dateFormat="MM/DD";
    }
	this.currentRecord  = null;
	this.name           = "";
	this.value          = "";
	this.dataType       = "";
	this.initial        = "";
	this.format         = "";
	this.label          = "";
	this.metaSchema     = null;
}

BufferField.prototype.setCurrenBufferField  = function( iName, iCurrentRecord, iFieldMetaSchema ){
	log( "BF:setCurrentBufferField", iName );

	this.name           = iName;
	this.currentRecord  = iCurrentRecord;
	this.metaSchema     = iFieldMetaSchema;
	this.value          = this.currentRecord[ this.name ];
	this.dataType       = iFieldMetaSchema["dataType"];
	this.format         = iFieldMetaSchema["format"];
	this.initial        = iFieldMetaSchema["initial"];
	this.label          = iFieldMetaSchema["label"];	
};

BufferField.prototype.$ = function(iAttribute){
	log( "BF:$", iAttribute );

	var attrVal     = "";
	
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
	}

    return attrVal;
};

BufferField.prototype.bufferValue = function( iValue ) {
	log( "BF:bufferValue", this.name, iValue );
    var dateStr = "";
    var yr="";
    var month="";
    var day="";
	if( this.dataType.toLowerCase() === "date" ){
		if(iValue instanceof Date){
			yr=iValue.getFullYear();
			month=iValue.getMonth()+1;
			month=month.toString();
			if(month.length<=1){month="0"+month;}
			day=iValue.getDate();
			day=day.toString();
			if(day.length<=1){day="0"+day;}
			dateStr=yr+"-"+month+"-"+day;
		}else{
			dateStr=iValue;
		}
		this.currentRecord[this.name]	= moment(dateStr).format( "YYYY-MM-DD" );
	}else{
		this.currentRecord[this.name]   = iValue;
	}
};

BufferField.prototype.setAttr = function( iAttrNm, iValue ) {
	log( "BF:setAttr", iAttrNm, iValue );

	if(iAttrNm.toLowerCase() === "format"){
		this.metaSchema["format"]       = iValue;
	} else {
		throw new Error( 'Attribute "' + iAttrNm + '" cannot be set' );
	}
};

BufferField.prototype.formattedValue = function() {
	log( "BF:formattedValue" );

	var formattedValue = "",
		length = 0,
		i = 0;
	//formattedValue="";
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
				formattedValue=this.value+formattedValue;
			}
			break;
			
		case "integer":
		case "decimal":
			formattedValue=this.formattedValueNumber();
			break;
			
		case "date":
			formattedValue=this.formattedValueDate();
			break;
		case "datetime":
			formattedValue=this.formattedValueDateTime();
			break;
		case "datetime-tz":
			formattedValue=this.formattedValueDateTime();
			break;						
		default:
	    	formattedValue=this.value;
	    	break;
	}
    return formattedValue;
};

BufferField.prototype.formattedValueNumber = function(){
	log( "BF:formattedValueNumber" );

	var decimalPrecision    = 0,
	    numeralFormat       = "",
	    formattedValue      = "",
	    i                   = 0,
	    j                   = 0;
	    
	if( this.format.indexOf( ".", 0 ) >= 0 ){
        decimalPrecision    = this.format.length - this.format.toString().indexOf( '.' , 0 ) - 1;
	}
	
	if( decimalPrecision>0 ){
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

BufferField.prototype.formattedValueDateTime = function(){
	var formattedValue   = "";
	var dateStr="";
	var timeStr="";
	var amPmStr="";
	var timeZoneStr="";	
	var formatStr="";
	var formatStr=this.format.toLocaleLowerCase();
	var i=formatStr.indexOf(" ");
	//console.log("this.value"+this.value);
	if(i>0){dateStr=formatStr.substring(0,i);}
	timeStr=formatStr.substring(i+1,formatStr.length);
	if(timeStr.substring(timeStr.length-6,timeStr.length)==="+hh:mm"){
		timeZoneStr=" Z";
		timeStr=timeStr.substring(0,timeStr.length-6);
		timeStr=timeStr.trim();
	};
	if(timeStr.substring(timeStr.length-3,timeStr.length)===" am"){
		amPmStr=" a";
		timeStr=timeStr.substring(0,timeStr.length-3);
	}else{
		timeStr="HH:"+timeStr.substring(3,timeStr.length);
	};
	if(timeStr.substring(timeStr.length-4,timeStr.length)===".sss"){
		timeStr=timeStr.substring(0,timeStr.length-4)+".SSS";
	}	
	switch(dateStr){
		case "99/99/9999":
			dateStr=this.dateFormat+"/YYYY";
			break;	
		case "99/99/99":
			dateStr=this.dateFormat+"/YY";
			break;	
		case "99-99-9999":
			dateStr=this.dateFormat.replace("/","-")+"-YYYY";
			break;	
		case "99-99-99":
			dateStr=this.dateFormat.replace("/","-")+"-YY";
			break;				
	}	
	formatStr=dateStr;
	if(timeStr!==""){
		formatStr+=" ";
	}
	formatStr+=timeStr+amPmStr+timeZoneStr;
	//console.log("formatStr->"+formatStr);
	if(timeZoneStr!=""){
		formattedValue=moment(this.value).zone(this.value).format(formatStr);
	}else{
		formattedValue=moment(this.value).format(formatStr);
	}
	return formattedValue;
};

BufferField.prototype.formattedValueDate = function(){
	log( "BF:formattedValueDate" );
    var dateStr=this.format;
	switch(dateStr){
		case "99/99/9999":
			dateStr=this.dateFormat+"/YYYY";
			break;	
		case "99/99/99":
			dateStr=this.dateFormat+"/YY";
			break;	
		case "99-99-9999":
			dateStr=this.dateFormat.replace("/","-")+"-YYYY";
			break;	
		case "99-99-99":
			dateStr=this.dateFormat.replace("/","-")+"-YY";
			break;				
	}	
	return moment( this.value ).format(dateStr);
	//return moment( this.value ).format( (this.format == "99/99/99") ? this.dateFormat+"/YY" : this.dateFormat+"/YYYY" );
};

module.exports	= function(iDateFormat) {
    return new BufferField(iDateFormat);
};