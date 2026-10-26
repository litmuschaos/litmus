import type { editor } from 'monaco-editor';
import React from 'react';
import ReactMonacoEditor, {
  ChangeHandler,
  EditorDidMount,
  EditorWillMount,
  MonacoEditorProps
} from 'react-monaco-editor';
import { setForwardedRef } from '@utils';

export type MonacoCodeEditorRef = editor.IStandaloneCodeEditor;

export interface ExtendedMonacoEditorProps extends MonacoEditorProps {
  name?: string;
  setLineCount?: (line: number) => void;
  'data-testid'?: string;
  alwaysShowDarkTheme?: boolean;
}

const MonacoEditor = React.forwardRef<MonacoCodeEditorRef, ExtendedMonacoEditorProps>((props, ref) => {
  const _ref = React.useRef<MonacoCodeEditorRef | null>(null);

  const editorWillMount: EditorWillMount = monaco => {
    monaco?.editor?.defineTheme('disable-theme', {
      base: 'vs',
      inherit: true,
      rules: [{ background: 'f3f3fa', token: '' }],
      colors: {
        'editor.background': '#fafafa'
      }
    });

    props.editorWillMount?.(monaco);
  };

  const editorDidMount: EditorDidMount = (editor, monaco) => {
    _ref.current = editor;
    setForwardedRef(ref, editor);

    const model = editor.getModel();
    if (model) {
      props.setLineCount?.(model.getLineCount());
    }

    const remeasureFonts = (): void => monaco?.editor?.remeasureFonts();
    const loaded = document.fonts.check('1em Roboto Mono');

    if (loaded) {
      remeasureFonts();
    } else {
      document.fonts.ready.then(remeasureFonts);
    }

    props.editorDidMount?.(editor, monaco);
  };

  const onChange: ChangeHandler = (value, event) => {
    const model = _ref.current?.getModel();
    if (model) {
      props.setLineCount?.(model.getLineCount());
    }

    props.onChange?.(value, event);
  };

  const theme = props.alwaysShowDarkTheme ? 'vs-dark' : props.options?.readOnly ? 'disable-theme' : 'vs';

  return (
    <ReactMonacoEditor
      {...props}
      theme={theme}
      editorWillMount={editorWillMount}
      editorDidMount={editorDidMount}
      onChange={onChange}
    />
  );
});

MonacoEditor.displayName = 'MonacoEditor';

export default MonacoEditor;
