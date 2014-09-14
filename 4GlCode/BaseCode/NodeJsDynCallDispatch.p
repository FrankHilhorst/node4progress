&ANALYZE-SUSPEND _VERSION-NUMBER AB_v10r12
&ANALYZE-RESUME
&ANALYZE-SUSPEND _UIB-CODE-BLOCK _CUSTOM _DEFINITIONS Procedure 
/*------------------------------------------------------------------------
    File        : NodeJsDynCallDispatch.p
    Purpose     : Dispatch procedure to dynamically make any 
                  appserver call

    Syntax      :

    Description :

    Author(s)   :
    Created     :
    Notes       :
  ----------------------------------------------------------------------*/
/*          This .W file was created with the Progress AppBuilder.      */
/*----------------------------------------------------------------------*/

/* ***************************  Definitions  ************************** */

DEFINE INPUT PARAMETER iCallParameters AS LONGCHAR NO-UNDO.
DEFINE OUTPUT PARAMETER oDynCallPayload AS LONGCHAR   NO-UNDO.
DEFINE OUTPUT PARAMETER oErrMsg AS CHARACTER   NO-UNDO.

DEFINE VARIABLE hDatasetHandle     AS HANDLE      NO-UNDO. 
DEFINE VARIABLE hCallObj           AS HANDLE      NO-UNDO.
DEFINE VARIABLE vhTt               AS HANDLE      NO-UNDO.
DEFINE VARIABLE vhTtBuf            AS HANDLE      NO-UNDO.
DEFINE VARIABLE vLongchar          AS LONGCHAR    NO-UNDO EXTENT 50.
DEFINE VARIABLE vhnodeJsMetaSchema AS HANDLE      NO-UNDO.

/* Unsafe characters that must be encoded in URL's.  See RFC 1738 Sect 2.2. */
DEFINE VARIABLE url_unsafe   AS CHARACTER NO-UNDO 
    INITIAL " <>~"#%~{}|~\^~~[]`":U.

/* Reserved characters that normally are not encoded in URL's */
DEFINE VARIABLE url_reserved AS CHARACTER NO-UNDO 
    INITIAL "~;/?:@=&":U.


DEFINE TEMP-TABLE ttCallProgram NO-UNDO
    FIELD ProcName AS CHAR
    FIELD internalProcName AS CHAR
    FIELD IsPersistent AS LOG
    FIELD includeMetaSchema AS LOG INIT TRUE
    INDEX pr_u AS PRIMARY UNIQUE ProcName.

DEFINE TEMP-TABLE ttCallParameter NO-UNDO
    FIELD parIndex AS INT
    FIELD parDataType AS CHAR
    FIELD parIoMode AS CHAR
    FIELD parName AS CHAR
    FIELD parValue AS CHAR
    FIELD SchemaProvider AS CHAR
    INDEX pr_u AS PRIMARY UNIQUE parIndex.

DEFINE TEMP-TABLE ttLongcharChunk NO-UNDO
    FIELD parIndex AS INT
    FIELD chunkSeq AS INT
    FIELD chunkChar AS CHAR
    INDEX pr_u AS PRIMARY UNIQUE parIndex chunkSeq.

DEFINE DATASET dsCallStack FOR ttCallProgram,ttCallParameter, ttLongcharChunk.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME


&ANALYZE-SUSPEND _UIB-PREPROCESSOR-BLOCK 

/* ********************  Preprocessor Definitions  ******************** */

&Scoped-define PROCEDURE-TYPE Procedure
&Scoped-define DB-AWARE no



/* _UIB-PREPROCESSOR-BLOCK-END */
&ANALYZE-RESUME


/* ************************  Function Prototypes ********************** */

&IF DEFINED(EXCLUDE-bu_getDatasetOutputJson) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION-FORWARD bu_getDatasetOutputJson Procedure 
FUNCTION bu_getDatasetOutputJson RETURNS LONGCHAR
  ( /* parameter-definitions */
      iParName AS CHAR,
      iDatasetHandle AS HANDLE,
      iIncludeMetaSchema AS LOGICAL)  FORWARD.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-bu_getMetaSchemaBufferField) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION-FORWARD bu_getMetaSchemaBufferField Procedure 
FUNCTION bu_getMetaSchemaBufferField RETURNS CHARACTER
  ( /* parameter-definitions */ 
      ihBufField AS HANDLE)  FORWARD.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-bu_getMetaSchemaDataset) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION-FORWARD bu_getMetaSchemaDataset Procedure 
FUNCTION bu_getMetaSchemaDataset RETURNS LONGCHAR
  ( /* parameter-definitions */ 
     ihDataset AS HANDLE)  FORWARD.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-bu_getMetaSchemaTable) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION-FORWARD bu_getMetaSchemaTable Procedure 
FUNCTION bu_getMetaSchemaTable RETURNS LONGCHAR
  ( /* parameter-definitions */
      ihTable AS HANDLE )  FORWARD.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-formatDateTimeTzVal) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION-FORWARD formatDateTimeTzVal Procedure 
FUNCTION formatDateTimeTzVal RETURNS CHARACTER
    ( /* parameter-definitions */
        iUnformattedDatatimeTzVal AS CHAR )  FORWARD.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-formatDateTimeVal) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION-FORWARD formatDateTimeVal Procedure 
FUNCTION formatDateTimeVal RETURNS CHARACTER
  ( /* parameter-definitions */
      iUnformattedDatatimeVal AS CHAR )  FORWARD.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-formatDateVal) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION-FORWARD formatDateVal Procedure 
FUNCTION formatDateVal RETURNS CHARACTER
  ( /* parameter-definitions */ 
      iUnformattedDateVal AS CHAR)  FORWARD.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-getLongCharVal) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION-FORWARD getLongCharVal Procedure 
FUNCTION getLongCharVal RETURNS LONGCHAR
  ( /* parameter-definitions */ 
      iParIndex AS INT)  FORWARD.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-getNumParameters) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION-FORWARD getNumParameters Procedure 
FUNCTION getNumParameters RETURNS INTEGER
  ( /* parameter-definitions */ )  FORWARD.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-getTrunkatedProgramNm) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION-FORWARD getTrunkatedProgramNm Procedure 
FUNCTION getTrunkatedProgramNm RETURNS CHARACTER
  ( /* parameter-definitions */ 
     iFullProgramNm AS CHAR )  FORWARD.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-IsSchemaRequest) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION-FORWARD IsSchemaRequest Procedure 
FUNCTION IsSchemaRequest RETURNS LOGICAL
  ( /* parameter-definitions */ )  FORWARD.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-JsonEncode) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION-FORWARD JsonEncode Procedure 
FUNCTION JsonEncode RETURNS LONGCHAR
  ( /* parameter-definitions */ 
     iStringToEncode AS LONGCHAR,
     iCharToEscape AS CHAR)  FORWARD.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-url-encode) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION-FORWARD url-encode Procedure 
FUNCTION url-encode RETURNS CHARACTER
    (INPUT p_value AS CHARACTER,
     INPUT p_enctype AS CHARACTER)  FORWARD.

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
         WIDTH              = 89.8.
/* END WINDOW DEFINITION */
                                                                        */
&ANALYZE-RESUME

 


&ANALYZE-SUSPEND _UIB-CODE-BLOCK _CUSTOM _MAIN-BLOCK Procedure 


/* ***************************  Main Block  *************************** */

DATASET dsCallStack:READ-JSON("LONGCHAR",iCallParameters,"EMPTY") NO-ERROR.
RUN  nodeJsMetaSchema.p PERSISTENT SET vhNodeJsMetaSchema.
IF ERROR-STATUS:ERROR EQ TRUE 
    THEN oErrMsg = SUBST("ERROR(&1)->&2",ERROR-STATUS:GET-NUMBER(1),ERROR-STATUS:GET-MESSAGE(1)). 

IF IsSchemaRequest()
    THEN RUN ProcessSchemaRequest.
    ELSE RUN ProcessAppserverCall.

IF oErrMsg EQ "" 
    THEN RUN createOutputJsonMsg.
    ELSE ASSIGN oDynCallPayload = '""'.


DELETE OBJECT vhTt NO-ERROR.
DELETE OBJECT hCallObj NO-ERROR.
DELETE OBJECT vhNodeJsMetaSchema NO-ERROR.
ASSIGN vhTt = ? hCallObj = ? vhNodeJsMetaSchema = ?.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME


/* **********************  Internal Procedures  *********************** */

&IF DEFINED(EXCLUDE-createOutputJsonMsg) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _PROCEDURE createOutputJsonMsg Procedure 
PROCEDURE createOutputJsonMsg :
/*------------------------------------------------------------------------------
  Purpose:     
  Parameters:  <none>
  Notes:       
------------------------------------------------------------------------------*/
    DEFINE VARIABLE vLongCharOutput AS LONGCHAR   NO-UNDO.
    DEFINE VARIABLE vhBufferField   AS HANDLE      NO-UNDO.
    DEFINE VARIABLE vMemptr         AS MEMPTR      NO-UNDO.
    DEFINE VARIABLE vDataHandle     AS HANDLE      NO-UNDO.
    DEFINE VARIABLE vI              AS INTEGER     NO-UNDO.
    FIND FIRST ttCallProgram NO-ERROR.
    ASSIGN oDynCallPayload = "~{~n".
    FOR EACH ttCallParameter
        WHERE ttCallParameter.parIoMode MATCHES "*OUTPUT*"
        BREAK BY ttCallParameter.parIndex
        WHILE oErrMsg EQ "":
        IF ttCallParameter.parDataType NE "LONGCHAR" THEN
        DO:
            ASSIGN vhBufferField = vhTtBuf:BUFFER-FIELD(ttCallParameter.parName) NO-ERROR.
            IF ERROR-STATUS:ERROR 
                THEN ASSIGN oErrMsg = SUBST('Error occurred while retrieving output for parameter "&1"~n' +
                                            '   ERROR(&2)->&3',
                                            ttCallParameter.parName,
                                            ERROR-STATUS:GET-NUMBER(1),
                                            ERROR-STATUS:GET-MESSAGE(1)).
                ELSE IF NOT VALID-HANDLE(vhBufferField) 
                    THEN ASSIGN oErrMsg = SUBST('Error occurred while retrieving output for parameter "&1"~n',
                                            ttCallParameter.parName).
        END.
        IF oErrMsg EQ "" THEN
        DO:
            CASE  ttCallParameter.parDataType:
                WHEN 'CHARACTER' 
                    THEN ASSIGN oDynCallPayload  =  
                                    oDynCallPayload  + SUBST('   "&1" : "&2"',ttCallParameter.parName,JsonEncode(vhBufferField:BUFFER-VALUE,'"')).
                WHEN 'DATE' 
                    OR WHEN 'DATETIME'
                    OR WHEN 'DATETIME-TZ'
                    OR WHEN 'DECIMAL'
                    OR WHEN 'INTEGER'
                    OR WHEN 'INT64'
                    OR WHEN 'ROWID'
                    OR WHEN 'LOGICAL'
                    THEN ASSIGN oDynCallPayload  =  
                                     oDynCallPayload  + SUBST('   "&1" : "&2"',ttCallParameter.parName,vhBufferField:BUFFER-VALUE).
                WHEN 'LONGCHAR'
                    THEN ASSIGN oDynCallPayload  =  
                                     oDynCallPayload  + SUBST('   "&1" : "&2"',ttCallParameter.parName,JsonEncode(vLongchar[ttCallParameter.parIndex],'"')).
                WHEN 'DATASET-HANDLE' THEN
                DO:
                    ASSIGN vDataHandle = vhBufferField:BUFFER-VALUE
                           oDynCallPayload  =
                                   oDynCallPayload  + DYNAMIC-FUNCTION("getDatasetOutputJson" IN vhNodeJsMetaSchema,
                                                                       ttCallParameter.ParName,vDataHandle,(AVAIL ttCallProgram AND ttCallProgram.includeMetaschema)).
                END.
                /*WHEN 'DATASET-HANDLE' OR */
                WHEN 'TABLE-HANDLE' THEN
                DO:
                      ASSIGN vDataHandle = vhBufferField:BUFFER-VALUE.
                      IF VALID-HANDLE(vDataHandle) AND LOOKUP(vDataHandle:TYPE,'DATASET,TEMP-TABLE') > 0 THEN
                      DO:
                          IF vDataHandle:TYPE EQ "DATASET" 
                              AND AVAIL ttCallProgram 
                              AND ttCallProgram.includeMetaschema  THEN
                          DO vI = 1 TO vDataHandle:NUM-RELATIONS:
                              vDataHandle:GET-RELATION(vI):NESTED = FALSE.
                          END.
                          vDataHandle:WRITE-JSON("LONGCHAR",vLongCharOutput,FALSE) NO-ERROR.
                          IF ERROR-STATUS:ERROR 
                              THEN ASSIGN oErrMsg = SUBST('Error occurred while retrieving output for parameter "&1"~n' +
                                                          '   ERROR(&2)->&3',
                                                          ttCallParameter.parName,
                                                          ERROR-STATUS:GET-NUMBER(1),
                                                          ERROR-STATUS:GET-MESSAGE(1)).
                              ELSE IF AVAIL ttCallProgram 
                                      AND ttCallProgram.includeMetaschema THEN
                              DO:
                                  IF ttCallParameter.parDataType EQ "DATASET-HANDLE" THEN
                                  DO:
                                      ASSIGN vLongCharOutput = TRIM(vLongCharOutput).
                                      IF  vLongCharOutput MATCHES "*~{}}" THEN
                                      DO:
                                          ASSIGN vLongCharOutput = SUBSTR(vLongCharOutput,1,LENGTH(vLongCharOutput) - 2).
                                          DO vI = 1 TO vDataHandle:NUM-BUFFERS:
                                             ASSIGN vLongCharOutput = vLongCharOutput + SUBST('"&1" : []&2',
                                                                                              vDataHandle:GET-BUFFER-HANDLE(vI):NAME,
                                                                                              IF vI < vDataHandle:NUM-BUFFERS THEN "," ELSE "").
                                          END.
                                          ASSIGN vLongCharOutput = vLongCharOutput + "}".
                                      END.
                                      ASSIGN vLongCharOutput = vLongCharOutput + ",~n" + DYNAMIC-FUNCTION("getMetaSchemaDataset" IN vhNodeJsMetaSchema,vDataHandle).

                                  END.
                                  ELSE IF ttCallParameter.parDataType EQ "TABLE-HANDLE"
                                      THEN ASSIGN vLongCharOutput = vLongCharOutput + "," + DYNAMIC-FUNCTION("getMetaSchemaTable" IN vhNodeJsMetaSchema,vDataHandle:DEFAULT-BUFFER-HANDLE).
                              END.                
                      END.
                      ELSE ASSIGN oErrMsg = SUBST('&1 handle could not be retrieved for parameter "&2"',
                                                  ttCallParameter.parDataType,
                                                  ttCallParameter.parName).

                      IF oErrMsg EQ "" THEN
                      DO:
                            IF vLongCharOutput EQ "" OR vLongCharOutput EQ ? 
                                THEN vLongCharOutput = '~{}'.
                            ASSIGN oDynCallPayload  =  
                                     oDynCallPayload  + SUBST('   "&1" : ',ttCallParameter.parName) + vLongCharOutput.
                                     /*oDynCallPayload  + SUBST('   "&1" : &2',ttCallParameter.parName,vLongCharOutput).*/
                      END.
                END.
                WHEN 'RAW' THEN
                DO:
                    SET-SIZE(vMemptr) = LENGTH(vhBufferField:BUFFER-VALUE).
                    PUT-BYTES(vMemptr,1) = vhBufferField:BUFFER-VALUE.
                    ASSIGN vLongCharOutput = BASE64-ENCODE(vMemptr).
                    ASSIGN oDynCallPayload  =  
                             oDynCallPayload  + SUBST('   "&1" : "&2"',ttCallParameter.parName,vLongCharOutput).
                    SET-SIZE(vMemptr) = 0.
                    ASSIGN vMemptr = ?.                                   
                END.
            END CASE.
            IF NOT LAST(ttCallParameter.parIndex) 
                THEN ASSIGN oDynCallPayload  =  oDynCallPayload  + ",".
             ASSIGN oDynCallPayload  =  oDynCallPayload  + "~n".
        END.
    END.
    ASSIGN oDynCallPayload  =  oDynCallPayload  + "}~n".
END PROCEDURE.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-InitializeValueTempTable) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _PROCEDURE InitializeValueTempTable Procedure 
PROCEDURE InitializeValueTempTable :
/*------------------------------------------------------------------------------
  Purpose:     
  Parameters:  <none>
  Notes:       
------------------------------------------------------------------------------*/
    DEFINE BUFFER ttCallParameter FOR ttCallParameter.

    CREATE TEMP-TABLE vhTt.
    FOR EACH ttCallParameter BY ttCallParameter.ParIndex:
        CASE ttCallParameter.parDataType:
            WHEN "DATASET-HANDLE" 
                OR WHEN "TABLE-HANDLE"
                THEN vhTt:ADD-NEW-FIELD(ttCallParameter.parName,"HANDLE") NO-ERROR.
            OTHERWISE DO:
                IF ttCallParameter.parDataType NE "LONGCHAR" 
                    THEN vhTt:ADD-NEW-FIELD(ttCallParameter.parName,ttCallParameter.parDataType) NO-ERROR.
            END.
        END CASE.
        IF ERROR-STATUS:ERROR THEN
        DO:
            ASSIGN oErrMsg = SUBST('Invalid data type "&1" defined for parameter "&2~n"' +
                                   '   ERROR(&3)->&4',
                                    ttCallParameter.parDataType,
                                    ttCallParameter.parName,
                                    ERROR-STATUS:GET-NUMBER(1),
                                    ERROR-STATUS:GET-MESSAGE(1)).
            LEAVE.
        END.
    END.
    vhTt:TEMP-TABLE-PREPARE("ttValues").
    vhTtBuf = vhTt:DEFAULT-BUFFER-HANDLE.
    vhTtBuf:BUFFER-CREATE().
    vhTtBuf:FIND-FIRST().
END PROCEDURE.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-PrepareCallObj) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _PROCEDURE PrepareCallObj Procedure 
PROCEDURE PrepareCallObj :
/*------------------------------------------------------------------------------
  Purpose:     
  Parameters:  <none>
  Notes:       
------------------------------------------------------------------------------*/
    DEFINE VARIABLE vHandle AS HANDLE      NO-UNDO.
    DEFINE VARIABLE vProcName AS CHARACTER   NO-UNDO.
    DEFINE VARIABLE vParCnt AS INTEGER     NO-UNDO.
    DEFINE VARIABLE vParNum AS INTEGER     NO-UNDO.

    IF oErrMsg EQ "" THEN
    DO:
        FIND FIRST ttCallProgram NO-ERROR.
        IF NOT AVAIL ttCallProgram 
           THEN oErrMsg = "No program name was passed to call".
           ELSE DO:
               FIND ttCallProgram WHERE ttCallProgram.ProcName NE "" NO-ERROR.
               IF AMBIGUOUS ttCallProgram
                  THEN oErrMsg = "You cannot make more than one program call in one appserver round trip".
           END.
    END. /*IF oErrMsg EQ "" THEN*/
    IF oErrMsg EQ "" THEN
    DO:
        ASSIGN vProcName = getTrunkatedProgramNm(ttCallProgram.ProcName).
        IF SEARCH(vProcName + ".p") EQ ? AND SEARCH(vProcName + ".r") EQ ? 
            THEN oErrMsg = SUBST("Program &1 not found in the propath of the appserver",ttCallProgram.ProcName).
    END.
    IF ttCallProgram.isPersistent AND ( ttCallProgram.internalProcName EQ "" OR ttCallProgram.internalProcName EQ ?)
        THEN oErrMsg = SUBST("You requested to run &1 persistent but no internal procedure name was provided to run.",ttCallProgram.ProcName).
    IF oErrMsg EQ "" THEN
    DO:
        CREATE CALL hCallObj.
        ASSIGN hCallObj:CALL-NAME = vProcName + ".p"
               hCallObj:NUM-PARAMETERS = getNumParameters().
        IF ttCallProgram.IsPersistent THEN
        DO:
            hCallObj:INVOKE().
            hCallObj:NAME = ttCallProgram.internalProcName.
        END. /*IF ttCallProgram.IsPersistent THEN*/
        vParCnt = 0.
        FOR EACH ttCallParameter: vParCnt = vParCnt + 1. END.
        vParNum = 0.
        FOR EACH ttCallParameter BY ttCallParameter.parIndex
            WHILE oErrMsg EQ "":
            ASSIGN vParNum = vParNum + 1.
            IF LOOKUP(ttCallParameter.parIoMode,"INPUT,OUTPUT,INPUT-OUTPUT,OUTPUT-APPEND") > 0 THEN
            DO:
                CASE ttCallParameter.parDataType:
                    WHEN "CHARACTER" 
                        OR WHEN "DATE"
                        OR WHEN "DATETIME"
                        OR WHEN "DATETIME-TZ"
                        OR WHEN "DECIMAL"
                        OR WHEN "INTEGER"
                        OR WHEN "INT64"
                        OR WHEN "LOGICAL"
                        OR WHEN "RAW"
                        OR WHEN "ROWID"
                        THEN RUN PrepareCallObj-standard (INPUT vParNum, INPUT-OUTPUT hCallObj,BUFFER ttCallParameter,OUTPUT oErrMsg).
                    WHEN "LONGCHAR" 
                        THEN RUN PrepareCallObj-Longchar (INPUT vParNum, INPUT-OUTPUT hCallObj,BUFFER ttCallParameter,OUTPUT oErrMsg).
                    WHEN "DATASET-HANDLE" 
                        THEN RUN PrepareCallObj-DatasetHandle (INPUT vParNum, INPUT-OUTPUT hCallObj,BUFFER ttCallParameter,OUTPUT oErrMsg).
                    WHEN "TABLE-HANDLE" 
                        THEN RUN PrepareCallObj-TableHandle (INPUT vParNum, INPUT-OUTPUT hCallObj,BUFFER ttCallParameter,OUTPUT oErrMsg).
                    OTHERWISE DO:
                        ASSIGN oErrMsg = SUBST("Parameter type '&1' for parameter &2 not supported",ttCallParameter.parDataType,ttCallParameter.parIndex).
                    END.
                END CASE.
            END.
        END. /*FOR EACH ttCallParameter BY ttCallParameter.parIndex:*/
    END.
END PROCEDURE.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-PrepareCallObj-DatasetHandle) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _PROCEDURE PrepareCallObj-DatasetHandle Procedure 
PROCEDURE PrepareCallObj-DatasetHandle :
/*------------------------------------------------------------------------------
  Purpose:     
  Parameters:  <none>
  Notes:       
------------------------------------------------------------------------------*/
    DEFINE INPUT  PARAMETER iParNum AS INTEGER     NO-UNDO.
    DEFINE INPUT-OUTPUT  PARAMETER ioCallObj AS HANDLE      NO-UNDO.
    DEFINE PARAMETER BUFFER ttCallParameter FOR ttCallParameter.
    DEFINE OUTPUT PARAMETER oErrMsg AS CHARACTER   NO-UNDO.
     
    DEFINE VARIABLE vHandle AS HANDLE      NO-UNDO.
    DEFINE VARIABLE vProcNm AS CHARACTER   NO-UNDO.
    DEFINE VARIABLE vInput AS LONGCHAR   NO-UNDO.
    DEFINE VARIABLE vhBufferField AS HANDLE      NO-UNDO.
    DEFINE VARIABLE vDatasetHandle AS HANDLE      NO-UNDO.
    ASSIGN vhBufferField = vhTtBuf:BUFFER-FIELD(ttCallParameter.parName) NO-ERROR.
    IF ERROR-STATUS:ERROR 
        THEN ASSIGN oErrMsg = SUBST('Failed to get buffer-field handle for parameter "&1"~n' +
                                    '   ERROR(&2)->&3',
                                    ttCallParameter.parName,
                                    ERROR-STATUS:GET-NUMBER(1),
                                    ERROR-STATUS:GET-MESSAGE(1)).
        ELSE IF NOT VALID-HANDLE(vhBufferField)
             THEN ASSIGN oErrMsg = SUBST('Failed to get buffer-field handle for parameter "&1"~n', 
                                   ttCallParameter.parName).
    IF oErrMsg EQ "" THEN
    DO:

        IF ttCallParameter.parIoMode EQ "INPUT"
           OR ttCallParameter.parIoMode EQ "INPUT-OUTPUT"  
           OR ttCallParameter.parIoMode MATCHES "*APPEND" THEN
        DO:
            IF ttCallParameter.SchemaProvider NE "" THEN
            DO:
                ASSIGN vProcNm = getTrunkatedProgramNm(ttCallParameter.SchemaProvider).
                IF SEARCH(vProcNm + ".p") EQ ? AND SEARCH(vProcNm + ".r") EQ ?
                    THEN ASSIGN oErrMsg = SUBST("Dataset Template provider '&1' for parameter &2 not found in the propath of the appserver",
                                                ttCallParameter.SchemaProvider,
                                                ttCallParameter.parIndex). 
            END.
            ELSE ASSIGN oErrMsg = SUBST("For &1 dataset-handle parameter &2 a valid template handler must be provided",
                                        ttCallParameter.parIoMode,
                                        ttCallParameter.parIndex). 
            IF oErrMsg EQ "" THEN
            DO:
                 
                 IF oErrMsg EQ "" THEN
                 DO:
                     ASSIGN  vDatasetHandle = vhBufferField:BUFFER-VALUE.
                     RUN VALUE(vProcNm + ".p") (OUTPUT DATASET-HANDLE vDatasetHandle) NO-ERROR.
                     IF ERROR-STATUS:ERROR 
                         THEN ASSIGN oErrMsg = SUBST("Error occured running dataset schema provider &1 for parameter &2~nERROR(&3)-> &4",
                                                     ttCallParameter.SchemaProvider,
                                                     ttCallParameter.parIndex,
                                                     ERROR-STATUS:GET-NUMBER(1),
                                                     ERROR-STATUS:GET-MESSAGE(1)).

                 END. /*IF oErrMsg EQ "" THEN*/
            END. /*IF oErrMsg EQ "" THEN*/    
            IF oErrMsg EQ "" THEN
            DO:
                ASSIGN  vInput = getLongCharVal(ttCallParameter.parIndex).
                IF vInput NE "" AND vInput NE ? THEN
                DO:
                   vDatasetHandle:READ-JSON("LONGCHAR",vInput) NO-ERROR.
                   vhBufferField:BUFFER-VALUE = vDatasetHandle.
                   IF ERROR-STATUS:ERROR 
                       THEN ASSIGN oErrMsg = SUBST("Error occured loading input for parameter &1~nERROR(&2)-> &3",
                                                   ttCallParameter.parName,
                                                   ERROR-STATUS:GET-NUMBER(1),
                                                   ERROR-STATUS:GET-MESSAGE(1)).

                END.
            END.
        END. /*IF ttCallParameter.parIoMode EQ "INPUT"*/
    END. /*IF oErrMsg EQ "" THEN*/
    IF oErrMsg EQ "" THEN
    DO:
        hCallObj:SET-PARAMETER(iParNum,ttCallParameter.parDataType,ttCallParameter.parIoMode,vhBufferField:BUFFER-VALUE) NO-ERROR.
        IF ERROR-STATUS:ERROR 
            THEN ASSIGN oErrMsg = SUBST('Error occurred in hCallObj:SET-PARAMETER of parameter "&1"~n' +
                                        '     ERROR(&2)->&3',
                                         ttCallParameter.parName,
                                         ERROR-STATUS:GET-NUMBER(1),
                                         ERROR-STATUS:GET-MESSAGE(1)).
    END.
END PROCEDURE.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-PrepareCallObj-Longchar) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _PROCEDURE PrepareCallObj-Longchar Procedure 
PROCEDURE PrepareCallObj-Longchar :
/*------------------------------------------------------------------------------
  Purpose:     
  Parameters:  <none>
  Notes:       
------------------------------------------------------------------------------*/
    DEFINE INPUT  PARAMETER iParNum AS INTEGER     NO-UNDO.
    DEFINE INPUT-OUTPUT  PARAMETER ioCallObj AS HANDLE      NO-UNDO.
    DEFINE PARAMETER BUFFER ttCallParameter FOR ttCallParameter.
    DEFINE OUTPUT PARAMETER oErrMsg AS CHARACTER   NO-UNDO.
    IF LOOKUP(ttCallParameter.parIoMode,"INPUT,INPUT-OUTPUT") > 0 
    THEN DO:
        ASSIGN vLongchar[ttCallParameter.parIndex] = getLongCharVal(ttCallParameter.parIndex).
    END.
    IF oErrMsg EQ "" THEN
    DO:
        hCallObj:SET-PARAMETER(iParNum,ttCallParameter.parDataType,ttCallParameter.parIoMode,vLongchar[ttCallParameter.parIndex]) NO-ERROR.
        IF ERROR-STATUS:ERROR 
            THEN ASSIGN oErrMsg = SUBST('Error occurred in hCallObj:SET-PARAMETER of parameter "&1"~n' +
                                        '     ERROR(&2)->&3',
                                         ttCallParameter.parName,
                                         ERROR-STATUS:GET-NUMBER(1),
                                         ERROR-STATUS:GET-MESSAGE(1)).
    END.

END PROCEDURE.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-PrepareCallObj-Standard) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _PROCEDURE PrepareCallObj-Standard Procedure 
PROCEDURE PrepareCallObj-Standard :
/*------------------------------------------------------------------------------
  Purpose:     
  Parameters:  <none>
  Notes:       
------------------------------------------------------------------------------*/
    DEFINE INPUT  PARAMETER iParNum AS INTEGER     NO-UNDO.
    DEFINE INPUT-OUTPUT  PARAMETER ioCallObj AS HANDLE      NO-UNDO.
    DEFINE PARAMETER BUFFER ttCallParameter FOR ttCallParameter.
    DEFINE OUTPUT PARAMETER oErrMsg AS CHARACTER   NO-UNDO.
    DEFINE VARIABLE vMemptr AS MEMPTR   NO-UNDO.
    DEFINE VARIABLE vhBufferField AS HANDLE      NO-UNDO.
    DEFINE VARIABLE vRaw AS RAW       NO-UNDO.
    ASSIGN vhBufferField = vhTtBuf:BUFFER-FIELD(ttCallParameter.parName) NO-ERROR.
    IF ERROR-STATUS:ERROR 
        THEN ASSIGN oErrMsg = SUBST('Failed to get buffer-field handle for parameter "&1"~n' +
                                    '   ERROR(&2)->&3',
                                    ttCallParameter.parName,
                                    ERROR-STATUS:GET-NUMBER(1),
                                    ERROR-STATUS:GET-MESSAGE(1)).
        ELSE IF NOT VALID-HANDLE(vhBufferField)
             THEN ASSIGN oErrMsg = SUBST('Failed to get buffer-field handle for parameter "&1"~n', 
                                   ttCallParameter.parName).

    IF oErrMsg EQ "" THEN
    DO:
        IF LOOKUP(ttCallParameter.parIoMode,"INPUT,INPUT-OUTPUT") > 0 
            OR ttCallParameter.parIoMode MATCHES "*APPEND" 
        THEN DO:
            
            CASE ttCallParameter.parDatatype:
                WHEN "character" THEN  ASSIGN vhBufferField:BUFFER-VALUE = ttCallParameter.parValue NO-ERROR.
                WHEN "Date" THEN  ASSIGN vhBufferField:BUFFER-VALUE = DATE(formatDateVal(ttCallParameter.parValue)) NO-ERROR.
                WHEN "DateTime" THEN  ASSIGN vhBufferField:BUFFER-VALUE = DATETIME(formatDateTimeVal(ttCallParameter.parValue)) NO-ERROR.
                WHEN "DateTime-tz" THEN  ASSIGN vhBufferField:BUFFER-VALUE = DATETIME(formatDateTimeTzVal(ttCallParameter.parValue)) NO-ERROR.
                WHEN "Decimal" THEN  ASSIGN vhBufferField:BUFFER-VALUE = DECIMAL(ttCallParameter.parValue) NO-ERROR.
                WHEN "integer" THEN  ASSIGN vhBufferField:BUFFER-VALUE = INTEGER(ttCallParameter.parValue) NO-ERROR.
                WHEN "int64" THEN  ASSIGN vhBufferField:BUFFER-VALUE = INT64(ttCallParameter.parValue) NO-ERROR.
                WHEN "logical" THEN  ASSIGN vhBufferField:BUFFER-VALUE = LOOKUP(ttCallParameter.parValue,"yes,true") > 0 NO-ERROR.
                WHEN "raw" THEN  
                DO:
                    ASSIGN vMemptr = BASE64-DECODE(ttCallParameter.parValue).
                    PUT-BYTES(vRaw,1) = vMemptr.
                    vhBufferField:BUFFER-VALUE = vRaw.
                    SET-SIZE(vMemptr) = 0.
                    vMemptr = ?.
                END.   
                WHEN "rowid" THEN ASSIGN vhBufferField:BUFFER-VALUE = TO-ROWID(ttCallParameter.parValue) NO-ERROR.
            END CASE.
           
            IF ERROR-STATUS:ERROR 
                THEN ASSIGN oErrMsg = SUBST("&1 parameter could not be pupulated from string '&2'~nERROR(&3)->&4",
                                            ttCallParameter.parIoMode,
                                            ttCallParameter.parValue,
                                            ERROR-STATUS:GET-NUMBER(1),
                                            ERROR-STATUS:GET-MESSAGE(1)).
        END.
    END.
    IF oErrMsg EQ "" THEN
    DO:
        hCallObj:SET-PARAMETER(iParNum,ttCallParameter.parDataType,ttCallParameter.parIoMode,vhBufferField:BUFFER-VALUE) NO-ERROR.
        IF ERROR-STATUS:ERROR 
            THEN ASSIGN oErrMsg = SUBST('Error occurred in hCallObj:SET-PARAMETER of parameter "&1"~n' +
                                        '     ERROR(&2)->&3',
                                         ttCallParameter.parName,
                                         ERROR-STATUS:GET-NUMBER(1),
                                         ERROR-STATUS:GET-MESSAGE(1)).
    END.
        

END PROCEDURE.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-PrepareCallObj-TableHandle) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _PROCEDURE PrepareCallObj-TableHandle Procedure 
PROCEDURE PrepareCallObj-TableHandle :
/*------------------------------------------------------------------------------
  Purpose:     
  Parameters:  <none>
  Notes:       
------------------------------------------------------------------------------*/
    DEFINE INPUT  PARAMETER iParNum AS INTEGER     NO-UNDO.
    DEFINE INPUT-OUTPUT  PARAMETER ioCallObj AS HANDLE      NO-UNDO.
    DEFINE PARAMETER BUFFER ttCallParameter FOR ttCallParameter.
    DEFINE OUTPUT PARAMETER oErrMsg AS CHARACTER   NO-UNDO.
     
    DEFINE VARIABLE vHandle AS HANDLE      NO-UNDO.
    DEFINE VARIABLE vProcNm AS CHARACTER   NO-UNDO.
    DEFINE VARIABLE vInput AS LONGCHAR   NO-UNDO.
    DEFINE VARIABLE vhBufferField AS HANDLE      NO-UNDO.
    DEFINE VARIABLE vhTableHandle AS HANDLE      NO-UNDO.
    ASSIGN vhBufferField = vhTtBuf:BUFFER-FIELD(ttCallParameter.parName) 
           vhTableHandle = vhBufferField:BUFFER-VALUE NO-ERROR.
    IF ERROR-STATUS:ERROR 
        THEN ASSIGN oErrMsg = SUBST('Failed to get buffer-field handle for parameter "&1"~n' +
                                    '   ERROR(&2)->&3',
                                    ttCallParameter.parName,
                                    ERROR-STATUS:GET-NUMBER(1),
                                    ERROR-STATUS:GET-MESSAGE(1)).
        ELSE IF NOT VALID-HANDLE(vhBufferField)
             THEN ASSIGN oErrMsg = SUBST('Failed to get buffer-field handle for parameter "&1"~n', 
                                   ttCallParameter.parName).
    IF oErrMsg EQ "" THEN
    DO:

        IF ttCallParameter.parIoMode EQ "INPUT"
           OR ttCallParameter.parIoMode EQ "INPUT-OUTPUT"  
           OR ttCallParameter.parIoMode MATCHES "*APPEND" THEN
        DO:
            IF ttCallParameter.SchemaProvider NE "" THEN
            DO:
                ASSIGN vProcNm = getTrunkatedProgramNm(ttCallParameter.SchemaProvider).
                IF SEARCH(vProcNm + ".p") EQ ? AND SEARCH(vProcNm + ".r") EQ ?
                    THEN ASSIGN oErrMsg = SUBST("Dataset Template provider '&1' for parameter &2 not found in the propath of the appserver",
                                                ttCallParameter.SchemaProvider,
                                                ttCallParameter.parIndex). 
            END.
            ELSE ASSIGN oErrMsg = SUBST("For &1 table-handle parameter &2 a valid template handler must be provided",
                                        ttCallParameter.parIoMode,
                                        ttCallParameter.parIndex). 
            IF oErrMsg EQ "" THEN
            DO:
                 
                 IF oErrMsg EQ "" THEN
                 DO:
                     RUN VALUE(vProcNm + ".p") (OUTPUT TABLE-HANDLE vhTableHandle) NO-ERROR.
                     IF ERROR-STATUS:ERROR 
                         THEN ASSIGN oErrMsg = SUBST("Error occured running temp-table schema provider &1 for parameter &2~nERROR(&3)-> &4",
                                                     ttCallParameter.SchemaProvider,
                                                     ttCallParameter.parIndex,
                                                     ERROR-STATUS:GET-NUMBER(1),
                                                     ERROR-STATUS:GET-MESSAGE(1)).

                 END. /*IF oErrMsg EQ "" THEN*/
            END. /*IF oErrMsg EQ "" THEN*/    
            IF oErrMsg EQ "" THEN
            DO:
                ASSIGN  vInput = getLongCharVal(ttCallParameter.parIndex).
                IF vInput NE "" AND vInput NE ? THEN
                DO:
                   vhTableHandle:READ-JSON("LONGCHAR",vInput) NO-ERROR.
                   vhBufferField:BUFFER-VALUE = vhTableHandle.
                   IF ERROR-STATUS:ERROR 
                       THEN ASSIGN oErrMsg = SUBST("Error occured loading input for parameter &1~nERROR(&2)-> &3",
                                                   ttCallParameter.parName,
                                                   ERROR-STATUS:GET-NUMBER(1),
                                                   ERROR-STATUS:GET-MESSAGE(1)).

                END.
            END.
        END. /*IF ttCallParameter.parIoMode EQ "INPUT"*/
    END. /*IF oErrMsg EQ "" THEN*/
    IF oErrMsg EQ "" THEN
    DO:
        /*hCallObj:SET-PARAMETER(iParNum,ttCallParameter.parDataType,ttCallParameter.parIoMode,ttOutputParameter.datasetHandleVal).*/
        hCallObj:SET-PARAMETER(iParNum,ttCallParameter.parDataType,ttCallParameter.parIoMode,vhBufferField:BUFFER-VALUE) NO-ERROR.
        IF ERROR-STATUS:ERROR 
            THEN ASSIGN oErrMsg = SUBST('Error occurred in hCallObj:SET-PARAMETER of parameter "&1"~n' +
                                        '     ERROR(&2)->&3',
                                         ttCallParameter.parName,
                                         ERROR-STATUS:GET-NUMBER(1),
                                         ERROR-STATUS:GET-MESSAGE(1)).
    END.

END PROCEDURE.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-ProcessAppserverCall) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _PROCEDURE ProcessAppserverCall Procedure 
PROCEDURE ProcessAppserverCall :
/*------------------------------------------------------------------------------
  Purpose:     
  Parameters:  <none>
  Notes:       
------------------------------------------------------------------------------*/
    IF oErrMsg EQ "" 
        THEN RUN InitializeValueTempTable.
    IF oErrMsg EQ ""
        THEN RUN PrepareCallObj.
    IF oErrMsg EQ "" THEN
    DO:
        hCallObj:INVOKE() NO-ERROR.
        IF ERROR-STATUS:ERROR 
            THEN ASSIGN oErrMsg = SUBST('Error occurred while invoking appserver~n' +
                                        '   ERROR(&1)->&2',
                                        ERROR-STATUS:GET-NUMBER(1),
                                        ERROR-STATUS:GET-MESSAGE(1)).
    END. /*IF oErrMsg EQ "" THEN*/

END PROCEDURE.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-ProcessSchemaRequest) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _PROCEDURE ProcessSchemaRequest Procedure 
PROCEDURE ProcessSchemaRequest :
/*------------------------------------------------------------------------------
  Purpose:     
  Parameters:  <none>
  Notes:       
------------------------------------------------------------------------------*/
    DEFINE VARIABLE vProcNm         AS CHARACTER   NO-UNDO.
    DEFINE VARIABLE vDataObjhandle  AS HANDLE      NO-UNDO.
    
    RUN InitializeValueTempTable.
    
    FIND FIRST ttCallParameter NO-ERROR.
    IF NOT AVAIL ttCallParameter 
        THEN oErrMsg = "Schema requested but no schemaprovider was passed".
    IF oErrMsg EQ "" THEN
    DO:
        ASSIGN vProcNm = getTrunkatedProgramNm(ttCallParameter.SchemaProvider).
        IF SEARCH(vProcNm + ".p") EQ ? AND SEARCH(vProcNm + ".r") EQ ?
            THEN ASSIGN oErrMsg = SUBST("Schema provider '&1' for parameter &2 not found in the propath of the appserver",
                                        ttCallParameter.SchemaProvider,
                                        ttCallParameter.parIndex). 
    END.
    IF oErrMsg EQ "" THEN
    DO:
        ASSIGN  vDataObjhandle = vhTtBuf:BUFFER-FIELD(ttCallParameter.parName):BUFFER-VALUE NO-ERROR.

        IF ttCallParameter.parDataType EQ "DATASET-HANDLE" THEN
        DO:
            RUN VALUE(vProcNm + ".p") (OUTPUT DATASET-HANDLE vDataObjhandle).
        END.            
        ELSE IF ttCallParameter.parDataType EQ "TABLE-HANDLE" 
            THEN RUN VALUE(vProcNm) (OUTPUT TABLE-HANDLE vDataObjhandle).
        ASSIGN  vhTtBuf:BUFFER-FIELD(ttCallParameter.parName):BUFFER-VALUE = vDataObjhandle.
    END.



END PROCEDURE.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

/* ************************  Function Implementations ***************** */

&IF DEFINED(EXCLUDE-bu_getDatasetOutputJson) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION bu_getDatasetOutputJson Procedure 
FUNCTION bu_getDatasetOutputJson RETURNS LONGCHAR
  ( /* parameter-definitions */
      iParName AS CHAR,
      iDatasetHandle AS HANDLE,
      iIncludeMetaSchema AS LOGICAL) :
/*------------------------------------------------------------------------------
  Purpose:  
    Notes:  
------------------------------------------------------------------------------*/
/*
  DEFINE VARIABLE vDatasetJsonOutputJson AS LONGCHAR   NO-UNDO.
  DEFINE VARIABLE vTtJson                AS LONGCHAR    NO-UNDO.
  DEFINE VARIABLE vI                     AS INTEGER     NO-UNDO.
  DEFINE VARIABLE vJ                     AS INTEGER     NO-UNDO.

  ASSIGN vDatasetJsonOutputJson = SUBST('~n "&1" : ~{~n "&2":',
                                          iParName,
                                          iDatasetHandle:NAME).
  DO vI = 1 TO iDatasetHandle:NUM-BUFFERS:
      iDatasetHandle:GET-BUFFER-HANDLE(vI):TABLE-HANDLE:WRITE-JSON("LONGCHAR",vTtJson,FALSE).
      IF vI > 1 AND vTtJson BEGINS "~{" 
          THEN  vTtJson = SUBSTR(vTtJson,2).
      IF vI < iDatasetHandle:NUM-BUFFERS THEN
      DO:
          ASSIGN vJ = LENGTH(vTtJson).
          IF SUBSTR(vTtJson,vJ,1) EQ "}" 
              THEN vTtJson = SUBSTR(vTtJson,1,vJ - 1).    
      END.
      ASSIGN vDatasetJsonOutputJson  = vDatasetJsonOutputJson  + vTtJson.
      IF vI < iDatasetHandle:NUM-BUFFERS 
          THEN ASSIGN vDatasetJsonOutputJson = vDatasetJsonOutputJson + ",~n".
  END.
  IF iIncludeMetaSchema THEN
      ASSIGN vDatasetJsonOutputJson = vDatasetJsonOutputJson + ",~n" + getMetaSchemaDataset(iDatasetHandle).
  ASSIGN vDatasetJsonOutputJson = vDatasetJsonOutputJson + "~n}".
  RETURN vDatasetJsonOutputJson.   /* Function return value. */
*/
END FUNCTION.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-bu_getMetaSchemaBufferField) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION bu_getMetaSchemaBufferField Procedure 
FUNCTION bu_getMetaSchemaBufferField RETURNS CHARACTER
  ( /* parameter-definitions */ 
      ihBufField AS HANDLE) :
/*------------------------------------------------------------------------------
  Purpose:  
    Notes:  
------------------------------------------------------------------------------*/
  DEFINE VARIABLE vMetaSchemaBufferField AS CHARACTER   NO-UNDO.
  DEFINE VARIABLE vInitial AS CHARACTER     NO-UNDO.
  DEFINE VARIABLE vDefaultValue AS CHARACTER   NO-UNDO.
  ASSIGN vDefaultValue = ihBufField:DEFAULT-VALUE.
  IF ihBufField:DATA-TYPE EQ "LOGICAL" THEN
  DO:
      IF vDefaultValue EQ "no" THEN vDefaultValue = "false".
      IF vDefaultValue EQ "yes" THEN vDefaultValue = "true".

  END.
  ASSIGN vInitial      = IF LOOKUP(ihBufField:DATA-TYPE,"CHARACTER,DATE,INTEGER,DECIMAL") > 0 THEN '"' + vDefaultValue + '"' ELSE vDefaultValue.
  IF vInitial EQ ? THEN vInitial = '""'.
  ASSIGN vMetaSchemaBufferField = SUBST('"&1":~{',ihBufField:NAME) +
                                  SUBST('"&1":"&2",',"dataType",ihBufField:DATA-TYPE) +
                                  SUBST('"&1":&2,',"initial", vInitial) +
                                  SUBST('"&1":"&2",',"format",ihBufField:FORMAT) +
                                  SUBST('"&1":"&2"',"label",ihBufField:LABEL) +
                                        "}".
  RETURN vMetaSchemaBufferField.   /* Function return value. */

END FUNCTION.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-bu_getMetaSchemaDataset) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION bu_getMetaSchemaDataset Procedure 
FUNCTION bu_getMetaSchemaDataset RETURNS LONGCHAR
  ( /* parameter-definitions */ 
     ihDataset AS HANDLE) :
/*------------------------------------------------------------------------------
  Purpose:  
    Notes:  
------------------------------------------------------------------------------*/
  /*
  DEFINE VARIABLE vMetascemaStr AS LONGCHAR   NO-UNDO.
  DEFINE VARIABLE i AS INTEGER     NO-UNDO.
  ASSIGN  vMetascemaStr = SUBST('"&1MetaSchema":~{',ihDataset:NAME).
  DO i = 1 TO ihDataset:NUM-BUFFERS:
      ASSIGN vMetascemaStr = vMetascemaStr + getMetaSchemaTable(ihDataset:GET-BUFFER-HANDLE(i))
                             + (IF i < ihDataset:NUM-BUFFERS THEN "," ELSE "").
  END.
  ASSIGN vMetascemaStr = vMetascemaStr + "}~n".
  RETURN vMetascemaStr.   /* Function return value. */
  */
END FUNCTION.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-bu_getMetaSchemaTable) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION bu_getMetaSchemaTable Procedure 
FUNCTION bu_getMetaSchemaTable RETURNS LONGCHAR
  ( /* parameter-definitions */
      ihTable AS HANDLE ) :
/*------------------------------------------------------------------------------
  Purpose:  
    Notes:  
------------------------------------------------------------------------------*/
  /*
  DEFINE VARIABLE vTableMetaSchema AS LONGCHAR   NO-UNDO.
  DEFINE VARIABLE i                AS INTEGER    NO-UNDO.
  DEFINE VARIABLE vPostfix         AS CHARACTER   NO-UNDO.
  IF NOT PROGRAM-NAME(2) MATCHES "*getMetaSchemaDataset*" 
      THEN vPostfix = "MetaSchema".
  ASSIGN vTableMetaSchema = SUBST('~n "&1":~{',ihTable:NAME + vPostfix).
  DO i = 1 TO ihTable:NUM-FIELDS:
      ASSIGN vTableMetaSchema = vTableMetaSchema + getMetaSchemaBufferField(ihTable:BUFFER-FIELD(i)) +
                                IF i < ihTable:NUM-FIELDS THEN ",~n" ELSE "~n".

  END.
  ASSIGN vTableMetaSchema = vTableMetaSchema + "}~n". 
  RETURN vTableMetaSchema.   /* Function return value. */
  */
END FUNCTION.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-formatDateTimeTzVal) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION formatDateTimeTzVal Procedure 
FUNCTION formatDateTimeTzVal RETURNS CHARACTER
    ( /* parameter-definitions */
        iUnformattedDatatimeTzVal AS CHAR ) :
  /*------------------------------------------------------------------------------
    Purpose:  
      Notes:  
  ------------------------------------------------------------------------------*/
    DEFINE VARIABLE vFormattedDatetimeTzVal AS CHARACTER   NO-UNDO.
    ASSIGN vFormattedDatetimeTzVal = iUnformattedDatatimeTzVal.
    RETURN vFormattedDatetimeTzVal.   /* Function return value. */

END FUNCTION.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-formatDateTimeVal) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION formatDateTimeVal Procedure 
FUNCTION formatDateTimeVal RETURNS CHARACTER
  ( /* parameter-definitions */
      iUnformattedDatatimeVal AS CHAR ) :
/*------------------------------------------------------------------------------
  Purpose:  
    Notes:  
------------------------------------------------------------------------------*/
  DEFINE VARIABLE vFormattedDatetimeVal AS CHARACTER   NO-UNDO.
  ASSIGN vFormattedDatetimeVal = iUnformattedDatatimeVal.
  RETURN vFormattedDatetimeVal.   /* Function return value. */

END FUNCTION.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-formatDateVal) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION formatDateVal Procedure 
FUNCTION formatDateVal RETURNS CHARACTER
  ( /* parameter-definitions */ 
      iUnformattedDateVal AS CHAR) :
/*------------------------------------------------------------------------------
  Purpose:  
    Notes:  
------------------------------------------------------------------------------*/
  DEFINE VARIABLE vFormattedDateVal AS CHARACTER   NO-UNDO.
  ASSIGN vFormattedDateVal =  iUnformattedDateVal.
  RETURN vFormattedDateVal.   /* Function return value. */

END FUNCTION.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-getLongCharVal) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION getLongCharVal Procedure 
FUNCTION getLongCharVal RETURNS LONGCHAR
  ( /* parameter-definitions */ 
      iParIndex AS INT) :
/*------------------------------------------------------------------------------
  Purpose:  
    Notes:  
------------------------------------------------------------------------------*/
  DEFINE VARIABLE vLongCharVal AS CHARACTER   NO-UNDO.
  DEF BUFFER ttLongcharChunk FOR ttLongcharChunk.
  FOR EACH ttLongcharChunk
      WHERE ttLongcharChunk.ParIndex = iParIndex:
      ASSIGN vLongCharVal = vLongCharVal + ttLongcharChunk.chunkChar.
  END.
  RETURN vLongCharVal.   /* Function return value. */

END FUNCTION.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-getNumParameters) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION getNumParameters Procedure 
FUNCTION getNumParameters RETURNS INTEGER
  ( /* parameter-definitions */ ) :
/*------------------------------------------------------------------------------
  Purpose:  
    Notes:  
------------------------------------------------------------------------------*/
  DEFINE VARIABLE vNumParameters AS INTEGER     NO-UNDO.
  DEFINE BUFFER ttCallParameter FOR ttCallParameter.
  FOR EACH ttCallParameter:
      ASSIGN vNumParameters = vNumParameters + 1.
  END.
  RETURN  vNumParameters.   /* Function return value. */

END FUNCTION.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-getTrunkatedProgramNm) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION getTrunkatedProgramNm Procedure 
FUNCTION getTrunkatedProgramNm RETURNS CHARACTER
  ( /* parameter-definitions */ 
     iFullProgramNm AS CHAR ) :
/*------------------------------------------------------------------------------
  Purpose: Returns the name of a program without a .p or a .r extension 
    Notes:  
------------------------------------------------------------------------------*/
  DEFINE VARIABLE vTrunkatedProgramNm AS CHARACTER   NO-UNDO.
  ASSIGN vTrunkatedProgramNm = iFullProgramNm.
  IF LOOKUP(SUBSTR(vTrunkatedProgramNm,LENGTH(vTrunkatedProgramNm) - 1),".p,.r") > 0 
      THEN ASSIGN vTrunkatedProgramNm = SUBSTR(vTrunkatedProgramNm,1,LENGTH(vTrunkatedProgramNm) - 2).
  RETURN vTrunkatedProgramNm.   /* Function return value. */

END FUNCTION.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-IsSchemaRequest) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION IsSchemaRequest Procedure 
FUNCTION IsSchemaRequest RETURNS LOGICAL
  ( /* parameter-definitions */ ) :
/*------------------------------------------------------------------------------
  Purpose:  
    Notes:  
------------------------------------------------------------------------------*/

  RETURN CAN-FIND(FIRST ttCallProgram 
                        WHERE ttCallProgram.ProcName EQ "GetSchema").   /* Function return value. */

END FUNCTION.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-JsonEncode) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION JsonEncode Procedure 
FUNCTION JsonEncode RETURNS LONGCHAR
  ( /* parameter-definitions */ 
     iStringToEncode AS LONGCHAR,
     iCharToEscape AS CHAR) :
/*------------------------------------------------------------------------------
  Purpose:  
    Notes:  
------------------------------------------------------------------------------*/
  DEFINE VARIABLE vIndex AS INTEGER     NO-UNDO.
  DEFINE VARIABLE vStartOffset AS INTEGER     NO-UNDO INIT 1.
  DO WHILE TRUE:
      ASSIGN vIndex = INDEX(iStringToEncode,iCharToEscape,vStartOffset).
      IF vIndex > 0 THEN
      DO:
          IF NOT (vIndex > 1 AND SUBSTR(iStringToEncode,vIndex - 1,1) EQ "~\") 
              THEN ASSIGN iStringToEncode = SUBSTR(iStringToEncode,1,vIndex - 1) + "~\" + SUBSTR(iStringToEncode,vIndex) 
                          vStartOffset = vIndex + 2.
              ELSE ASSIGN vStartOffset = vIndex + 1.
      END.
      ELSE LEAVE.
  END. /*DO WHILE TRUE:*/
  RETURN iStringToEncode.   /* Function return value. */

END FUNCTION.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-url-encode) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION url-encode Procedure 
FUNCTION url-encode RETURNS CHARACTER
    (INPUT p_value AS CHARACTER,
     INPUT p_enctype AS CHARACTER) :
  /****************************************************************************
  Description: Encodes unsafe characters in a URL as per RFC 1738 section 2.2.
    <URL:http://ds.internic.net/rfc/rfc1738.txt>, 2.2
  Input Parameters: Character string to encode, Encoding option where "query",
    "cookie", "default" or any specified string of characters are valid.
    In addition, all characters specified in the global variable url_unsafe
    plus ASCII values 0 <= x <= 31 and 127 <= x <= 255 are considered unsafe.
  Returns: Encoded string  (unkown value is returned as blank)
  Global Variables: url_unsafe, url_reserved
  ****************************************************************************/
    DEFINE VARIABLE hx          AS CHARACTER NO-UNDO INITIAL "0123456789ABCDEF":U.
    DEFINE VARIABLE encode-list AS CHARACTER NO-UNDO.
    DEFINE VARIABLE i           AS INTEGER   NO-UNDO.
    DEFINE VARIABLE c           AS INTEGER   NO-UNDO.

    /* Don't bother with blank or unknown  */
    IF LENGTH(p_value) = 0 OR p_value = ? THEN 
      RETURN "".

    /* What kind of encoding should be used? */
    CASE p_enctype:
      WHEN "query":U THEN              /* QUERY_STRING name=value parts */
        encode-list = url_unsafe + url_reserved + "+":U.
      WHEN "cookie":U THEN             /* Persistent Cookies */
        encode-list = url_unsafe + " ,~;":U.
      WHEN "default":U OR WHEN "" THEN /* Standard URL encoding */
        encode-list = url_unsafe.
      OTHERWISE
        encode-list = url_unsafe + p_enctype.   /* user specified ... */
    END CASE.

    /* Loop through entire input string */
    ASSIGN i = 0.
    DO WHILE TRUE:
      ASSIGN
        i = i + 1
        /* ASCII value of character using single byte codepage */
        c = ASC(SUBSTRING(p_value, i, 1, "RAW":U), "1252":U, "1252":U).
      IF c <= 31 OR c >= 127 OR INDEX(encode-list, CHR(c)) > 0 THEN DO:
        /* Replace character with %hh hexidecimal triplet */
        SUBSTRING(p_value, i, 1, "RAW":U) =
          "%":U +
          SUBSTRING(hx, INTEGER(TRUNCATE(c / 16, 0)) + 1, 1, "RAW":U) + /* high */
          SUBSTRING(hx, c MODULO 16 + 1, 1, "RAW":U).             /* low digit */
        ASSIGN i = i + 2.   /* skip over hex triplet just inserted */
      END.
      IF i = LENGTH(p_value,"RAW":U) THEN LEAVE.
    END.

    RETURN p_value.
END FUNCTION.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

