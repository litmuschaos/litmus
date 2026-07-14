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
            .required(getString('isRequired', { field: getString('url') })),
          method: Yup.string().oneOf(['get', 'post']).required(getString('required')),
          criteria: Yup.string().oneOf(['==', '!=', 'oneOf']).required(getString('required')),
          responseCode: Yup.number()
            .typeError(getString('useIntegerValue'))
            .positive()
            .integer()
            .required(getString('isRequired', { field: getString('responseCode') })),
          contentType: Yup.string()
            .trim()
            .when('method', {
              is: 'post',
              then: Yup.string()
                .trim()
                .required(getString('isRequired', { field: getString('contentType') }))
            }),
          body: Yup.string()
            .trim()
            .when('method', {
              is: 'post',
              then: Yup.string()
                .trim()
                .required(getString('isRequired', { field: getString('body') }))
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
                      label={getString('url')}
                      placeholder={formikProps.initialValues.url}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_http_url' }}
                    />
                    <FormInput.CheckBox
                      name="insecureSkipVerify"
                      label={getString('skipCertificateChecks')}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_http_skip_cc' }}
                    />
                    <FormInput.Select
                      name="method"
                      label={getString('method')}
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
                      label={getString('responseCode')}
                      placeholder={formikProps.initialValues.responseCode}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_http_response_code' }}
                    />
                    {formikProps.values.method === 'post' && (
                      <>
                        <FormInput.Text
                          name="contentType"
                          label={getString('contentType')}
                          placeholder={formikProps.initialValues.contentType}
                          tooltipProps={{ dataTooltipId: 'chaos_probe_http_content_type' }}
                        />
                        <FormInput.Text
                          name="body"
                          label={getString('body')}
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
            .required(getString('isRequired', { field: getString('version') })),
          resource: Yup.string()
            .trim()
            .required(getString('isRequired', { field: getString('resource') })),
          namespace: Yup.string()
            .trim()
            .required(getString('isRequired', { field: getString('namespace') })),
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
                .required(getString('isRequired', { field: getString('labelSelector') }))
            }),
          operation: Yup.string().oneOf(['create', 'delete', 'present', 'absent']).required(getString('required')),
          data: Yup.string()
            .trim()
            .when('operation', {
              is: 'create',
              then: Yup.string()
                .trim()
                .required(getString('isRequired', { field: getString('data') }))
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
                      label={getString('k8sResourceGroup')}
                      placeholder={formikProps.initialValues.group}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_k8s_group' }}
                    />
                    <FormInput.Text
                      name="version"
                      label={getString('version')}
                      placeholder={formikProps.initialValues.version}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_k8s_version' }}
                    />
                    <FormInput.Text
                      name="resource"
                      label={getString('resource')}
                      placeholder={formikProps.initialValues.resource}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_k8s_resource' }}
                    />
                    <FormInput.Text
                      name="namespace"
                      label={getString('namespace')}
                      placeholder={formikProps.initialValues.namespace}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_k8s_namespace' }}
                    />
                    <FormInput.Select
                      name="operation"
                      label={getString('operation')}
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
                          label={getString('fieldSelector')}
                          placeholder={formikProps.initialValues.fieldSelector}
                          tooltipProps={{ dataTooltipId: 'chaos_probe_k8s_field_selector' }}
                        />
                        <FormInput.Text
                          name="labelSelector"
                          label={getString('labelSelector')}
                          placeholder={formikProps.initialValues.labelSelector}
                          tooltipProps={{ dataTooltipId: 'chaos_probe_k8s_label_selector' }}
                        />
                      </>
                    )}
                    {formikProps.values.operation === 'create' && (
                      <FormGroup label={getString('data')}>
                        <FileInput
                          text={fileName}
                          className={css.fileUploadBox}
                          buttonText={getString('select')}
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
            .required(getString('isRequired', { field: getString('endpoint') })),
          query: Yup.string()
            .trim()
            .required(getString('isRequired', { field: getString('query') })),
          type: Yup.string().oneOf(['int', 'float', 'string']).required(getString('required')),
          value: Yup.string()
            .trim()
            .required(getString('isRequired', { field: getString('value') })),
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
                      label={getString('query')}
                      placeholder={formikProps.initialValues.query}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_prom_query' }}
                    />
                    <FormInput.Select
                      name="type"
                      label={getString('type')}
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
                      label={getString('value')}
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
            .required(getString('isRequired', { field: getString('command') })),
          type: Yup.string().oneOf(['int', 'float', 'string']).required(getString('required')),
          value: Yup.string()
            .trim()
            .required(getString('isRequired', { field: getString('value') })),
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
                      label={getString('type')}
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
                      label={getString('value')}
                      placeholder={formikProps.initialValues.value}
                      tooltipProps={{ dataTooltipId: 'chaos_probe_cmd_value' }}
                    />
                    <FormInput.Text
                      name="source"
                      label={getString('source')}
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
