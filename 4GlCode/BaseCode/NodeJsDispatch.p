&ANALYZE-SUSPEND _VERSION-NUMBER AB_v10r12
&ANALYZE-RESUME
&ANALYZE-SUSPEND _UIB-CODE-BLOCK _CUSTOM _DEFINITIONS Procedure 
/*------------------------------------------------------------------------
    File        : NodeJsDispatch.p 
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

DEFINE INPUT  PARAMETER iHandler AS CHARACTER   NO-UNDO.
DEFINE INPUT  PARAMETER iInputPars AS LONGCHAR   NO-UNDO.
DEFINE OUTPUT PARAMETER oOutputPars AS LONGCHAR   NO-UNDO.
DEFINE OUTPUT PARAMETER oDatasetJson AS LONGCHAR   NO-UNDO.
DEFINE OUTPUT PARAMETER oErrMsg AS CHARACTER   NO-UNDO.

DEFINE VARIABLE vInputPars AS CHARACTER   NO-UNDO.
DEFINE VARIABLE vDatasetHandle AS HANDLE      NO-UNDO.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME


&ANALYZE-SUSPEND _UIB-PREPROCESSOR-BLOCK 

/* ********************  Preprocessor Definitions  ******************** */

&Scoped-define PROCEDURE-TYPE Procedure
&Scoped-define DB-AWARE no



/* _UIB-PREPROCESSOR-BLOCK-END */
&ANALYZE-RESUME



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

DO ON ERROR UNDO, LEAVE:
  RUN VALUE(iHandler) (
      INPUT iInputPars,
      OUTPUT oOutputPars,
      OUTPUT DATASET-HANDLE vDatasetHandle,
      OUTPUT oErrMsg).

  IF VALID-HANDLE(vDatasetHandle) THEN
  DO:
     vDatasetHandle:WRITE-JSON("LONGCHAR",oDatasetJson,TRUE).
            
  END.
  CATCH oneError AS Progress.Lang.SysError: 
      ASSIGN oErrMsg = oneError:GetMessage(1).
  END CATCH.  
  FINALLY:
  END FINALLY.
END.

/* _UIB-CODE-BLOCK-END */
&ANALYZE-RESUME


