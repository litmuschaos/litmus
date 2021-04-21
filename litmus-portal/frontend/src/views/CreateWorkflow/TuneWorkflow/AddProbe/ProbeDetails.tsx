import React, { useState } from 'react';
import { InputField } from 'litmus-ui';
import { MenuItem, Select, InputLabel } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';

interface ProbeDetailsProps {
  setProbeData: any;
  probeData: any;
}

interface HTTPDataType {
  criteria: string;
  responseCode: string;
  body: string;
  contentType: string;
}

const ProbeDetails: React.FC<ProbeDetailsProps> = ({
  setProbeData,
  probeData,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [httpData, setHttpData] = useState<HTTPDataType>({
    criteria: '',
    responseCode: '',
    body: '',
    contentType: '',
  });
  const [httpMethod, setHttpMethod] = React.useState('get');

  const handleHttp = (
    e: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | { name?: string | undefined; value: unknown }
    >
  ) => {
    if (
      e.target.name === 'url' ||
      e.target.name === 'insecureSkipVerify' ||
      e.target.name === 'responseTimeout'
    ) {
      setProbeData({
        ...probeData,
        'httpProbe/inputs': {
          ...probeData['httpProbe/inputs'],
          [e.target.name]: e.target.value,
        },
      });
    }
  };

  const handleCmd = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.target.name === 'command' || e.target.name === 'source') {
      setProbeData({
        ...probeData,
        'cmdProbe/inputs': {
          ...probeData['cmdProbe/inputs'],
          [e.target.name]: e.target.value,
        },
      });
    } else {
      setProbeData({
        ...probeData,
        'cmdProbe/inputs': {
          ...probeData['cmdProbe/inputs'],
          comparator: {
            ...probeData['cmdProbe/inputs'].comparator,
            [e.target.name]: e.target.value,
          },
        },
      });
    }
  };

  const handleK8s = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.target.name !== 'operation') {
      setProbeData({
        ...probeData,
        'k8sProbe/inputs': {
          ...probeData['k8sProbe/inputs'],
          command: {
            ...probeData['k8sProbe/inputs'].command,
            [e.target.name]: e.target.value,
          },
        },
      });
    } else {
      setProbeData({
        ...probeData,
        'k8sProbe/inputs': {
          ...probeData['k8sProbe/inputs'],
          [e.target.name]: e.target.value,
        },
      });
    }
  };

  const handleProm = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.target.name === 'endpoint' || e.target.name === 'query') {
      setProbeData({
        ...probeData,
        'promProbe/inputs': {
          ...probeData['promProbe/inputs'],
          [e.target.name]: e.target.value,
        },
      });
    } else {
      setProbeData({
        ...probeData,
        'promProbe/inputs': {
          ...probeData['promProbe/inputs'],
          comparator: {
            ...probeData['promProbe/inputs'].comparator,
            [e.target.name]: e.target.value,
          },
        },
      });
    }
  };

  return (
    <>
      {probeData.type === 'httpProbe' && (
        <>
          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="url">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.url')}
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="url"
              name="url"
              type="text"
              value={probeData['httpProbe/inputs']?.url}
              onChange={handleHttp}
            />
          </div>
          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="insecure-skip">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.insecure')}
            </InputLabel>
            <Select
              value={probeData['httpProbe/inputs']?.insecureSkipVerify}
              className={classes.inputSelect}
              variant="outlined"
              onChange={handleHttp}
              inputProps={{
                id: 'insecure-skip',
                name: 'insecureSkipVerify',
              }}
            >
              <MenuItem value="true">True</MenuItem>
              <MenuItem value="false">False</MenuItem>
            </Select>
          </div>
          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="responseTimeout">
              {t(
                'createWorkflow.tuneWorkflow.addProbe.inputLabels.responseTimeout'
              )}
              (ms)
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="responseTimeout"
              name="responseTimeout"
              type="text"
              value={probeData['httpProbe/inputs']?.responseTimeout}
              onChange={handleHttp}
            />
          </div>
          <div className={classes.inputSub}>
            {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.request')}
          </div>
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="method">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.method')}
            </InputLabel>
            <Select
              value={httpMethod}
              className={classes.inputSelect}
              variant="outlined"
              onChange={(e) => {
                setHttpMethod(e.target.value as string);
              }}
              inputProps={{
                id: 'method',
                name: 'method',
              }}
            >
              <MenuItem value="get">GET</MenuItem>
              <MenuItem value="post">POST</MenuItem>
            </Select>
          </div>
          {httpMethod === 'post' && (
            <>
              <div className={classes.inputFormField}>
                <InputLabel className={classes.formLabel} htmlFor="body">
                  {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.body')}
                </InputLabel>
                <InputField
                  variant="primary"
                  width="50%"
                  id="body"
                  name="body"
                  type="text"
                  value={httpData.body}
                  onChange={(e) => {
                    setProbeData({
                      ...probeData,
                      'httpProbe/inputs': {
                        ...probeData['httpProbe/inputs'],
                        method: {
                          post: {
                            criteria: httpData.criteria,
                            responseCode: httpData.responseCode,
                            body: e.target.value,
                            contentType: httpData.contentType,
                          },
                        },
                      },
                    });
                    setHttpData({
                      ...httpData,
                      body: e.target.value,
                    });
                  }}
                />
              </div>
              <div className={classes.inputFormField}>
                <InputLabel className={classes.formLabel} htmlFor="contentType">
                  {t(
                    'createWorkflow.tuneWorkflow.addProbe.inputLabels.contentType'
                  )}
                </InputLabel>
                <InputField
                  variant="primary"
                  width="50%"
                  id="contentType"
                  name="contentType"
                  type="text"
                  value={httpData.contentType}
                  onChange={(e) => {
                    setProbeData({
                      ...probeData,
                      'httpProbe/inputs': {
                        ...probeData['httpProbe/inputs'],
                        method: {
                          post: {
                            criteria: httpData.criteria,
                            responseCode: httpData.responseCode,
                            body: httpData.body,
                            contentType: e.target.value,
                          },
                        },
                      },
                    });
                    setHttpData({
                      ...httpData,
                      contentType: e.target.value,
                    });
                  }}
                />
              </div>
            </>
          )}
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="criteria">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.criteria')}
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="criteria"
              name="criteria"
              type="text"
              value={httpData.criteria}
              onChange={(e) => {
                if (httpMethod === 'get') {
                  setProbeData({
                    ...probeData,
                    'httpProbe/inputs': {
                      ...probeData['httpProbe/inputs'],
                      method: {
                        get: {
                          criteria: e.target.value,
                          responseCode: httpData.responseCode,
                        },
                      },
                    },
                  });
                }
                if (httpMethod === 'post') {
                  setProbeData({
                    ...probeData,
                    'httpProbe/inputs': {
                      ...probeData['httpProbe/inputs'],
                      method: {
                        post: {
                          criteria: e.target.value,
                          responseCode: httpData.responseCode,
                          body: httpData.body,
                          contentType: httpData.contentType,
                        },
                      },
                    },
                  });
                }
                setHttpData({
                  ...httpData,
                  criteria: e.target.value,
                });
              }}
            />
          </div>
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="response-code">
              {t(
                'createWorkflow.tuneWorkflow.addProbe.inputLabels.responseCode'
              )}
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="response-code"
              name="responseCode"
              type="text"
              value={httpData.responseCode}
              onChange={(e) => {
                if (httpMethod === 'get') {
                  setProbeData({
                    ...probeData,
                    'httpProbe/inputs': {
                      ...probeData['httpProbe/inputs'],
                      method: {
                        get: {
                          criteria: httpData.criteria,
                          responseCode: e.target.value,
                        },
                      },
                    },
                  });
                }
                if (httpMethod === 'post') {
                  setProbeData({
                    ...probeData,
                    'httpProbe/inputs': {
                      ...probeData['httpProbe/inputs'],
                      method: {
                        post: {
                          criteria: httpData.criteria,
                          responseCode: e.target.value,
                          body: httpData.body,
                          contentType: httpData.contentType,
                        },
                      },
                    },
                  });
                }
                setHttpData({
                  ...httpData,
                  responseCode: e.target.value,
                });
              }}
            />
          </div>
        </>
      )}

      {probeData.type === 'cmdProbe' && (
        <>
          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="command">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.command')}
            </InputLabel>
            <InputField
              variant="primary"
              id="command"
              name="command"
              type="text"
              value={probeData.inputs?.command}
              onChange={handleCmd}
            />
          </div>
          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="source">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.source')}
            </InputLabel>
            <InputField
              variant="primary"
              id="source"
              name="source"
              type="text"
              value={probeData.inputs?.source}
              onChange={handleCmd}
            />
          </div>
          <div className={classes.inputSub}>
            {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.comparator')}
          </div>
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="comparator-type">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.type')}
            </InputLabel>
            <InputField
              variant="primary"
              id="comparator-type"
              name="type"
              type="text"
              value={probeData.inputs?.comparator?.type}
              onChange={handleCmd}
            />
          </div>
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="criteria">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.criteria')}
            </InputLabel>
            <InputField
              variant="primary"
              id="criteria"
              name="criteria"
              type="text"
              value={probeData.inputs?.comparator?.criteria}
              onChange={handleCmd}
            />
          </div>
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="value">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.value')}
            </InputLabel>
            <InputField
              variant="primary"
              id="response-code"
              name="value"
              type="text"
              value={probeData.inputs?.comparator?.value}
              onChange={handleCmd}
            />
          </div>
        </>
      )}

      {probeData.type === 'k8sProbe' && (
        <>
          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="operation">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.operation')}
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="operation"
              name="operation"
              type="text"
              value={probeData.inputs?.operation}
              onChange={handleK8s}
            />
          </div>
          <div className={classes.inputSub}>
            {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.command')}
          </div>
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="group">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.group')}
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="group"
              name="group"
              type="text"
              value={probeData.inputs?.command?.group}
              onChange={handleK8s}
            />
          </div>
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="version">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.version')}
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="version"
              name="version"
              type="text"
              value={probeData.inputs?.command?.version}
              onChange={handleK8s}
            />
          </div>
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="resource">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.resource')}
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="resource"
              name="resource"
              type="text"
              value={probeData.inputs?.command?.resource}
              onChange={handleK8s}
            />
          </div>
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="namespace">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.namespace')}
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="namespace"
              name="namespace"
              type="text"
              value={probeData.inputs?.command?.namespace}
              onChange={handleK8s}
            />
          </div>
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="field-selector">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.fieldSel')}
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="field-selector"
              name="fieldSelector"
              type="text"
              value={probeData.inputs?.command?.fieldSelector}
              onChange={handleK8s}
            />
          </div>
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="label-selector">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.labelSel')}
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="label-selector"
              name="labelSelector"
              type="text"
              value={probeData.inputs?.command?.labelSelector}
              onChange={handleK8s}
            />
          </div>
        </>
      )}

      {probeData.type === 'promProbe' && (
        <>
          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="endpoint">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.endpoint')}
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="endpoint"
              name="endpoint"
              type="text"
              value={probeData.inputs?.endpoint}
              onChange={handleProm}
            />
          </div>
          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="query">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.query')}
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="query"
              name="query"
              type="text"
              value={probeData.inputs?.query}
              onChange={handleProm}
            />
          </div>
          <div className={classes.inputSub}>
            {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.comparator')}
          </div>
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="criteria">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.criteria')}
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="criteria"
              name="criteria"
              type="text"
              value={probeData.inputs?.comparator?.criteria}
              onChange={handleProm}
            />
          </div>
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="value">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.value')}
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="value"
              name="value"
              type="text"
              value={probeData.inputs?.comparator?.value}
              onChange={handleProm}
            />
          </div>
        </>
      )}
    </>
  );
};

export default ProbeDetails;
