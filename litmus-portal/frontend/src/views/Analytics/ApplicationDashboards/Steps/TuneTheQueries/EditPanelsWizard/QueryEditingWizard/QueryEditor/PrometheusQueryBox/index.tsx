/* eslint-disable no-param-reassign */
import { Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import './prometheus';
import useStyles from './styles';
import './theme';

interface PrometheusQueryEditorProps {
  index: number;
  content: string;
  saveQueryChange: (updatedQuery: string) => void;
  seriesListCompletionOptions: any;
  labelListCompletionOptions: any;
  valueListCompletionOptions: any;
}

const PrometheusQueryEditor: React.FC<PrometheusQueryEditorProps> = ({
  index,
  content,
  saveQueryChange,
  seriesListCompletionOptions,
  labelListCompletionOptions,
  valueListCompletionOptions,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [modifiedPrometheusQuery, setModifiedPrometheusQuery] = useState(
    content
  );
  const [autoCompleteOptions, setAutoCompleteOptions] = useState([
    ...seriesListCompletionOptions,
    ...labelListCompletionOptions,
    ...valueListCompletionOptions,
  ]);
  const PromAce = React.createRef() as React.RefObject<AceEditor>;

  useEffect(() => {
    setModifiedPrometheusQuery(content);
  }, [content]);

  useEffect(() => {
    setAutoCompleteOptions([
      ...seriesListCompletionOptions,
      ...labelListCompletionOptions,
      ...valueListCompletionOptions,
    ]);
  }, [
    seriesListCompletionOptions,
    labelListCompletionOptions,
    valueListCompletionOptions,
  ]);

  return (
    <div id={`editor-${index}`} data-cy="WorkflowEditor">
      <div className={classes.editor}>
        <Typography className={classes.heading}>
          {t('analyticsDashboard.applicationDashboards.tuneTheQueries.query')}
        </Typography>
        <pre id="prom-query-editor">
          <AceEditor
            mode="prometheus"
            theme="prom-query-editor"
            width="100%"
            height="100%"
            maxLines={12000}
            minLines={1}
            highlightActiveLine={false}
            readOnly={false}
            tabSize={2}
            wrapEnabled
            ref={PromAce}
            showGutter={false}
            onChange={(value: string) => {
              setModifiedPrometheusQuery(value);
              saveQueryChange(value);
            }}
            showPrintMargin={false}
            enableSnippets={false}
            value={modifiedPrometheusQuery}
            editorProps={{
              $blockScrolling: Infinity,
              $useWorker: true,
            }}
            onLoad={(editor) => {
              editor.setReadOnly(false);
              editor.setOptions({
                fontFamily: 'monospace',
                highlightGutterLine: false,
                autoScrollEditorIntoView: true,
                tooltipFollowsMouse: true,
                displayIndentGuides: false,
                enableBasicAutocompletion: [
                  {
                    getCompletions: (
                      _editor: any,
                      _session: any,
                      _pos: any,
                      _prefix: any,
                      callback: any
                    ) => {
                      // note, won't fire if caret is at a word that does not have these letters
                      callback(null, autoCompleteOptions);
                    },
                  },
                ],
                // to make popup appear automatically, without explicit _ctrl+space_
                enableLiveAutocompletion: true,
              });
              editor.setHighlightSelectedWord(true);
              editor.session.setFoldStyle('markbeginend');
              editor.setShowFoldWidgets(false);
              editor.setAnimatedScroll(true);
              editor.setShowInvisibles(false);
              editor.setFontSize('0.98rem');
              editor.container.style.lineHeight = '160%';
            }}
            onCursorChange={() => {
              if (PromAce.current) {
                (PromAce.current!.editor as any).setOptions({
                  autoScrollEditorIntoView: true,
                  tooltipFollowsMouse: true,
                });
              }
            }}
          />
        </pre>
      </div>
    </div>
  );
};

export default PrometheusQueryEditor;
