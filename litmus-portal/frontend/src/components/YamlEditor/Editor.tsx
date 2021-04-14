/* eslint-disable no-param-reassign */
import { Box, Button, Typography, useTheme } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import Fade from '@material-ui/core/Fade';
import Tooltip from '@material-ui/core/Tooltip';
import ErrorTwoToneIcon from '@material-ui/icons/ErrorTwoTone';
import FileCopyTwoToneIcon from '@material-ui/icons/FileCopyTwoTone';
import FindInPageTwoToneIcon from '@material-ui/icons/FindInPageTwoTone';
import FindReplaceTwoToneIcon from '@material-ui/icons/FindReplaceTwoTone';
import GetAppTwoToneIcon from '@material-ui/icons/GetAppTwoTone';
import RedoTwoToneIcon from '@material-ui/icons/RedoTwoTone';
import SelectAllTwoToneIcon from '@material-ui/icons/SelectAllTwoTone';
import UndoTwoToneIcon from '@material-ui/icons/UndoTwoTone';
import UnfoldLessTwoToneIcon from '@material-ui/icons/UnfoldLessTwoTone';
import UnfoldMoreTwoToneIcon from '@material-ui/icons/UnfoldMoreTwoTone';
import AceEditor from 'react-ace';
import 'ace-builds/src-min-noconflict/ext-beautify';
import 'ace-builds/src-min-noconflict/ext-code_lens';
import 'ace-builds/src-min-noconflict/ext-elastic_tabstops_lite';
import 'ace-builds/src-min-noconflict/ext-emmet';
import 'ace-builds/src-min-noconflict/ext-error_marker';
import 'ace-builds/src-min-noconflict/ext-keybinding_menu';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import 'ace-builds/src-min-noconflict/ext-linking';
import 'ace-builds/src-min-noconflict/ext-modelist';
import 'ace-builds/src-min-noconflict/ext-options';
import 'ace-builds/src-min-noconflict/ext-prompt';
import 'ace-builds/src-min-noconflict/ext-rtl';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import 'ace-builds/src-min-noconflict/ext-spellcheck';
import 'ace-builds/src-min-noconflict/ext-split';
import 'ace-builds/src-min-noconflict/ext-static_highlight';
import 'ace-builds/src-min-noconflict/ext-statusbar';
import 'ace-builds/src-min-noconflict/ext-textarea';
import 'ace-builds/src-min-noconflict/ext-themelist';
import 'ace-builds/src-min-noconflict/ext-whitespace';
import 'brace/mode/yaml';
import 'brace/theme/cobalt';
import React, { useEffect, useState } from 'react';
import YAML from 'yaml';
import { useTranslation } from 'react-i18next';
import useActions from '../../redux/actions';
import * as WorkflowActions from '../../redux/actions/workflow';
import useStyles from './styles';
import { AceValidations, parseYamlValidations } from './Validations';

interface YamlEditorProps {
  content: string;
  filename?: string;
  readOnly: boolean;
  setButtonState?: (btnState: boolean) => void;
  saveWorkflowChange?: (updatedManifest: string) => void;
}

const YamlEditor: React.FC<YamlEditorProps> = ({
  content,
  filename,
  readOnly,
  setButtonState,
  saveWorkflowChange,
}) => {
  const classes = useStyles();
  const { palette } = useTheme();

  const { t } = useTranslation();

  const workflow = useActions(WorkflowActions);

  const [isValid, setIsValid] = useState(true);

  const [errors, setErrors] = useState({
    errorLine: ' ',
    errorPosition: ' ',
    errorType: ' ',
    errorInfo: ' ',
  });

  const [editorState, setEditorState] = React.useState({
    markers: [],
    annotations: [],
    content,
  });

  const [modifiedYaml, setModifiedYaml] = useState(content);

  const YamlAce = React.createRef() as React.RefObject<AceEditor>;

  const onEditorChange = (value: string) => {
    let editorValidations: AceValidations = {
      markers: [],
      annotations: [],
    };
    editorValidations = parseYamlValidations(value, classes);
    const stateObject = {
      markers: editorValidations.markers,
      annotations: editorValidations.annotations,
    };
    if (stateObject.annotations.length > 0) {
      setIsValid(false);
      setErrors({
        errorLine: (stateObject.annotations[0].row as unknown) as string,
        errorPosition: (stateObject.annotations[0].column as unknown) as string,
        errorType: stateObject.annotations[0].type as string,
        errorInfo: stateObject.annotations[0].text as string,
      });
      const nodeStyleError = (document.getElementsByClassName(
        'ace_gutter-cell'
      )[stateObject.annotations[0].row - 1] as any).style;
      nodeStyleError.background = 'red';
      nodeStyleError.color = palette.secondary.contrastText;
    } else {
      setIsValid(true);
      setErrors({
        errorLine: ' ',
        errorPosition: ' ',
        errorType: ' ',
        errorInfo: ' ',
      });
      const nodeStyleErrorList = document.getElementsByClassName(
        'ace_gutter-cell'
      );
      for (let i = 0; i < nodeStyleErrorList.length; i += 1) {
        (nodeStyleErrorList[i] as any).style.backgroundColor =
          palette.common.black;
        (nodeStyleErrorList[i] as any).style.color =
          palette.secondary.contrastText;
      }
    }
    setModifiedYaml(value);
    setEditorState(stateObject as any);
    if (saveWorkflowChange) saveWorkflowChange(value);
  };

  const downloadYamlFile = () => {
    const element = document.createElement('a');
    const file = new Blob([modifiedYaml as any], {
      type: 'text/yaml',
    });
    element.href = URL.createObjectURL(file);
    element.download = `${filename}.yaml`;
    document.body.appendChild(element);
    element.click();
  };

  const copycontent = () => {
    if (!navigator.clipboard) {
      console.error('Oops Could not copy text: ');
      return;
    }
    navigator.clipboard
      .writeText(modifiedYaml as any)
      .catch((err) => console.error('Async: Could not copy text: ', err));
  };

  const startfinder = () => {
    (YamlAce.current!.editor as any).execCommand('find');
  };

  const startreplace = () => {
    (YamlAce.current!.editor as any).execCommand('replace');
  };

  const startundo = () => {
    (YamlAce.current!.editor as any).execCommand('undo');
  };

  const startredo = () => {
    (YamlAce.current!.editor as any).execCommand('redo');
  };

  const startfoldall = () => {
    (YamlAce.current!.editor as any).execCommand('foldall');
  };

  const startunfoldall = () => {
    (YamlAce.current!.editor as any).execCommand('unfoldall');
  };

  const startselectall = () => {
    (YamlAce.current!.editor as any).execCommand('selectall');
  };

  const startgotonexterror = () => {
    (YamlAce.current!.editor as any).execCommand('goToNextError');
  };

  const fullscreentrigger = () => {
    const i: any = document.getElementById('resize-editor');
    (YamlAce.current!.editor as any).setOption(
      'maxLines',
      document.body.clientHeight
    );
    if (i.requestFullscreen) {
      i.requestFullscreen();
    } else if (i.webkitRequestFullscreen) {
      i.webkitRequestFullscreen();
    } else if (i.mozRequestFullScreen) {
      i.mozRequestFullScreen();
    } else if (i.msRequestFullscreen) {
      i.msRequestFullscreen();
    }
  };

  useEffect(() => {
    let editorValidations: AceValidations = {
      markers: [],
      annotations: [],
    };
    editorValidations = parseYamlValidations(content, classes);
    const stateObject = {
      markers: editorValidations.markers,
      annotations: editorValidations.annotations,
    };
    if (stateObject.annotations.length > 0) {
      setIsValid(false);
      setErrors({
        errorLine: (stateObject.annotations[0].row as unknown) as string,
        errorPosition: (stateObject.annotations[0].column as unknown) as string,
        errorType: stateObject.annotations[0].type as string,
        errorInfo: stateObject.annotations[0].text as string,
      });
    } else {
      setIsValid(true);
      setErrors({
        errorLine: ' ',
        errorPosition: ' ',
        errorType: ' ',
        errorInfo: ' ',
      });
    }
    setEditorState(stateObject as any);
    const yamlData = YAML.parse(content);
    if (readOnly !== true) {
      workflow.setWorkflowDetails({
        namespace: yamlData.metadata.namespace,
      });
    }
  }, []);

  useEffect(() => {
    if (setButtonState) setButtonState(isValid);
  }, [isValid]);

  return (
    <div
      className={classes.editorBackgroundFull}
      id="editor"
      data-cy="WorkflowEditor"
    >
      <Typography
        className={
          readOnly
            ? classes.statusHeadingInModal
            : classes.statusHeadingOutModal
        }
      >
        {t('editor.status')}
        <Typography className={classes.saved} display="inline">
          &nbsp; &nbsp;
          <strong>
            <span>
              <Typography
                className={
                  isValid ? classes.markStyleCorrect : classes.markStyleWrong
                }
                display="inline"
              >
                {isValid ? '\u2713' : '\u274C'}
              </Typography>
            </span>
            <Typography
              id="YamlStatus"
              className={
                isValid ? classes.markStyleCorrect : classes.markStyleWrong
              }
              display="inline"
            >
              &nbsp;
              <strong>{isValid ? 'Correct' : 'Incorrect'}</strong>
            </Typography>
          </strong>
        </Typography>
      </Typography>
      <Typography className={classes.statusDescription}>
        {isValid
          ? ' '
          : `Pay attention to Line ${errors.errorLine}'s ` +
            ` character ${errors.errorPosition}. Type: ${errors.errorType} -> ${errors.errorInfo}.`}
        &nbsp;
        {isValid
          ? 'Your code is fine. You can move on!'
          : 'Correct this error and keep moving forward!'}
      </Typography>
      <div className={classes.widthManager}>
        <Divider
          variant="middle"
          classes={{ root: classes.horizontalLineWhite }}
        />
        {!readOnly && (
          <div className={classes.editorButtonGrid}>
            <Tooltip
              title="Undo"
              placement="bottom"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <Button
                variant="outlined"
                className={`${classes.editorButtons} ${classes.editorButtonUndo}`}
                onClick={startundo}
                startIcon={<UndoTwoToneIcon />}
              />
            </Tooltip>

            <Tooltip
              title="Redo"
              placement="bottom"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <Button
                variant="outlined"
                className={classes.editorButtons}
                onClick={startredo}
                startIcon={<RedoTwoToneIcon />}
              />
            </Tooltip>

            <Tooltip
              title="Download"
              placement="bottom"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <Button
                variant="outlined"
                className={`${classes.editorButtons} ${classes.editorButtonDownload}`}
                onClick={downloadYamlFile}
                startIcon={<GetAppTwoToneIcon />}
              />
            </Tooltip>

            <Tooltip
              title="Copy"
              placement="bottom"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <Button
                variant="outlined"
                className={`${classes.editorButtons} ${classes.editorButtonGotoCopyUnfold}`}
                onClick={copycontent}
                startIcon={<FileCopyTwoToneIcon />}
              />
            </Tooltip>

            <Tooltip
              title="Goto Error"
              placement="bottom"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <Button
                variant="outlined"
                className={`${classes.editorButtons} ${classes.editorButtonGotoCopyUnfold}`}
                onClick={startgotonexterror}
                startIcon={<ErrorTwoToneIcon />}
              />
            </Tooltip>

            <Tooltip
              title="Find"
              placement="bottom"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <Button
                variant="outlined"
                className={`${classes.editorButtons} ${classes.editorButtonFind}`}
                onClick={startfinder}
                startIcon={<FindInPageTwoToneIcon />}
              />
            </Tooltip>

            <Tooltip
              title="Replace"
              placement="bottom"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <Button
                variant="outlined"
                className={`${classes.editorButtons} ${classes.editorButtonReplace}`}
                onClick={startreplace}
                startIcon={<FindReplaceTwoToneIcon />}
              />
            </Tooltip>

            <Tooltip
              title="Unfold All"
              placement="bottom"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <Button
                variant="outlined"
                className={`${classes.editorButtons} ${classes.editorButtonGotoCopyUnfold}`}
                onClick={startunfoldall}
                startIcon={<UnfoldMoreTwoToneIcon />}
              />
            </Tooltip>

            <Tooltip
              title="Fold All"
              placement="bottom"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <Button
                variant="outlined"
                className={`${classes.editorButtons} ${classes.editorButtonFold}`}
                onClick={startfoldall}
                startIcon={<UnfoldLessTwoToneIcon />}
              />
            </Tooltip>

            <Tooltip
              title="Select"
              placement="bottom"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <Button
                variant="outlined"
                className={`${classes.editorButtons} ${classes.editorButtonSelectAll}`}
                onClick={startselectall}
                startIcon={<SelectAllTwoToneIcon />}
              />
            </Tooltip>
          </div>
        )}
      </div>
      <div className={classes.fullWidth}>
        <Box display="flex" p={1} className={classes.editorContainer}>
          <Box
            p={1}
            flexGrow={1}
            className={classes.editorGrid}
            id="resize-editor"
          >
            <AceEditor
              mode="yaml"
              theme="cobalt"
              name="code"
              width="100%"
              height="100%"
              maxLines={12000}
              minLines={1}
              highlightActiveLine={false}
              readOnly={readOnly}
              tabSize={2}
              wrapEnabled
              ref={YamlAce}
              showGutter
              onChange={onEditorChange}
              showPrintMargin={false}
              enableBasicAutocompletion
              enableSnippets
              enableLiveAutocompletion
              value={editorState.content}
              editorProps={{
                $blockScrolling: Infinity,
                $useWorker: true,
              }}
              onLoad={(editor) => {
                editor.setReadOnly(readOnly);
                editor.setOptions({
                  fontFamily: 'Ubuntu Mono',
                  highlightGutterLine: false,
                  autoScrollEditorIntoView: true,
                  tooltipFollowsMouse: true,
                  displayIndentGuides: false,
                });
                editor.focus();
                editor.setHighlightSelectedWord(true);
                editor.session.setFoldStyle('markbeginend');
                editor.setShowFoldWidgets(true);
                editor.setAnimatedScroll(true);
                editor.setShowInvisibles(false);
                editor.setFontSize('0.98rem');
                editor.container.style.background = palette.common.black;
                editor.container.style.lineHeight = '160%';
                const nodeStyle = (document.getElementsByClassName(
                  'ace_gutter'
                )[0] as any).style;
                nodeStyle.color = palette.secondary.contrastText;
                nodeStyle.borderRight = 0;
                nodeStyle.background = palette.common.black;
              }}
              onCursorChange={(selection) => {
                (YamlAce.current!.editor as any).setOptions({
                  autoScrollEditorIntoView: true,
                  tooltipFollowsMouse: true,
                });

                const nodeStyleActiveList = document.getElementsByClassName(
                  'ace_gutter-cell'
                );
                for (let i = 0; i < nodeStyleActiveList.length; i += 1) {
                  (nodeStyleActiveList[i] as any).style.backgroundColor =
                    palette.common.black;
                  (nodeStyleActiveList[i] as any).style.color =
                    palette.secondary.contrastText;
                }

                if (
                  document.getElementsByClassName('ace_gutter-cell')[
                    selection.cursor.row
                  ] as any
                ) {
                  const nodeStyleActive = (document.getElementsByClassName(
                    'ace_gutter-cell'
                  )[selection.cursor.row] as any).style;
                  nodeStyleActive.backgroundColor = palette.primary.main;
                  nodeStyleActive.color = palette.secondary.contrastText;
                }
              }}
              annotations={editorState.annotations}
              markers={editorState.markers}
            />
          </Box>
          <Box p={1} flexGrow={0} className={classes.fullScreenGrid}>
            <Tooltip
              title="Full Screen (Press Escape to End)"
              placement="bottom"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <Button
                variant="outlined"
                className={classes.editorButtonFullScreen}
                onClick={fullscreentrigger}
                startIcon={
                  <img
                    src="/icons/fullscreen.svg"
                    alt="Full Screen"
                    color={palette.secondary.contrastText}
                    className={classes.fullScreenIcon}
                  />
                }
              />
            </Tooltip>
          </Box>
        </Box>
      </div>
      <div className={classes.extraSpace} />
    </div>
  );
};

export default YamlEditor;
