&ANALYZE-SUSPEND _VERSION-NUMBER AB_v10r12
&ANALYZE-RESUME
&ANALYZE-SUSPEND _UIB-CODE-BLOCK _CUSTOM _DEFINITIONS Procedure 
/*------------------------------------------------------------------------
    File        : handlers/CustomerHandler.p
    Purpose     :

    Syntax      :

    Description :

    Author(s)   : Frank Hilhorst
    Created     : 10/9/2013
    Notes       :
  ----------------------------------------------------------------------*/
/*          This .W file was created with the Progress AppBuilder.      */
/*----------------------------------------------------------------------*/

/* ***************************  Definitions  ************************** */

DEFINE TEMP-TABLE ttCustomer NO-UNDO LIKE Customer
       FIELD record_id AS RECID.
DEFINE DATASET dsCustomer FOR ttCustomer.

DEFINE INPUT  PARAMETER iInputPars AS LONGCHAR   NO-UNDO.
DEFINE OUTPUT PARAMETER oOutputPars AS LONGCHAR   NO-UNDO.
DEFINE OUTPUT PARAMETER DATASET FOR dsCustomer.
DEFINE OUTPUT PARAMETER oErrMsg AS CHARACTER   NO-UNDO.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME


&ANALYZE-SUSPEND _UIB-PREPROCESSOR-BLOCK 

/* ********************  Preprocessor Definitions  ******************** */

&Scoped-define PROCEDURE-TYPE Procedure
&Scoped-define DB-AWARE no



/* _UIB-PREPROCESSOR-BLOCK-END */
&ANALYZE-RESUME


/* ************************  Function Prototypes ********************** */

&IF DEFINED(EXCLUDE-GetParVal) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION-FORWARD GetParVal Procedure 
FUNCTION GetParVal RETURNS CHARACTER
  ( /* parameter-definitions */
      iParName AS CHAR,
      iNameValuePairStr AS LONGCHAR,
      iDelimiter AS CHAR )  FORWARD.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF


/* *********************** Procedure Settings ************************ */

&ANALYZE-SUSPEND _PROCEDURE-SETTINGS
/* Settings for THIS-PROCEDURE
   Type: Procedure
   Allow: 
   Frames: 0
   Add Fields to: Neither
   Other Settings: CODE-ONLY COMPILE
 */
&ANALYZE-RESUME _END-PROCEDURE-SETTINGS

/* *************************  Create Window  ************************** */

&ANALYZE-SUSPEND _CREATE-WINDOW
/* DESIGN Window definition (used by the UIB) 
  CREATE WINDOW Procedure ASSIGN
         HEIGHT             = 15
         WIDTH              = 60.
/* END WINDOW DEFINITION */
                                                                        */
&ANALYZE-RESUME

 


&ANALYZE-SUSPEND _UIB-CODE-BLOCK _CUSTOM _MAIN-BLOCK Procedure 


/* ***************************  Main Block  *************************** */

RUN processRequest.

DATASET dsCustomer:WRITE-XML("file","C:/temp/dsCustomer.xml",true).

ASSIGN oOutputPars = "Message from Frank".

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME


/* **********************  Internal Procedures  *********************** */

&IF DEFINED(EXCLUDE-processRequest) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _PROCEDURE processRequest Procedure 
PROCEDURE processRequest :
/*------------------------------------------------------------------------------
  Purpose:     
  Parameters:  <none>
  Notes:       
------------------------------------------------------------------------------*/
    DEFINE VARIABLE vNumCustomersToPull AS INTEGER     NO-UNDO.
    DEFINE VARIABLE vBatchNum AS INTEGER     NO-UNDO.
    DEFINE VARIABLE vCnt1 AS INTEGER     NO-UNDO.
    DEFINE VARIABLE vCnt2 AS INTEGER     NO-UNDO.
    DEFINE VARIABLE vStartRec AS INTEGER     NO-UNDO.
    DEFINE VARIABLE vInputPars AS CHARACTER   NO-UNDO.
    DEFINE VARIABLE vQueryOffEnd AS LOGICAL     NO-UNDO.

MESSAGE "iInputPars" STRING(iInputPars) SKIP
        "NumCustomersToPull" GetParVal("NumCustomersToPull",vInputPars,"&") SKIP
    VIEW-AS ALERT-BOX INFO BUTTONS OK.
/*     ASSIGN vInputPars = STRING(iInputPars)   /*SUBSTR(iInputPars,2)*/                */
/*            vNumCustomersToPull = INT(GetParVal("NumCustomersToPull",vInputPars,"&")) */
/*            vBatchNum  = INT(GetParVal("batchNum",vInputPars,"&"))                    */
/*            vStartRec  = MAX((vBatchNum - 1) * vNumCustomersToPull + 1,1)             */
/*            NO-ERROR.                                                                 */
           
    ASSIGN vNumCustomersToPull = INT(GetParVal("NumCustomersToPull",iInputPars,"&"))
           vBatchNum  = INT(GetParVal("batchNum",vInputPars,"&"))
           vStartRec  = MAX((vBatchNum - 1) * vNumCustomersToPull + 1,1)
           NO-ERROR.
    FOR EACH Customer NO-LOCK BREAK BY Customer.Cust-num:
        ASSIGN vCnt1 = vCnt1 + 1.
        IF vCnt1 <  vStartRec THEN NEXT.
        CREATE ttCustomer.
        BUFFER-COPY Customer TO ttCustomer
            ASSIGN ttCustomer.record_id = RECID(Customer).
        ASSIGN vCnt2 = vCnt2 + 1.
        IF LAST(Customer.Cust-num) THEN vQueryOffEnd = TRUE.
        IF vNumCustomersToPull > 0 AND vCnt2 >= vNumCustomersToPull 
            THEN LEAVE.
    END.
END PROCEDURE.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

/* ************************  Function Implementations ***************** */

&IF DEFINED(EXCLUDE-GetParVal) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION GetParVal Procedure 
FUNCTION GetParVal RETURNS CHARACTER
  ( /* parameter-definitions */
      iParName AS CHAR,
      iNameValuePairStr AS LONGCHAR,
      iDelimiter AS CHAR ) :
/*------------------------------------------------------------------------------
  Purpose:  
    Notes:  
------------------------------------------------------------------------------*/
  DEFINE VARIABLE vParVal AS CHARACTER   NO-UNDO.
  DEFINE VARIABLE i AS INTEGER     NO-UNDO.
  DEFINE VARIABLE j AS INTEGER     NO-UNDO.
  DEFINE VARIABLE vEntry AS CHARACTER   NO-UNDO.
  DO i = 1 TO NUM-ENTRIES(iNameValuePairStr,iDelimiter):
      ASSIGN vEntry = ENTRY(i,iNameValuePairStr,iDelimiter )
             j = INDEX(vEntry,"=").
      IF j > 0 AND TRIM(SUBSTR(vEntry,1,j - 1)) EQ iParName THEN
      DO:
          ASSIGN vParVal = TRIM(SUBSTR(vEntry,j + 1)).
          LEAVE.
      END.

  END.
  RETURN vParVal.   /* Function return value. */

END FUNCTION.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

