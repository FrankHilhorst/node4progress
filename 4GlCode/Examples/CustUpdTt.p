&ANALYZE-SUSPEND _VERSION-NUMBER AB_v10r12
&ANALYZE-RESUME
&ANALYZE-SUSPEND _UIB-CODE-BLOCK _CUSTOM _DEFINITIONS Procedure 
/*------------------------------------------------------------------------
    File        : CustUpd.p 
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
{Examples/CustUpdDs.i}

DEFINE INPUT  PARAMETER iMode AS CHARACTER   NO-UNDO.
DEFINE INPUT  PARAMETER iInputParameters AS CHARACTER   NO-UNDO.
DEFINE INPUT-OUTPUT PARAMETER TABLE FOR ttCustomer.
DEFINE OUTPUT PARAMETER oOutputPars AS CHARACTER   NO-UNDO.
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

&IF DEFINED(EXCLUDE-GetParameter) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION-FORWARD GetParameter Procedure 
FUNCTION GetParameter RETURNS CHARACTER
  ( /* parameter-definitions */ 
    iParName AS CHAR,
    iNamaValuePair AS CHAR,
    iDelimter AS CHAR)  FORWARD.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-NextCustNum) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION-FORWARD NextCustNum Procedure 
FUNCTION NextCustNum RETURNS INTEGER
  ( /* parameter-definitions */ )  FORWARD.

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

CASE iMode:
    WHEN "ADD" THEN RUN CustAdd.
    WHEN "UPDATE" THEN RUN CustUpdate.
    WHEN "DELETE" THEN RUN CustDelete.
    WHEN "GetCustomer" THEN RUN CustGet.
    WHEN "GetNextCustNum" THEN RUN GetNextCustNum.
END CASE.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME


/* **********************  Internal Procedures  *********************** */

&IF DEFINED(EXCLUDE-CustAdd) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _PROCEDURE CustAdd Procedure 
PROCEDURE CustAdd :
/*------------------------------------------------------------------------------
  Purpose:     
  Parameters:  <none>
  Notes:       
------------------------------------------------------------------------------*/
  FIND FIRST ttCustomer NO-ERROR.
  IF AVAIL ttCustomer THEN
  DO: 
      COMMIT:
      DO TRANSACTION ON ERROR UNDO, LEAVE: 
          ASSIGN ttCustomer.cust-num = NEXT-VALUE(next-cust-num).
          CREATE Customer.
          BUFFER-COPY ttCustomer TO Customer.
          ASSIGN oOutputPars = "Customer added".
          CATCH ErrObj AS PROGRESS.lang.ProError:
            ASSIGN oErrMsg = SUBST("(&1)->&2",ErrObj:getMessageNum(1),ErrObj:getMessage(1)).
          END.
      END.
  END.
  ELSE ASSIGN oErrMsg = "No customer data submitted for add". 
END PROCEDURE.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-CustDelete) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _PROCEDURE CustDelete Procedure 
PROCEDURE CustDelete :
/*------------------------------------------------------------------------------
  Purpose:     
  Parameters:  <none>
  Notes:       
------------------------------------------------------------------------------*/
    DEFINE VARIABLE vI AS INTEGER     NO-UNDO.
    COMMIT:
    DO TRANSACTION:
        FOR EACH ttCustomer:
            FIND Customer OF ttCustomer NO-LOCK NO-ERROR.
            IF AVAIL Customer THEN
            DO:
                FIND CURRENT Customer EXCLUSIVE-LOCK NO-WAIT NO-ERROR.
                IF NOT LOCKED Customer THEN
                DO:
                    DELETE Customer.
                    vI = vI + 1.
                END.
                ELSE DO:
                    oErrMsg = "Delete not executed because of a record lock on the customer table".
                    UNDO COMMIT, LEAVE COMMIT.
                END.
            END.
        END.
    END.
    ASSIGN oOutputPars = SUBST("&1 customers deleted",vI).


END PROCEDURE.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-CustGet) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _PROCEDURE CustGet Procedure 
PROCEDURE CustGet :
/*------------------------------------------------------------------------------
  Purpose:     
  Parameters:  <none>
  Notes:       
------------------------------------------------------------------------------*/
    DEFINE VARIABLE vCustNum AS INTEGER     NO-UNDO.
    DEFINE VARIABLE vCustNumFrom AS INTEGER     NO-UNDO.
    DEFINE VARIABLE vCustNumTo   AS INTEGER     NO-UNDO.

MESSAGE 'GetParameter("Mode", iInputParameters,"|")' GetParameter("Mode", iInputParameters,"|")  SKIP
    VIEW-AS ALERT-BOX INFO BUTTONS OK.
    IF GetParameter("Mode", iInputParameters,"|") EQ "FromTo" THEN
    DO:
        ASSIGN vCustNumFrom = INT(GetParameter("Cust-num-from", iInputParameters,"|"))
               vCustNumTo   = INT(GetParameter("Cust-num-to", iInputParameters,"|")).
MESSAGE "vCustNumFrom" vCustNumFrom SKIP
        " vCustNumTo"  vCustNumTo SKIP
    VIEW-AS ALERT-BOX INFO BUTTONS OK.
        FOR EACH Customer NO-LOCK 
            WHERE Customer.cust-num >=  vCustNumFrom
            AND Customer.cust-num <=  vCustNumTo:
            CREATE ttCustomer.
            BUFFER-COPY Customer TO ttCustomer. 
        END.
    END.
    ELSE DO:
        ASSIGN vCustNum = INT(GetParameter("Cust-num", iInputParameters,"|")).
        FIND Customer WHERE Customer.Cust-num EQ vCustNum NO-LOCK NO-ERROR.
        IF AVAIL Customer THEN
        DO:
            CREATE ttCustomer.
            BUFFER-COPY Customer TO ttCustomer. 
        END.
    END.
END PROCEDURE.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-CustUpdate) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _PROCEDURE CustUpdate Procedure 
PROCEDURE CustUpdate :
/*------------------------------------------------------------------------------
  Purpose:     
  Parameters:  <none>
  Notes:       
------------------------------------------------------------------------------*/
  FIND FIRST ttCustomer NO-ERROR.
  
  IF AVAIL ttCustomer THEN
  DO: 
      FIND Customer OF ttCustomer NO-LOCK NO-ERROR.
      IF AVAIL Customer THEN
      DO:
          COMMIT:
          DO TRANSACTION ON ERROR UNDO, LEAVE: 
              FIND CURRENT Customer EXCLUSIVE-LOCK NO-WAIT NO-ERROR.
              IF NOT LOCKED Customer THEN
              DO:
                  BUFFER-COPY ttCustomer TO Customer.
              END.
              ELSE oErrMsg = "Customer record locked". 
              CATCH ErrObj AS PROGRESS.lang.ProError:
                ASSIGN oErrMsg = SUBST("(&1)->&2",ErrObj:getMessageNum(1),ErrObj:getMessage(1)).
              END.
              FINALLY:
                IF oErrMsg EQ "" THEN ASSIGN oOutputPars = "Customer updated".
              END.
          END.

      END.
  END.
  ELSE ASSIGN oErrMsg = "No customer data submitted for add". 

END PROCEDURE.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-GetNextCustNum) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _PROCEDURE GetNextCustNum Procedure 
PROCEDURE GetNextCustNum :
/*------------------------------------------------------------------------------
  Purpose:     
  Parameters:  <none>
  Notes:       
------------------------------------------------------------------------------*/
    ASSIGN oOutputPars = SUBST("NextCustNum=&1",NextCustNum()).
END PROCEDURE.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

/* ************************  Function Implementations ***************** */

&IF DEFINED(EXCLUDE-GetParameter) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION GetParameter Procedure 
FUNCTION GetParameter RETURNS CHARACTER
  ( /* parameter-definitions */ 
    iParName AS CHAR,
    iNamaValuePair AS CHAR,
    iDelimter AS CHAR) :
/*------------------------------------------------------------------------------
  Purpose:  
    Notes:  
------------------------------------------------------------------------------*/
  DEFINE VARIABLE vParValue AS CHARACTER   NO-UNDO.
  DEFINE VARIABLE i AS INTEGER     NO-UNDO.
  DEFINE VARIABLE j AS INTEGER     NO-UNDO.
  DEFINE VARIABLE vEntry AS CHARACTER   NO-UNDO.
  DO i = 1 TO NUM-ENTRIES(iNamaValuePair,iDelimter):
     ASSIGN vEntry = ENTRY(i,iNamaValuePair,iDelimter)
            j = INDEX(vEntry,"=").
     IF j > 0 
        AND TRIM(SUBSTR(vEntry,1,j - 1)) EQ  iParName 
     THEN DO:
         ASSIGN  vParValue = TRIM(SUBSTR(vEntry,j + 1)).
         LEAVE.
     END.
  END.
  RETURN vParValue.   /* Function return value. */

END FUNCTION.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-NextCustNum) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION NextCustNum Procedure 
FUNCTION NextCustNum RETURNS INTEGER
  ( /* parameter-definitions */ ) :
/*------------------------------------------------------------------------------
  Purpose:  
    Notes:  
------------------------------------------------------------------------------*/

  RETURN NEXT-VALUE(Next-Cust-Num).   /* Function return value. */

END FUNCTION.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

