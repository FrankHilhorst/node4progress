&ANALYZE-SUSPEND _VERSION-NUMBER AB_v10r12
&ANALYZE-RESUME
&ANALYZE-SUSPEND _UIB-CODE-BLOCK _CUSTOM _DEFINITIONS Procedure 
/*------------------------------------------------------------------------
    File        : nodeJsMetaSchema.p 
    Purpose     : Add metsschema definitions for dataset.

    Syntax      :

    Description :

    Author(s)   :
    Created     :
    Notes       :
  ----------------------------------------------------------------------*/
/*          This .W file was created with the Progress AppBuilder.      */
/*----------------------------------------------------------------------*/

/* ***************************  Definitions  ************************** */

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME


&ANALYZE-SUSPEND _UIB-PREPROCESSOR-BLOCK 

/* ********************  Preprocessor Definitions  ******************** */

&Scoped-define PROCEDURE-TYPE Procedure
&Scoped-define DB-AWARE no



/* _UIB-PREPROCESSOR-BLOCK-END */
&ANALYZE-RESUME


/* ************************  Function Prototypes ********************** */

&IF DEFINED(EXCLUDE-getDatasetOutputJson) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION-FORWARD getDatasetOutputJson Procedure 
FUNCTION getDatasetOutputJson RETURNS LONGCHAR
  ( /* parameter-definitions */
      iParName AS CHAR,
      iDatasetHandle AS HANDLE,
      iIncludeMetaSchema AS LOGICAL)  FORWARD.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-getMetaSchemaBufferField) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION-FORWARD getMetaSchemaBufferField Procedure 
FUNCTION getMetaSchemaBufferField RETURNS CHARACTER
  ( /* parameter-definitions */ 
      ihBufField AS HANDLE)  FORWARD.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-getMetaSchemaDataset) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION-FORWARD getMetaSchemaDataset Procedure 
FUNCTION getMetaSchemaDataset RETURNS LONGCHAR
  ( /* parameter-definitions */ 
     ihDataset AS HANDLE)  FORWARD.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-getMetaSchemaTable) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION-FORWARD getMetaSchemaTable Procedure 
FUNCTION getMetaSchemaTable RETURNS LONGCHAR
  ( /* parameter-definitions */
      ihTable AS HANDLE )  FORWARD.

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

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME


/* ************************  Function Implementations ***************** */

&IF DEFINED(EXCLUDE-getDatasetOutputJson) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION getDatasetOutputJson Procedure 
FUNCTION getDatasetOutputJson RETURNS LONGCHAR
  ( /* parameter-definitions */
      iParName AS CHAR,
      iDatasetHandle AS HANDLE,
      iIncludeMetaSchema AS LOGICAL) :
/*------------------------------------------------------------------------------
  Purpose:  
    Notes:  
------------------------------------------------------------------------------*/
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
  
END FUNCTION.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-getMetaSchemaBufferField) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION getMetaSchemaBufferField Procedure 
FUNCTION getMetaSchemaBufferField RETURNS CHARACTER
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

&IF DEFINED(EXCLUDE-getMetaSchemaDataset) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION getMetaSchemaDataset Procedure 
FUNCTION getMetaSchemaDataset RETURNS LONGCHAR
  ( /* parameter-definitions */ 
     ihDataset AS HANDLE) :
/*------------------------------------------------------------------------------
  Purpose:  
    Notes:  
------------------------------------------------------------------------------*/
  DEFINE VARIABLE vMetascemaStr AS LONGCHAR   NO-UNDO.
  DEFINE VARIABLE i AS INTEGER     NO-UNDO.
  ASSIGN  vMetascemaStr = SUBST('"&1MetaSchema":~{',ihDataset:NAME).
  DO i = 1 TO ihDataset:NUM-BUFFERS:
      ASSIGN vMetascemaStr = vMetascemaStr + getMetaSchemaTable(ihDataset:GET-BUFFER-HANDLE(i))
                             + (IF i < ihDataset:NUM-BUFFERS THEN "," ELSE "").
  END.
  ASSIGN vMetascemaStr = vMetascemaStr + "}~n".
  RETURN vMetascemaStr.   /* Function return value. */
  
END FUNCTION.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

&IF DEFINED(EXCLUDE-getMetaSchemaTable) = 0 &THEN

&ANALYZE-SUSPEND _UIB-CODE-BLOCK _FUNCTION getMetaSchemaTable Procedure 
FUNCTION getMetaSchemaTable RETURNS LONGCHAR
  ( /* parameter-definitions */
      ihTable AS HANDLE ) :
/*------------------------------------------------------------------------------
  Purpose:  
    Notes:  
------------------------------------------------------------------------------*/
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

END FUNCTION.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME

&ENDIF

