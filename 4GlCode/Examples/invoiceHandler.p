&ANALYZE-SUSPEND _VERSION-NUMBER AB_v10r12
&ANALYZE-RESUME
&ANALYZE-SUSPEND _UIB-CODE-BLOCK _CUSTOM _DEFINITIONS Procedure 
/*------------------------------------------------------------------------
    File        : InvoiceHandler.p
    Purpose     :

    Syntax      :

    Description :

    Author(s)   :
    Created     :
    Notes       :
  ----------------------------------------------------------------------*/
/*          This .W file was created with the Progress AppBuilder.      */
/*----------------------------------------------------------------------*/

/* ***************************  Definitions  ************************** */

DEFINE TEMP-TABLE ttInvoice NO-UNDO LIKE Invoice.
DEFINE TEMP-TABLE ttInvoice-Note NO-UNDO LIKE Invoice-Note.

DEFINE DATASET dsInvoice FOR ttInvoice, ttInvoice-Note
    DATA-RELATION drInvoice FOR ttInvoice, ttInvoice-Note NESTED
    RELATION-FIELDS(Invoice-num,Invoice-num).

DEFINE INPUT  PARAMETER iInputPars AS LONGCHAR   NO-UNDO.
DEFINE OUTPUT PARAMETER oOutputPars AS LONGCHAR   NO-UNDO.
DEFINE OUTPUT PARAMETER DATASET FOR dsInvoice.
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
      iNameValuePairStr AS LONGCHAR )  FORWARD.

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
    DEFINE VARIABLE i AS INTEGER     NO-UNDO.
    DEFINE VARIABLE vNumInvoicesToPull AS INTEGER     NO-UNDO.

    ASSIGN vNumInvoicesToPull = INT(GetParVal("NumInvoicesToPull",iInputPars)) NO-ERROR.

    FOR EACH Invoice NO-LOCK
        BY Invoice.Invoice-num
        i = 1 TO vNumInvoicesToPull:
        CREATE ttInvoice.
        BUFFER-COPY Invoice TO ttInvoice.
        FOR EACH Invoice-Note OF Invoice NO-LOCK:
            CREATE ttInvoice-Note.
            BUFFER-COPY Invoice-Note TO ttInvoice-Note.
        END.
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
      iNameValuePairStr AS LONGCHAR ) :
/*------------------------------------------------------------------------------
  Purpose:  
    Notes:  
------------------------------------------------------------------------------*/
  DEFINE VARIABLE vParVal AS CHARACTER   NO-UNDO.
  DEFINE VARIABLE i AS INTEGER     NO-UNDO.
  DEFINE VARIABLE j AS INTEGER     NO-UNDO.
  DEFINE VARIABLE vEntry AS CHARACTER   NO-UNDO.
  DO i = 1 TO NUM-ENTRIES(iParName):
      ASSIGN vEntry = ENTRY(i,iNameValuePairStr )
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

