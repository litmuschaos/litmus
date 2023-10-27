import { Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { Button, ButtonVariation, Container, FormError, FormInput, Layout, Text, useToaster } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { FileInput, FormGroup } from '@blueprintjs/core';
import type { CmdProbeInputs, HTTPProbeInputs, K8sProbeInputs, PromProbeInputs } from '@models';
import { fileUpload } from '@utils';
import { useStrings } from '@strings';
import type { StepData, StepProps } from './AddProbeStepWizard';
import css from '../Probes.module.scss';

export const ProbeDetailsStep: React.FC<StepProps<StepData>> = props => {
  const { getString } = useStrings();
  const { showError } = useToaster();
  const [fileName, setFileName] = React.useState('Upload YAML File');
  const totalSteps = props.totalSteps?.();
  const currentStep = props.currentStep?.();
  const { formData, name } = props;
  if (formData.type === 'httpProbe') {
    return (
      <Formik
        initialValues={{
          url: 'https://127.0.0.1',
          insecureSkipVerify: false,
          method: 'get',
          criteria: '==',
          responseCode: '200',
          contentType: '',
          body: ''
        }}
        onSubmit={data => {
          const probeData: HTTPProbeInputs = {
            url: data.url,
            insecureSkipVerify: data.insecureSkipVerify,
            method: {}
          };
          if (data.method === 'get') {
            probeData.method = {
              get: {
                criteria: data.criteria,
                responseCode: data.responseCode
              }
            };
          } else {
            probeData.method = {
              post: {
                criteria: data.criteria,
                responseCode: data.responseCode,
                contentType: data.contentType,
                body: data.body
              }
            };
          }
          props.setFormData({ ...formData, 'httpProbe/inputs': probeData });
          props.nextStep?.({ name: name || '' });
        }}
        validationSchema={Yup.object().shape({
          url: Yup.string()
            .trim()
            .required(getString('isRequired', { field: 'URL' })),
          method: Yup.string().oneOf(['get', 'post']).required(getString('required')),
          criteria: Yup.string().oneOf(['==', '!=', 'oneOf']).required(getString('required')),
          responseCode: Yup.number()
            .typeError(getString('useIntegerValue'))
            .positive()
            .integer()
            .required(getString('isRequired', { field: 'Response code' })),
          contentType: Yup.string()
            .trim()
            .when('method', {
              is: 'post',
              then: Yup.string()
                .trim()
                .required(getString('isRequired', { field: 'Content-Type' }))
            }),
          body: Yup.string()
            .trim()
            .when('method', {
              is: 'post',
              then: Yup.string()
                .trim()
                .required(getString('isRequired', { field: 'Body' }))
            })
        })}
      >
        {formikProps => {
          return (
            <Form style={{ height: '100%' }}>
              <Layout.Vertical flex={{ distribution: 'space-between', alignItems: 'flex-start' }} height="100%">
                <Layout.Vertical spacing="medium" width={320}>
                  <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_800}>
                    {getString('probeDetails')}
                  </Text>
                  <Container
                    padding={{ top: 'large', left: 'xsmall', right: 'large', bottom: 'xsmall' }}
                    height={500}
                    style={{ overflow: 'scroll' }}
                  >
                    <FormInput.Text
                      name="url"
                      label="URL"
                      placeholder={formikProps.initialValues.url}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_http_url' }}
                    />
                    <FormInput.CheckBox
                      name="insecureSkipVerify"
                      label="Skip certificate checks"
                      tooltipProps={{ dataTooltipId: 'chaos_probe_http_skip_cc' }}
                    />
                    <FormInput.Select
                      name="method"
                      label="Method"
                      placeholder={formikProps.initialValues.method}
                      items={[
                        { label: 'GET', value: 'get' },
                        { label: 'POST', value: 'post' }
                      ]}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_http_method' }}
                    />
                    <FormInput.Select
                      name="criteria"
                      label={getString('criteria')}
                      placeholder={formikProps.initialValues.criteria}
                      items={[
                        { label: '==', value: '==' },
                        { label: '!=', value: '!=' },
                        { label: 'oneOf', value: 'oneOf' }
                      ]}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_http_criteria' }}
                    />
                    <FormInput.Text
                      name="responseCode"
                      label="Response Code"
                      placeholder={formikProps.initialValues.responseCode}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_http_response_code' }}
                    />
                    {formikProps.values.method === 'post' && (
                      <>
                        <FormInput.Text
                          name="contentType"
                          label="Content-Type"
                          placeholder={formikProps.initialValues.contentType}
                          tooltipProps={{ dataTooltipId: 'chaos_probe_http_content_type' }}
                        />
                        <FormInput.Text
                          name="body"
                          label="Body"
                          placeholder={formikProps.initialValues.body}
                          tooltipProps={{ dataTooltipId: 'chaos_probe_http_body' }}
                        />
                      </>
                    )}
                  </Container>
                </Layout.Vertical>
                <Layout.Horizontal spacing="medium">
                  {currentStep !== 1 && (
                    <Button
                      disabled={currentStep === 1}
                      onClick={() => props.previousStep?.({ name: props.name || '' })}
                      variation={ButtonVariation.SECONDARY}
                      icon="main-chevron-left"
                      iconProps={{ color: Color.WHITE }}
                      text={getString('previous')}
                    />
                  )}
                  <Button
                    intent="primary"
                    style={{ float: 'right' }}
                    type="submit"
                    rightIcon="main-chevron-right"
                    iconProps={{ color: Color.WHITE }}
                    text={currentStep === totalSteps ? getString('setupProbe') : getString('continue')}
                  />
                </Layout.Horizontal>
              </Layout.Vertical>
            </Form>
          );
        }}
      </Formik>
    );
  } else if (formData.type === 'k8sProbe') {
    return (
      <Formik
        initialValues={{
          group: '',
          version: 'v1',
          resource: 'persistentvolumeclaims',
          namespace: 'default',
          fieldSelector: '',
          labelSelector: 'openebs.io/target-affinity=percona',
          operation: 'create',
          data: ''
        }}
        onSubmit={data => {
          const probeData: K8sProbeInputs = {
            group: data.group,
            version: data.version,
            resource: data.resource,
            namespace: data.namespace,
            fieldSelector: data.fieldSelector,
            labelSelector: data.labelSelector,
            operation: data.operation
          };

          props.setFormData({
            ...formData,
            'k8sProbe/inputs': probeData,
            data: data.operation === 'create' ? data.data : undefined
          });
          props.nextStep?.({ name: name || '' });
        }}
        validationSchema={Yup.object().shape({
          group: Yup.string().trim(),
          version: Yup.string()
            .trim()
            .required(getString('isRequired', { field: 'Version' })),
          resource: Yup.string()
            .trim()
            .required(getString('isRequired', { field: 'Resource' })),
          namespace: Yup.string()
            .trim()
            .required(getString('isRequired', { field: 'Namespace' })),
          fieldSelector: Yup.string()
            .trim()
            .when('operation', {
              is: (value: string) => ['delete', 'present', 'absent'].includes(value),
              then: Yup.string().trim()
            }),
          labelSelector: Yup.string()
            .trim()
            .when('operation', {
              is: (value: string) => ['delete', 'present', 'absent'].includes(value),
              then: Yup.string()
                .trim()
                .required(getString('isRequired', { field: 'Label Selector' }))
            }),
          operation: Yup.string().oneOf(['create', 'delete', 'present', 'absent']).required(getString('required')),
          data: Yup.string()
            .trim()
            .when('operation', {
              is: 'create',
              then: Yup.string()
                .trim()
                .required(getString('isRequired', { field: 'Data' }))
            })
        })}
      >
        {formikProps => {
          // Function to handle File upload on button click
          const onUpload = (response: string, filename?: string): void => {
            formikProps.setFieldValue('data', response, true);
            filename && setFileName(filename);
          };

          const onUploadError = (err: string): void => {
            showError(err);
          };

          return (
            <Form style={{ height: '100%' }}>
              <Layout.Vertical flex={{ distribution: 'space-between', alignItems: 'flex-start' }} height="100%">
                <Layout.Vertical spacing="medium" width={320}>
                  <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_800}>
                    {getString('probeDetails')}
                  </Text>
                  <Container
                    padding={{ top: 'large', left: 'xsmall', right: 'large', bottom: 'xsmall' }}
                    height={500}
                    style={{ overflowY: 'scroll' }}
                  >
                    <FormInput.Text
                      name="group"
                      label="Group"
                      placeholder={formikProps.initialValues.group}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_k8s_group' }}
                    />
                    <FormInput.Text
                      name="version"
                      label="Version"
                      placeholder={formikProps.initialValues.version}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_k8s_version' }}
                    />
                    <FormInput.Text
                      name="resource"
                      label="Resource"
                      placeholder={formikProps.initialValues.resource}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_k8s_resource' }}
                    />
                    <FormInput.Text
                      name="namespace"
                      label="Namespace"
                      placeholder={formikProps.initialValues.namespace}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_k8s_namespace' }}
                    />
                    <FormInput.Select
                      name="operation"
                      label="Operation"
                      placeholder={formikProps.initialValues.operation}
                      items={[
                        { label: 'Create', value: 'create' },
                        { label: 'Delete', value: 'delete' },
                        { label: 'Present', value: 'present' },
                        { label: 'Absent', value: 'absent' }
                      ]}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_k8s_operation' }}
                    />
                    {formikProps.values.operation != 'create' && (
                      <>
                        <FormInput.Text
                          name="fieldSelector"
                          label="Field Selector"
                          placeholder={formikProps.initialValues.fieldSelector}
                          tooltipProps={{ dataTooltipId: 'chaos_probe_k8s_field_selector' }}
                        />
                        <FormInput.Text
                          name="labelSelector"
                          label="Label Selector"
                          placeholder={formikProps.initialValues.labelSelector}
                          tooltipProps={{ dataTooltipId: 'chaos_probe_k8s_label_selector' }}
                        />
                      </>
                    )}
                    {formikProps.values.operation === 'create' && (
                      <FormGroup label={'Data'}>
                        <FileInput
                          text={fileName}
                          className={css.fileUploadBox}
                          buttonText="Select"
                          onInputChange={e => {
                            fileUpload(e as React.ChangeEvent<HTMLInputElement>, onUpload, onUploadError);
                          }}
                        />
                        <FormError name="data" errorMessage={formikProps.errors.data} />
                      </FormGroup>
                    )}
                  </Container>
                </Layout.Vertical>
                <Layout.Horizontal spacing="medium">
                  {currentStep !== 1 && (
                    <Button
                      disabled={currentStep === 1}
                      onClick={() => props.previousStep?.({ name: props.name || '' })}
                      variation={ButtonVariation.SECONDARY}
                      icon="main-chevron-left"
                      iconProps={{ color: Color.WHITE }}
                      text={getString('previous')}
                    />
                  )}
                  <Button
                    intent="primary"
                    style={{ float: 'right' }}
                    type="submit"
                    rightIcon="main-chevron-right"
                    iconProps={{ color: Color.WHITE }}
                    text={currentStep === totalSteps ? getString('setupProbe') : getString('continue')}
                  />
                </Layout.Horizontal>
              </Layout.Vertical>
            </Form>
          );
        }}
      </Formik>
    );
  } else if (formData.type === 'promProbe') {
    return (
      <Formik
        initialValues={{
          endpoint: '<prometheus-endpoint>',
          query: '<promql-query>',
          type: 'int',
          criteria: '>=',
          value: ''
        }}
        onSubmit={data => {
          const probeData: PromProbeInputs = {
            endpoint: data.endpoint,
            query: data.query,
            comparator: {
              type: data.type,
              criteria: data.criteria,
              value: data.value
            }
          };

          props.setFormData({
            ...formData,
            'promProbe/inputs': probeData
          });
          props.nextStep?.({ name: name || '' });
        }}
        validationSchema={Yup.object().shape({
          endpoint: Yup.string()
            .trim()
            .required(getString('isRequired', { field: 'Endpoint' })),
          query: Yup.string()
            .trim()
            .required(getString('isRequired', { field: 'Query' })),
          type: Yup.string().oneOf(['int', 'float', 'string']).required(getString('required')),
          value: Yup.string()
            .trim()
            .required(getString('isRequired', { field: 'Value' })),
          criteria: Yup.string()
            .trim()
            .when('type', {
              is: 'string',
              then: Yup.string().oneOf(['equal', 'notEqual', 'contains']).required(getString('required')),
              otherwise: Yup.string().oneOf(['>=', '<=', '==', '<', '>', '!=']).required(getString('required'))
            })
        })}
      >
        {formikProps => {
          return (
            <Form style={{ height: '100%' }}>
              <Layout.Vertical flex={{ distribution: 'space-between', alignItems: 'flex-start' }} height="100%">
                <Layout.Vertical spacing="medium" width={320}>
                  <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_800}>
                    {getString('probeDetails')}
                  </Text>
                  <Container
                    padding={{ top: 'large', left: 'xsmall', right: 'large', bottom: 'xsmall' }}
                    height={500}
                    style={{ overflowY: 'scroll' }}
                  >
                    <FormInput.Text
                      name="endpoint"
                      label={getString('endpoint')}
                      placeholder={formikProps.initialValues.endpoint}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_prom_endpoint' }}
                    />
                    <FormInput.Text
                      name="query"
                      label="Query"
                      placeholder={formikProps.initialValues.query}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_prom_query' }}
                    />
                    <FormInput.Select
                      name="type"
                      label="Type"
                      placeholder={formikProps.initialValues.type}
                      items={[
                        { label: 'int', value: 'int' },
                        { label: 'float', value: 'float' },
                        { label: 'string', value: 'string' }
                      ]}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_prom_type' }}
                    />
                    <FormInput.Select
                      name="criteria"
                      label={getString('criteria')}
                      placeholder={formikProps.initialValues.criteria}
                      items={
                        formikProps.values.type === 'string'
                          ? [
                              { label: 'equal', value: 'equal' },
                              { label: 'notEqual', value: 'notEqual' },
                              { label: 'contains', value: 'contains' }
                            ]
                          : [
                              { label: '>=', value: '>=' },
                              { label: '<=', value: '<=' },
                              { label: '==', value: '==' },
                              { label: '>', value: '>' },
                              { label: '<', value: '<' },
                              { label: '!=', value: '!=' }
                            ]
                      }
                      tooltipProps={{ dataTooltipId: 'chaos_probe_prom_criteria' }}
                    />
                    <FormInput.Text
                      name="value"
                      label="Value"
                      placeholder={formikProps.initialValues.value}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_prom_value' }}
                    />
                  </Container>
                </Layout.Vertical>
                <Layout.Horizontal spacing="medium">
                  {currentStep !== 1 && (
                    <Button
                      disabled={currentStep === 1}
                      onClick={() => props.previousStep?.({ name: props.name || '' })}
                      variation={ButtonVariation.SECONDARY}
                      icon="main-chevron-left"
                      iconProps={{ color: Color.WHITE }}
                      text={getString('previous')}
                    />
                  )}
                  <Button
                    intent="primary"
                    style={{ float: 'right' }}
                    type="submit"
                    rightIcon="main-chevron-right"
                    iconProps={{ color: Color.WHITE }}
                    text={currentStep === totalSteps ? getString('setupProbe') : getString('continue')}
                  />
                </Layout.Horizontal>
              </Layout.Vertical>
            </Form>
          );
        }}
      </Formik>
    );
  } else if (formData.type === 'cmdProbe') {
    return (
      <Formik
        initialValues={{
          command: '<command>',
          type: 'int',
          criteria: '==',
          value: '',
          source: 'inline'
        }}
        onSubmit={data => {
          const probeData: CmdProbeInputs = {
            command: data.command,
            comparator: {
              type: data.type,
              criteria: data.criteria,
              value: data.value
            },
            source: undefined
          };
          props.setFormData({
            ...formData,
            'cmdProbe/inputs': probeData
          });
          props.nextStep?.({ name: name || '' });
        }}
        validationSchema={Yup.object().shape({
          command: Yup.string()
            .trim()
            .required(getString('isRequired', { field: 'Command' })),
          type: Yup.string().oneOf(['int', 'float', 'string']).required(getString('required')),
          value: Yup.string()
            .trim()
            .required(getString('isRequired', { field: 'Value' })),
          criteria: Yup.string()
            .trim()
            .when('type', {
              is: 'string',
              then: Yup.string().oneOf(['equal', 'notEqual', 'contains']).required(getString('required')),
              otherwise: Yup.string().oneOf(['>=', '<=', '==', '<', '>', '!=']).required(getString('required'))
            })
        })}
      >
        {formikProps => {
          return (
            <Form style={{ height: '100%' }}>
              <Layout.Vertical flex={{ distribution: 'space-between', alignItems: 'flex-start' }} height="100%">
                <Layout.Vertical spacing="medium" width={320}>
                  <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_800}>
                    {getString('probeDetails')}
                  </Text>
                  <Container
                    padding={{ top: 'large', left: 'xsmall', right: 'large', bottom: 'xsmall' }}
                    height={500}
                    style={{ overflowY: 'scroll' }}
                  >
                    <FormInput.Text
                      name="command"
                      label={getString('command')}
                      placeholder={formikProps.initialValues.command}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_cmd_command' }}
                    />
                    <FormInput.Select
                      name="type"
                      label="Type"
                      placeholder={formikProps.initialValues.type}
                      items={[
                        { label: 'int', value: 'int' },
                        { label: 'float', value: 'float' },
                        { label: 'string', value: 'string' }
                      ]}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_cmd_type' }}
                    />
                    <FormInput.Select
                      name="criteria"
                      label={getString('criteria')}
                      placeholder={formikProps.initialValues.criteria}
                      items={
                        formikProps.values.type === 'string'
                          ? [
                              { label: 'equal', value: 'equal' },
                              { label: 'notEqual', value: 'notEqual' },
                              { label: 'contains', value: 'contains' }
                            ]
                          : [
                              { label: '>=', value: '>=' },
                              { label: '<=', value: '<=' },
                              { label: '==', value: '==' },
                              { label: '>', value: '>' },
                              { label: '<', value: '<' },
                              { label: '!=', value: '!=' }
                            ]
                      }
                      tooltipProps={{ dataTooltipId: 'chaos_probe_cmd_criteria' }}
                    />
                    <FormInput.Text
                      name="value"
                      label="Value"
                      placeholder={formikProps.initialValues.value}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_cmd_value' }}
                    />
                    <FormInput.Text
                      name="source"
                      label="Source"
                      placeholder={formikProps.initialValues.source}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_cmd_source' }}
                      disabled
                    />
                  </Container>
                </Layout.Vertical>
                <Layout.Horizontal spacing="medium">
                  {currentStep !== 1 && (
                    <Button
                      disabled={currentStep === 1}
                      onClick={() => props.previousStep?.({ name: props.name || '' })}
                      variation={ButtonVariation.SECONDARY}
                      icon="main-chevron-left"
                      iconProps={{ color: Color.WHITE }}
                      text={getString('previous')}
                    />
                  )}
                  <Button
                    intent="primary"
                    style={{ float: 'right' }}
                    type="submit"
                    rightIcon="main-chevron-right"
                    iconProps={{ color: Color.WHITE }}
                    text={currentStep === totalSteps ? getString('setupProbe') : getString('continue')}
                  />
                </Layout.Horizontal>
              </Layout.Vertical>
            </Form>
          );
        }}
      </Formik>
    );
  } else return <></>;
};
