import React from 'react';
import { InputField } from 'litmus-ui';
import { MenuItem, Select, InputLabel } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';

interface ProbeDetailsProps {
  setProbeData: any;
  probeData: any;
}

const ProbeDetails: React.FC<ProbeDetailsProps> = ({
  setProbeData,
  probeData,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const handleHttp = (
    e: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | { name?: string | undefined; value: unknown }
    >
  ) => {
    if (e.target.name === 'url' || e.target.name === 'insecureSkipVerify') {
      setProbeData({
        ...probeData,
        inputs: {
          ...probeData.inputs,
          [e.target.name]: e.target.value,
        },
      });
    } else {
      setProbeData({
        ...probeData,
        inputs: {
          ...probeData.inputs,
          request: {
            ...probeData.inputs.request,
            [e.target.name as string]: e.target.value,
          },
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
        inputs: {
          ...probeData.inputs,
          [e.target.name]: e.target.value,
        },
      });
    } else {
      setProbeData({
        ...probeData,
        inputs: {
          ...probeData.inputs,
          comparator: {
            ...probeData.inputs.comparator,
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
        inputs: {
          ...probeData.inputs,
          command: {
            ...probeData.inputs.command,
            [e.target.name]: e.target.value,
          },
        },
      });
    } else {
      setProbeData({
        ...probeData,
        inputs: {
          ...probeData.inputs,
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
        inputs: {
          ...probeData.inputs,
          [e.target.name]: e.target.value,
        },
      });
    } else {
      setProbeData({
        ...probeData,
        inputs: {
          ...probeData.inputs,
          comparator: {
            ...probeData.inputs.comparator,
            [e.target.name]: e.target.value,
          },
        },
      });
    }
  };

  return (
    <>
      {probeData.type === 'http' && (
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
              value={probeData.inputs?.url}
              onChange={handleHttp}
            />
          </div>
          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="insecure-skip">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.insecure')}
            </InputLabel>
            <Select
              value={probeData.inputs?.insecureSkipVerify}
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
          <div className={classes.inputSub}>
            {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.request')}
          </div>
          <div className={classes.inputFormField}>
            <InputLabel className={classes.formLabel} htmlFor="method">
              {t('createWorkflow.tuneWorkflow.addProbe.inputLabels.method')}
            </InputLabel>
            <Select
              value={probeData.inputs?.request?.method}
              className={classes.inputSelect}
              variant="outlined"
              onChange={handleHttp}
              inputProps={{
                id: 'method',
                name: 'method',
              }}
            >
              <MenuItem value="get">GET</MenuItem>
              <MenuItem value="post">POST</MenuItem>
            </Select>
          </div>
          {probeData.inputs?.request?.method === 'post' && (
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
                  value={probeData.inputs?.request?.body}
                  onChange={handleHttp}
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
                  value={probeData.inputs?.request?.contentType}
                  onChange={handleHttp}
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
              value={probeData.inputs?.request?.criteria}
              onChange={handleHttp}
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
              value={probeData.inputs?.request?.responseCode}
              onChange={handleHttp}
            />
          </div>
        </>
      )}

      {probeData.type === 'cmd' && (
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

      {probeData.type === 'k8s' && (
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

      {probeData.type === 'prom' && (
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
