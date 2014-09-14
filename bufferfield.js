var moment      = require('moment'),
	debug		= require('debug'),
	numeral     = require('numeral')
	log			= debug('n4p:bufferfield');

function BufferField(){
	log( "BF create" );

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

	if( this.dataType.toLowerCase() === "date" ){
		this.currentRecord[this.name]	= moment( iValue ).format( "MM/DD/YYYY" );
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

BufferField.prototype.formattedValueNumber2 = function(){
	log( "BF:formattedValueNumber2" );

	var formattedValue  = this.value,
	    value           = this.value,
        str             = value.toString(),
	    char            = "";
	var i = 0;
	var j = 0;
	var k = 0;

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
	log( "BF:formattedValueDate" );

	return moment( this.value ).format( (this.format == "99/99/99") ? "DD/MM/YY" : "DD/MM/YYYY" );
};

BufferField.prototype.formattedValueDateTime = function(){
	log( "BF:formattedValueDateTime" );

	var day = "";
	var month = "";
	var year = "";
	var formattedValue = "";
	var valueTimeRemainder = "";
	var formatTimeRemainder = "";
	var amPm ="" ;
	var miliSeconds = "";
	if(typeof this.value === "string"){
		/*.. the stored format now is YYYY-MM-DDTHH:MM:SS.sss .......*/
		if(this.format.length>=10 && this.value.length>=10){
			var dateArray = this.value.substring(0,10).split("-");
			if(dateArray.length === 3){
				if(dateArray[1].length<2){dateArray[1]="0"+dateArray[1];}
				if(dateArray[2].length<2){dateArray[2]="0"+dateArray[2];}
				if(this.format.substring(0,10)==="99/99/9999"){
					formattedValue = dateArray[1] + "/" + dateArray[2] + "/" + dateArray[0];
					valueTimeRemainder=this.value.substring(11,this.format.length);
					formatTimeRemainder=this.format.substring(11,this.format.length);					
				} else if(this.format.substring(0,10)==="99/99/99"){
					formattedValue = dateArray[1] + "/" + dateArray[2] + "/" + dateArray[0].substring(2,4);
					valueTimeRemainder=this.value.substring(9,this.format.length);
					formatTimeRemainder=this.format.substring(9,this.format.length);
				} else if(this.format.substring(0,10)==="99-99-9999"){
					formattedValue = dateArray[1] + "-" + dateArray[2] + "-" + dateArray[0];					
					valueTimeRemainder=this.value.substring(11,this.format.length);
					formatTimeRemainder=this.format.substring(11,this.format.length);
				} else if(this.format.substring(0,10)==="99-99-99"){
					formattedValue = dateArray[1] + "-" + dateArray[2] + "-" + dateArray[0].substring(2,4);
					valueTimeRemainder=this.value.substring(9,this.format.length);
					formatTimeRemainder=this.format.substring(9,this.format.length);
				}
				var timeArray = valueTimeRemainder.substring(0,8).split(":");
				if(timeArray.length === 3){
					if(timeArray[0].length<2){timeArray[0]="0"+timeArray[0];}
					if(timeArray[1].length<2){timeArray[1]="0"+timeArray[1];}
					if(timeArray[2].length<2){timeArray[2]="0"+timeArray[2];}
					if(formatTimeRemainder.substring(formatTimeRemainder.length-2,formatTimeRemainder.length).toLowerCase()==="am"){
						if(timeArray[0]>=13){
							timeArray[0]=timeArray[0]-12;
							if(timeArray[0].length<2){timeArray[0]="0"+timeArray[0];}
							amPm=" PM";
						}else{
							amPm=" AM";
						}
						miliSeconds=this.value.substring(this.format.length-4,this.format.length);
					}
					formattedValue+=" "+timeArray[0]+":"+timeArray[1]+":"+timeArray[2]+"."+miliSeconds+amPm;
				}
			}			
		} 
	} else if(this.value instanceof "Date"){
		month = this.value.getMonth() + 1;
		if(month.length < 2){month = "0" + month;}
		day=this.value.getDate();
		if(day.length < 2){day = "0" + day;}
		year=this.value.getFullYear();
		if(this.format === "99/99/99"){
			formattedValue=month + "/" + day + "/" + year.substring(2, 4);
		}else if(this.format === "99/99/9999"){
			formattedValue=month + "/" + day + "/" + year;
		}
	}
	return formattedValue;
};

module.exports	= function() {
    return new BufferField();
};