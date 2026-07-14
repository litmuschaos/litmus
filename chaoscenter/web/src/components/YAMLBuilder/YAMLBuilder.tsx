import React, { memo } from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { monaco, MonacoEditorProps } from 'react-monaco-editor';
import { debounce, defaultTo, throttle, truncate } from 'lodash-es';
import type { IDisposable } from 'monaco-editor/esm/vs/editor/editor.api';
import { Container, CopyToClipboard, Layout, Popover } from '@harnessio/uicore';
import { PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core';
import cx from 'classnames';
import { Icon } from '@harnessio/icons';
import { configureMonacoYaml } from 'monaco-yaml';
import MonacoEditor from '@components/MonacoEditor';
import { Fallback } from '@errors';
import { useStrings } from '@strings';
import type { MonacoCodeEditorRef } from '@components/MonacoEditor/MonacoEditor';
import { useTrackedRef } from '@hooks';
import { sanitize, yamlStringify } from '@utils';
import { DEFAULT_EDITOR_HEIGHT, MAX_ERR_MSSG_LENGTH } from './YAMLBuilderConstants';
import type { YAMLBuilderProps } from './YAMLBuilderProps';
import css from './YamlBuilder.module.scss';
import './resizer.scss';

function YAMLBuilder(props: YAMLBuilderProps): React.ReactElement {
  const {
    width,
    height,
    existingYaml,
    isEditModeSupported = true,
    isReadOnlyMode,
    onChange,
    theme = 'LIGHT',
    yamlSanityConfig,
    renderCustomHeader,
    existingJSON,
    schema,
    fileName,
    showCopyIcon = true,
    customCss,
    displayBorder = true
  } = props;
  const { getString } = useStrings();
  const editorRef = React.useRef<MonacoCodeEditorRef>(null);
  const currentYamlRef = React.useRef<string>(defaultTo(existingYaml, ''));
  const onChangeRef = useTrackedRef(onChange);
  const codeLensRegistrations = React.useRef<Map<number, IDisposable>>(new Map<number, IDisposable>());
  const [currentYaml, setCurrentYaml] = React.useState<string>(defaultTo(existingYaml, ''));
  const [yamlValidationErrors, setYamlValidationErrors] = React.useState<Map<number, string>>(new Map());

  const onYamlChange = React.useMemo(
    () =>
      debounce((updatedYaml: string): void => {
        setCurrentYaml(updatedYaml);
        currentYamlRef.current = updatedYaml;
        onChangeRef.current?.(updatedYaml !== '', updatedYaml);
      }, 500),
    [onChangeRef]
  );

  const verifyIncomingJSON = (jsonObj?: Record<string, any>): void => {
    const sanitizedJSONObj = jsonObj ? sanitize(jsonObj, yamlSanityConfig) : null;

    if (sanitizedJSONObj && Object.keys(sanitizedJSONObj).length > 0) {
      const yamlEqOfJSON = yamlStringify(sanitizedJSONObj);
      const sanitizedYAML = yamlEqOfJSON.replace(': null\n', ': \n');
      setCurrentYaml(sanitizedYAML);
      currentYamlRef.current = sanitizedYAML;
    } else {
      setCurrentYaml('');
      currentYamlRef.current = '';
      setYamlValidationErrors(new Map());
    }
  };

  React.useEffect(() => {
    if (schema) {
      configureMonacoYaml(monaco, {
        enableSchemaRequest: true,
        schemas: [
          {
            uri: schema.$id,
            fileMatch: ['*'],
            schema
          }
        ]
      });
    }
  }, [schema]);

  const throttledOnResize = React.useMemo(
    () =>
      throttle(() => {
        editorRef.current?.layout();
      }, 500),
    []
  );

  React.useEffect(() => {
    window.addEventListener('resize', throttledOnResize);
    return () => {
      window.removeEventListener('resize', throttledOnResize);
    };
  }, []);

  React.useEffect(() => {
    verifyIncomingJSON(existingJSON);
  }, [JSON.stringify(existingJSON)]);

  const ErrorSummary = memo(({ errorMap }: { errorMap?: Map<number, string> }): JSX.Element => {
    const errors: JSX.Element[] = [];
    errorMap?.forEach((value, key) => {
      const error = (
        <li className={css.item} title={value} key={key}>
          {getString('yamlBuilder.lineNumberLabel')}&nbsp;
          {key},&nbsp;
          {truncate(value, { length: MAX_ERR_MSSG_LENGTH })}
        </li>
      );
      errors.push(error);
    });

    return (
      <div className={css.errorSummary}>
        <ol className={css.errorList}>{errors}</ol>
      </div>
    );
  });

  ErrorSummary.displayName = 'ErrorSummary';

  const editorControls = React.useMemo((): React.ReactElement => {
    return (
      <Layout.Horizontal spacing="small">
        {showCopyIcon && <CopyToClipboard content={defaultTo(currentYamlRef.current, '')} showFeedback={true} />}
      </Layout.Horizontal>
    );
  }, [showCopyIcon]);

  const renderHeader = React.useCallback((): JSX.Element => {
    return (
      <Layout.Horizontal
        spacing="small"
        flex={{
          alignItems: 'center'
        }}
        className={css.header}
        width="100%"
      >
        <Layout.Horizontal spacing="small" flex={{ alignItems: 'center' }}>
          <span className={cx(css.filePath, css.flexCenter, { [css.lightBg]: theme === 'DARK' })}>{fileName}</span>
          <Container padding={{ left: 'small' }}>{editorControls}</Container>
        </Layout.Horizontal>
        {!isReadOnlyMode && yamlValidationErrors && yamlValidationErrors.size > 0 && (
          <div className={cx(css.flexCenter, css.validationStatus)}>
            <Popover
              interactionKind={PopoverInteractionKind.HOVER}
              position={PopoverPosition.TOP}
              content={<ErrorSummary errorMap={yamlValidationErrors} />}
              popoverClassName={css.summaryPopover}
            >
              <Layout.Horizontal flex spacing="xsmall">
                <Icon name="main-issue-filled" size={14} className={css.validationIcon} />
                <span className={css.invalidYaml}>{getString('invalidText')}</span>
              </Layout.Horizontal>
            </Popover>
          </div>
        )}
      </Layout.Horizontal>
    );
  }, [ErrorSummary, isReadOnlyMode]);

  return (
    <div className={cx(customCss, { [css.main]: displayBorder }, { [css.darkBg]: theme === 'DARK' })}>
      <div className={css.editor}>
        <Container
          flex={{ justifyContent: 'space-between' }}
          className={css.headerBorder}
          margin={{ left: !renderCustomHeader && 'xlarge', right: !renderCustomHeader && 'xlarge' }}
          padding={
            renderCustomHeader
              ? { top: 'small', right: 'medium', bottom: 'small', left: 'xlarge' }
              : { right: 'medium' }
          }
        >
          {defaultTo(renderCustomHeader, renderHeader)()}
        </Container>
        <MonacoEditor
          name={fileName}
          width={width}
          height={defaultTo(height, DEFAULT_EDITOR_HEIGHT)}
          language="yaml"
          value={currentYaml}
          onChange={onYamlChange}
          theme={theme}
          alwaysShowDarkTheme={theme === 'DARK'}
          options={
            {
              readOnly: defaultTo(isReadOnlyMode, !isEditModeSupported),
              wordBasedSuggestions: false,
              scrollBeyondLastLine: false,
              fontFamily: "'Roboto Mono', monospace",
              fontSize: 13,
              minimap: {
                enabled: false
              },
              codeLens: codeLensRegistrations.current.size > 0,
              tabSize: 2
            } as MonacoEditorProps['options']
          }
          ref={editorRef}
        />
      </div>
    </div>
  );
}

export default withErrorBoundary(YAMLBuilder, { FallbackComponent: Fallback });
