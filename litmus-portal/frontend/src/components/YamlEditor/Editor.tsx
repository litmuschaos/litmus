/* eslint-disable no-param-reassign */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useTheme } from '@material-ui/core';
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
import React, { useEffect, useState } from 'react';
import AceEditor from 'react-ace';
import useStyles from './styles';
import { AceValidations, parseYamlValidations } from './Validations';
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
import 'brace/theme/solarized_dark';

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

  const [isValid, setIsValid] = useState(true);

  const [editorState, setEditorState] = useState({
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
      const nodeStyleError = (document.getElementsByClassName(
        'ace_gutter-cell'
      )[stateObject.annotations[0].row - 1] as any).style;
      nodeStyleError.background = 'red';
      nodeStyleError.color = palette.secondary.contrastText;
    } else {
      setIsValid(true);
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

  // const fullscreentrigger = () => {
  //   const i: any = document.getElementById('resize-editor');
  //   (YamlAce.current!.editor as any).setOption(
  //     'maxLines',
  //     document.body.clientHeight
  //   );
  //   if (i.requestFullscreen) {
  //     i.requestFullscreen();
  //   } else if (i.webkitRequestFullscreen) {
  //     i.webkitRequestFullscreen();
  //   } else if (i.mozRequestFullScreen) {
  //     i.mozRequestFullScreen();
  //   } else if (i.msRequestFullscreen) {
  //     i.msRequestFullscreen();
  //   }
  // };

  useEffect(() => {
    const editorValidations: AceValidations = parseYamlValidations(
      content,
      classes
    );
    const stateObject = {
      markers: editorValidations.markers,
      annotations: editorValidations.annotations,
    };
    if (stateObject.annotations.length > 0) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
    setEditorState(stateObject as any);
  }, []);

  useEffect(() => {
    if (setButtonState) setButtonState(isValid);
  }, [isValid]);

  return (
    <div id="editor" data-cy="WorkflowEditor">
      <>
        {!readOnly && (
          <div className={classes.editorButtonGrid}>
            <Tooltip
              title="Undo"
              placement="top"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <div className={classes.editorButtons} onClick={startundo}>
                <UndoTwoToneIcon />
              </div>
            </Tooltip>

            <Tooltip
              title="Redo"
              placement="top"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <div className={classes.editorButtons} onClick={startredo}>
                <RedoTwoToneIcon />
              </div>
            </Tooltip>

            <Tooltip
              title="Download"
              placement="top"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <div className={classes.editorButtons} onClick={downloadYamlFile}>
                <GetAppTwoToneIcon />
              </div>
            </Tooltip>

            <Tooltip
              title="Copy"
              placement="top"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <div className={classes.editorButtons} onClick={copycontent}>
                <FileCopyTwoToneIcon />
              </div>
            </Tooltip>

            <Tooltip
              title="Goto Error"
              placement="top"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <div
                className={classes.editorButtons}
                onClick={startgotonexterror}
              >
                <ErrorTwoToneIcon />
              </div>
            </Tooltip>

            <Tooltip
              title="Find"
              placement="top"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <div className={classes.editorButtons} onClick={startfinder}>
                <FindInPageTwoToneIcon />
              </div>
            </Tooltip>

            <Tooltip
              title="Replace"
              placement="top"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <div className={classes.editorButtons} onClick={startreplace}>
                <FindReplaceTwoToneIcon />
              </div>
            </Tooltip>

            <Tooltip
              title="Unfold All"
              placement="top"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <div className={classes.editorButtons} onClick={startunfoldall}>
                <UnfoldMoreTwoToneIcon />
              </div>
            </Tooltip>

            <Tooltip
              title="Fold All"
              placement="top"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <div className={classes.editorButtons} onClick={startfoldall}>
                <UnfoldLessTwoToneIcon />
              </div>
            </Tooltip>

            <Tooltip
              title="Select"
              placement="top"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              arrow
            >
              <div className={classes.editorButtons} onClick={startselectall}>
                <SelectAllTwoToneIcon />
              </div>
            </Tooltip>
          </div>
        )}
      </>
      <br />
      <div className={classes.editor}>
        <AceEditor
          mode="yaml"
          theme="solarized_dark"
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
              fontFamily: 'monospace',
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
            // editor.container.style.background = palette.common.black;
            editor.container.style.lineHeight = '160%';
            const nodeStyle = (document.getElementsByClassName(
              'ace_gutter'
            )[0] as any).style;
            nodeStyle.color = palette.secondary.contrastText;
            nodeStyle.borderRight = 0;
            // nodeStyle.background = palette.common.black;
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
        {/* <Box p={1} flexGrow={0} className={classes.fullScreenGrid}>
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
        </Box> */}
      </div>
    </div>
  );
};

export default YamlEditor;
