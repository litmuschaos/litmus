import { InputLabel, MenuItem, Select } from '@material-ui/core';
import { InputField } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  comparatorType,
  httpCiteria,
  intFloatType,
  k8sOperation,
  stringType,
} from './comparatorTypes';
import ProbesMenu from './ProbesMenu';
import useStyles from './styles';

interface ProbeDetailsProps {
  isEdit: boolean;
  setProbeData: (probeData: any) => void;
  probeData: any;
}

interface HTTPDataType {
  criteria: string;
  responseCode: string;
  body: string;
  contentType: string;
}

const ProbeDetails: React.FC<ProbeDetailsProps> = ({
  isEdit,
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
    if (e.target.name === 'url') {
      setProbeData({
        ...probeData,
        'httpProbe/inputs': {
          ...probeData['httpProbe/inputs'],
          [e.target.name]: e.target.value,
        },
      });
    }
    if (e.target.name === 'responseTimeout') {
      setProbeData({
        ...probeData,
        'httpProbe/inputs': {
          ...probeData['httpProbe/inputs'],
          [e.target.name]: parseInt(e.target.value as string, 10),
        },
      });
    }
    if (e.target.name === 'insecureSkipVerify') {
      setProbeData({
        ...probeData,
        'httpProbe/inputs': {
          ...probeData['httpProbe/inputs'],
          [e.target.name]: e.target.value === 'true',
        },
      });
    }
  };

  const handleCmd = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.target.name === 'command') {
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
    if (e.target.name === 'operation') {
      setProbeData({
        ...probeData,
        'k8sProbe/inputs': {
          ...probeData['k8sProbe/inputs'],
          [e.target.name]: e.target.value,
        },
      });
    } else if (e.target.name === 'data') {
      setProbeData({
        ...probeData,
        data: e.target.value,
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
              <span className={classes.required}>*</span>
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="url"
              name="url"
              type="text"
              required
              value={probeData['httpProbe/inputs']?.url}
              onChange={handleHttp}
            />
          </div>
          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="insecure-skip">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.insecure')}
            </InputLabel>
            <Select
              value={
                typeof probeData['httpProbe/inputs']?.insecureSkipVerify ===
                'boolean'
                  ? probeData['httpProbe/inputs']?.insecureSkipVerify.toString()
                  : probeData['httpProbe/inputs']?.insecureSkipVerify
              }
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
              type="number"
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
                  <span className={classes.required}>*</span>
                </InputLabel>
                <InputField
                  variant="primary"
                  width="50%"
                  id="body"
                  autoComplete="off"
                  name="body"
                  required
                  type="text"
                  value={
                    isEdit
                      ? probeData['httpProbe/inputs']?.method.post?.body
                      : httpData.body
                  }
                  onChange={(e) => {
                    setProbeData({
                      ...probeData,
                      'httpProbe/inputs': {
                        ...probeData['httpProbe/inputs'],
                        method: {
                          post: {
                            criteria: isEdit
                              ? probeData['httpProbe/inputs']?.method.post
                                  ?.criteria
                              : httpData.criteria,
                            responseCode: isEdit
                              ? probeData['httpProbe/inputs']?.method.post
                                  ?.responseCode
                              : httpData.responseCode,
                            body: e.target.value,
                            contentType: isEdit
                              ? probeData['httpProbe/inputs']?.method.post
                                  ?.contentType
                              : httpData.contentType,
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
                  <span className={classes.required}>*</span>
                </InputLabel>
                <InputField
                  variant="primary"
                  width="50%"
                  id="contentType"
                  name="contentType"
                  type="text"
                  required
                  autoComplete="off"
                  value={
                    isEdit
                      ? probeData['httpProbe/inputs']?.method.post?.contentType
                      : httpData.contentType
                  }
                  onChange={(e) => {
                    setProbeData({
                      ...probeData,
                      'httpProbe/inputs': {
                        ...probeData['httpProbe/inputs'],
                        method: {
                          post: {
                            criteria: isEdit
                              ? probeData['httpProbe/inputs']?.method.post
                                  ?.criteria
                              : httpData.criteria,
                            responseCode: isEdit
                              ? probeData['httpProbe/inputs']?.method.post
                                  ?.responseCode
                              : httpData.responseCode,
                            body: isEdit
                              ? probeData['httpProbe/inputs']?.method.post?.body
                              : httpData.body,
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
          <ProbesMenu
            id="criteria"
            label={t(
              'createWorkflow.tuneWorkflow.addProbe.inputLabels.criteria'
            )}
            required
            value={
              isEdit
                ? httpMethod === 'get'
                  ? probeData['httpProbe/inputs']?.method.get?.criteria
                  : probeData['httpProbe/inputs']?.method.post?.criteria
                : httpData.criteria
            }
            handleChange={(e) => {
              if (httpMethod === 'get') {
                setProbeData({
                  ...probeData,
                  'httpProbe/inputs': {
                    ...probeData['httpProbe/inputs'],
                    method: {
                      get: {
                        criteria: e.target.value,
                        responseCode: isEdit
                          ? probeData['httpProbe/inputs']?.method.get
                              ?.responseCode
                          : httpData.responseCode,
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
                        responseCode: isEdit
                          ? probeData['httpProbe/inputs']?.method.post
                              ?.responseCode
                          : httpData.responseCode,
                        body: isEdit
                          ? probeData['httpProbe/inputs']?.method.post?.body
                          : httpData.body,
                        contentType: isEdit
                          ? probeData['httpProbe/inputs']?.method.post
                              ?.contentType
                          : httpData.contentType,
                      },
                    },
                  },
                });
              }
              setHttpData({
                ...httpData,
                criteria: e.target.value as string,
              });
            }}
            valueList={httpCiteria}
          />
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="response-code">
              {t(
                'createWorkflow.tuneWorkflow.addProbe.inputLabels.responseCode'
              )}
              <span className={classes.required}>*</span>
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="response-code"
              name="responseCode"
              type="text"
              required
              autoComplete="off"
              value={
                isEdit
                  ? httpMethod === 'get'
                    ? probeData['httpProbe/inputs']?.method.get?.responseCode
                    : probeData['httpProbe/inputs']?.method.post?.responseCode
                  : httpData.responseCode
              }
              onChange={(e) => {
                if (httpMethod === 'get') {
                  setProbeData({
                    ...probeData,
                    'httpProbe/inputs': {
                      ...probeData['httpProbe/inputs'],
                      method: {
                        get: {
                          criteria: isEdit
                            ? probeData['httpProbe/inputs']?.method.get.criteria
                            : httpData.criteria,
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
                          criteria: isEdit
                            ? probeData['httpProbe/inputs']?.method.post
                                .criteria
                            : httpData.criteria,
                          responseCode: e.target.value,
                          body: isEdit
                            ? probeData['httpProbe/inputs']?.method.post.body
                            : httpData.body,
                          contentType: isEdit
                            ? probeData['httpProbe/inputs']?.method.post
                                .contentType
                            : httpData.contentType,
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
              <span className={classes.required}>*</span>
            </InputLabel>
            <InputField
              variant="primary"
              id="command"
              name="command"
              type="text"
              required
              value={probeData['cmdProbe/inputs']?.command}
              onChange={handleCmd}
            />
          </div>
          <div className={classes.inputSub}>
            {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.source')}
          </div>
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="image">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.image')}
            </InputLabel>
            <InputField
              variant="primary"
              id="image"
              name="image"
              width="50%"
              type="text"
              value={probeData['cmdProbe/inputs']?.source?.image}
              onChange={(event) => {
                setProbeData({
                  ...probeData,
                  'cmdProbe/inputs': {
                    ...probeData['cmdProbe/inputs'],
                    source: {
                      ...probeData['cmdProbe/inputs']?.source,
                      image: event.target.value,
                    },
                  },
                });
              }}
            />
          </div>
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="hostNetwork">
              {t(
                'createWorkflow.tuneWorkflow.addProbe.inputLabels.hostNetwork'
              )}
            </InputLabel>
            <Select
              style={{ width: '50%' }}
              value={probeData['cmdProbe/inputs']?.source?.hostNetwork}
              className={classes.select}
              variant="outlined"
              onChange={(event) => {
                setProbeData({
                  ...probeData,
                  'cmdProbe/inputs': {
                    ...probeData['cmdProbe/inputs'],
                    source: {
                      ...probeData['cmdProbe/inputs']?.source,
                      hostNetwork: event.target.value === 'true',
                    },
                  },
                });
              }}
              inputProps={{
                id: 'hostNetwork',
                name: 'hostNetwork',
              }}
            >
              <MenuItem value="true">true</MenuItem>
              <MenuItem value="false">false</MenuItem>
            </Select>
          </div>
          <ProbesMenu
            id="imagePullPolicy"
            label="imagePullPolicy"
            value={probeData['cmdProbe/inputs']?.source?.imagePullPolicy}
            handleChange={(e) =>
              setProbeData({
                ...probeData,
                'cmdProbe/inputs': {
                  ...probeData['cmdProbe/inputs'],
                  source: {
                    ...probeData['cmdProbe/inputs']?.source,
                    imagePullPolicy: e.target.value,
                  },
                },
              })
            }
            valueList={['Always', 'Never', 'IfNotPresent']}
          />
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="privileged">
              Privileged
            </InputLabel>
            <Select
              style={{ width: '50%' }}
              value={probeData['cmdProbe/inputs']?.source?.privileged}
              className={classes.select}
              variant="outlined"
              onChange={(event) => {
                setProbeData({
                  ...probeData,
                  'cmdProbe/inputs': {
                    ...probeData['cmdProbe/inputs'],
                    source: {
                      ...probeData['cmdProbe/inputs']?.source,
                      privileged: event.target.value === 'true',
                    },
                  },
                });
              }}
              inputProps={{
                id: 'privileged',
                name: 'privileged',
              }}
            >
              <MenuItem value="true">true</MenuItem>
              <MenuItem value="false">false</MenuItem>
            </Select>
          </div>
          <div className={classes.inputSub}>
            {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.comparator')}
          </div>
          <ProbesMenu
            id="comparator-type"
            label={t('createWorkflow.tuneWorkflow.addProbe.inputLabels.type')}
            value={probeData['cmdProbe/inputs']?.comparator?.type}
            required
            handleChange={(e) =>
              setProbeData({
                ...probeData,
                'cmdProbe/inputs': {
                  ...probeData['cmdProbe/inputs'],
                  comparator: {
                    ...probeData['cmdProbe/inputs']?.comparator,
                    type: e.target.value,
                  },
                },
              })
            }
            valueList={comparatorType}
          />

          <ProbesMenu
            id="criteria"
            label={t(
              'createWorkflow.tuneWorkflow.addProbe.inputLabels.criteria'
            )}
            required
            value={probeData['cmdProbe/inputs']?.comparator?.criteria}
            handleChange={(e) =>
              setProbeData({
                ...probeData,
                'cmdProbe/inputs': {
                  ...probeData['cmdProbe/inputs'],
                  comparator: {
                    ...probeData['cmdProbe/inputs']?.comparator,
                    criteria: e.target.value,
                  },
                },
              })
            }
            valueList={
              probeData['cmdProbe/inputs']?.comparator?.type === 'string'
                ? stringType
                : intFloatType
            }
          />

          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="value">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.value')}
              <span className={classes.required}>*</span>
            </InputLabel>
            <InputField
              variant="primary"
              id="response-code"
              name="value"
              required
              width="50%"
              type="text"
              value={probeData['cmdProbe/inputs']?.comparator?.value}
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
              <span className={classes.required}>*</span>
            </InputLabel>
            <Select
              value={probeData['k8sProbe/inputs']?.operation}
              className={classes.select}
              variant="outlined"
              required
              onChange={(e) =>
                setProbeData({
                  ...probeData,
                  'k8sProbe/inputs': {
                    ...probeData['k8sProbe/inputs'],
                    operation: e.target.value,
                  },
                })
              }
              inputProps={{
                id: 'mode',
                name: 'mode',
              }}
            >
              {k8sOperation.map((k8sData) => {
                return (
                  <MenuItem key={k8sData} value={k8sData}>
                    {k8sData}
                  </MenuItem>
                );
              })}
            </Select>
          </div>
          {probeData['k8sProbe/inputs']?.operation === 'create' && (
            <div className={classes.formField}>
              <InputLabel className={classes.formLabel} htmlFor="data">
                Data
              </InputLabel>
              <InputField
                variant="primary"
                width="70%"
                id="data"
                name="data"
                type="text"
                multiline
                value={probeData?.data}
                onChange={handleK8s}
              />
            </div>
          )}
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
              value={probeData['k8sProbe/inputs']?.group}
              onChange={handleK8s}
            />
          </div>
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="version">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.version')}
              <span className={classes.required}>*</span>
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="version"
              required
              name="version"
              type="text"
              value={probeData['k8sProbe/inputs']?.version}
              onChange={handleK8s}
            />
          </div>
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="resource">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.resource')}
              <span className={classes.required}>*</span>
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="resource"
              name="resource"
              required
              type="text"
              value={probeData['k8sProbe/inputs']?.resource}
              onChange={handleK8s}
            />
          </div>
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="namespace">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.namespace')}
              <span className={classes.required}>*</span>
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="namespace"
              required
              name="namespace"
              type="text"
              value={probeData['k8sProbe/inputs']?.namespace}
              onChange={handleK8s}
            />
          </div>
          {probeData['k8sProbe/inputs']?.operation !== 'create' && (
            <>
              <div className={classes.inputFormField}>
                <InputLabel
                  className={classes.formLabel}
                  htmlFor="field-selector"
                >
                  {t(
                    'createWorkflow.tuneWorkflow.addProbe.inputLabels.fieldSel'
                  )}
                </InputLabel>
                <InputField
                  variant="primary"
                  width="50%"
                  id="field-selector"
                  name="fieldSelector"
                  type="text"
                  value={probeData['k8sProbe/inputs']?.fieldSelector}
                  onChange={handleK8s}
                />
              </div>
              <div className={classes.inputFormField}>
                <InputLabel
                  className={classes.formLabel}
                  htmlFor="label-selector"
                >
                  {t(
                    'createWorkflow.tuneWorkflow.addProbe.inputLabels.labelSel'
                  )}
                </InputLabel>
                <InputField
                  variant="primary"
                  width="50%"
                  id="label-selector"
                  name="labelSelector"
                  type="text"
                  value={probeData['k8sProbe/inputs']?.labelSelector}
                  onChange={handleK8s}
                />
              </div>
            </>
          )}
        </>
      )}

      {probeData.type === 'promProbe' && (
        <>
          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="endpoint">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.endpoint')}
              <span className={classes.required}>*</span>
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="endpoint"
              required
              name="endpoint"
              type="text"
              value={probeData['promProbe/inputs']?.endpoint}
              onChange={handleProm}
            />
          </div>
          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="query">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.query')}
              <span className={classes.required}>*</span>
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="query"
              required
              name="query"
              type="text"
              value={probeData['promProbe/inputs']?.query}
              onChange={handleProm}
            />
          </div>
          <div className={classes.inputSub}>
            {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.comparator')}
          </div>
          <ProbesMenu
            id="comparator-type"
            required
            label={t('createWorkflow.tuneWorkflow.addProbe.inputLabels.type')}
            value={probeData['promProbe/inputs']?.comparator?.type}
            handleChange={(e) =>
              setProbeData({
                ...probeData,
                'promProbe/inputs': {
                  ...probeData['promProbe/inputs'],
                  comparator: {
                    ...probeData['promProbe/inputs']?.comparator,
                    type: e.target.value,
                  },
                },
              })
            }
            valueList={comparatorType}
          />
          <ProbesMenu
            id="criteria"
            label={t(
              'createWorkflow.tuneWorkflow.addProbe.inputLabels.criteria'
            )}
            required
            value={probeData['promProbe/inputs']?.comparator?.criteria}
            handleChange={(e) =>
              setProbeData({
                ...probeData,
                'promProbe/inputs': {
                  ...probeData['promProbe/inputs'],
                  comparator: {
                    ...probeData['promProbe/inputs']?.comparator,
                    criteria: e.target.value,
                  },
                },
              })
            }
            valueList={
              probeData['promProbe/inputs']?.comparator?.type === 'string'
                ? stringType
                : intFloatType
            }
          />
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="value">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.value')}
              <span className={classes.required}>*</span>
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="value"
              name="value"
              type="text"
              required
              value={probeData['promProbe/inputs']?.comparator?.value}
              onChange={handleProm}
            />
          </div>
        </>
      )}
    </>
  );
};

export default ProbeDetails;
