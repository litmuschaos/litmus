import { Button, ButtonVariation, Text, Layout, Container, RadioButtonGroup, FormInput } from '@harnessio/uicore';
import React, { FormEvent } from 'react';
import { Color, FontVariation } from '@harnessio/design-system';
import type { ApolloQueryResult, MutationFunction } from '@apollo/client';
import { useHistory, useParams } from 'react-router-dom';
import { Form, FormikProps, Formik } from 'formik';
import { defaultTo } from 'lodash-es';
import DefaultLayout from '@components/DefaultLayout';
import RbacButton from '@components/RbacButton';
import { PermissionGroup } from '@models';
import {
  AddImageRegistryRequest,
  CreateImageRegistryResponse,
  GetImageRegistryResponse,
  ImageRegistry,
  ImageRegistryInfo,
  ImageRegistryType,
  UpdateImageRegistryResponse
} from '@api/entities';
import type { GetImageRegistryRequest } from '@api/core/ImageRegistry';
import type { UpdateImageRegistryRequest } from '@api/core/ImageRegistry/updateImageRegistry';
import { useDocumentTitle, useRouteWithBaseUrl } from '@hooks';
import { useStrings } from '@strings';
import Loader from '@components/Loader';
import { cleanApolloResponse } from '@utils';
import css from './ImageRegistry.module.scss';

interface ImageRegistryViewProps {
  imageRegistryData: ImageRegistry | undefined;
  addImageRegistryMutation: MutationFunction<CreateImageRegistryResponse, AddImageRegistryRequest>;
  updateImageRegistryMutation: MutationFunction<UpdateImageRegistryResponse, UpdateImageRegistryRequest>;
  listImageRegistryRefetch: (
    variables?: Partial<GetImageRegistryRequest> | undefined
  ) => Promise<ApolloQueryResult<GetImageRegistryResponse>>;
  loading: {
    getImageRegistry: boolean;
    addImageRegistryMutationLoading: boolean;
    updateImageRegistryMutationLoading: boolean;
  };
}

export default function ImageRegistryView({
  imageRegistryData,
  addImageRegistryMutation,
  updateImageRegistryMutation,
  loading
}: ImageRegistryViewProps): React.ReactElement {
  const { getString } = useStrings();
  const history = useHistory();
  const paths = useRouteWithBaseUrl();
  const { projectID } = useParams<{ projectID: string }>();

  useDocumentTitle(getString('imageRegistry'));

  const defaultImageRegistryInfo: ImageRegistryInfo = {
    isDefault: true,
    imageRegistryName: 'docker.io',
    imageRepoName: 'litmuschaos',
    imageRegistryType: ImageRegistryType.PUBLIC,
    secretName: '',
    secretNamespace: '',
    enableRegistry: false
  };

  const initialValues: ImageRegistryInfo = cleanApolloResponse(
    defaultTo(imageRegistryData?.imageRegistryInfo, defaultImageRegistryInfo)
  ) as ImageRegistryInfo;

  const formikRef: React.Ref<FormikProps<ImageRegistryInfo>> = React.useRef(null);

  function handleSubmit(values: ImageRegistryInfo): void {
    const payload = values.isDefault
      ? { ...defaultImageRegistryInfo, enableRegistry: true }
      : { ...values, enableRegistry: true };
    imageRegistryData
      ? updateImageRegistryMutation({
          variables: {
            projectID: projectID,
            imageRegistryID: imageRegistryData.imageRegistryID,
            imageRegistryInfo: payload
          }
        })
      : addImageRegistryMutation({
          variables: {
            projectID: projectID,
            imageRegistryInfo: payload
          }
        });
  }
  return (
    <DefaultLayout
      headerToolbar={
        <Layout.Horizontal flex={{ distribution: 'space-between' }} style={{ gap: '0.5rem' }}>
          <RbacButton
            intent="primary"
            data-testid="save-image-registry"
            iconProps={{ size: 10 }}
            text={getString('save')}
            loading={
              imageRegistryData ? loading.updateImageRegistryMutationLoading : loading.addImageRegistryMutationLoading
            }
            permission={PermissionGroup.EDITOR}
            onClick={() => formikRef.current?.handleSubmit()}
          />
          <Button
            disabled={false}
            variation={ButtonVariation.SECONDARY}
            text={getString('discard')}
            onClick={() => history.push(paths.toDashboard())}
          />
        </Layout.Horizontal>
      }
      title={getString('imageRegistry')}
      breadcrumbs={[]}
    >
      <Loader loading={loading.getImageRegistry}>
        <Container
          padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}
          height="100%"
          style={{ overflowY: 'auto' }}
        >
          <Formik<ImageRegistryInfo>
            initialValues={initialValues}
            onSubmit={values => handleSubmit(values)}
            innerRef={formikRef}
            enableReinitialize
          >
            {formikProps => {
              return (
                <Form className={css.formContainer}>
                  <RadioButtonGroup
                    className={css.radioButton}
                    selectedValue={formikProps.initialValues.isDefault.toString()}
                    onChange={(e: FormEvent<HTMLInputElement>) => {
                      formikProps.setFieldValue('isDefault', e.currentTarget.value === 'true' ? true : false);
                    }}
                    options={[
                      {
                        label: (
                          <Layout.Vertical style={{ gap: '1rem' }}>
                            <Layout.Vertical style={{ gap: '0.25rem' }}>
                              <Text
                                font={{ variation: FontVariation.BODY2_SEMI, weight: 'semi-bold' }}
                                color={Color.BLACK}
                              >
                                {getString('defaultValueOption')}
                              </Text>
                              <Text font={{ size: 'small' }}>{getString('defaultValueText')}</Text>
                            </Layout.Vertical>
                            {formikProps.values.isDefault === true && (
                              <Layout.Horizontal
                                flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}
                                className={css.subCard}
                              >
                                <Layout.Vertical margin={{ right: 'huge' }}>
                                  <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
                                    {getString('registry')}:
                                  </Text>
                                  <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>
                                    {defaultImageRegistryInfo.imageRegistryName}
                                  </Text>
                                </Layout.Vertical>
                                <Layout.Vertical margin={{ right: 'huge' }}>
                                  <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
                                    {getString('repository')}:
                                  </Text>
                                  <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>
                                    {defaultImageRegistryInfo.imageRepoName}
                                  </Text>
                                </Layout.Vertical>
                                <Layout.Vertical>
                                  <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
                                    {getString('registryType')}:
                                  </Text>
                                  <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>
                                    {defaultImageRegistryInfo.imageRegistryType}
                                  </Text>
                                </Layout.Vertical>
                              </Layout.Horizontal>
                            )}
                          </Layout.Vertical>
                        ),
                        value: 'true'
                      },
                      {
                        label: (
                          <Layout.Vertical style={{ gap: '0.5rem' }}>
                            <Layout.Vertical style={{ gap: '0.25rem' }}>
                              <Text
                                font={{ variation: FontVariation.BODY2_SEMI, weight: 'semi-bold' }}
                                color={Color.BLACK}
                              >
                                {getString('customValues')}
                              </Text>
                              <Text font={{ size: 'small' }}>{getString('customValueText')}</Text>
                            </Layout.Vertical>

                            {formikProps.values.isDefault === false && (
                              <Layout.Vertical
                                flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}
                                className={css.subCard}
                              >
                                <FormInput.Text
                                  name="imageRegistryName"
                                  label={
                                    <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ top: 'small' }}>
                                      {getString('customImageRegistry')}
                                    </Text>
                                  }
                                  placeholder={getString('name')}
                                />

                                <FormInput.Text
                                  name="imageRepoName"
                                  label={
                                    <Text font={{ variation: FontVariation.FORM_LABEL }}>
                                      {getString('customRepo')}
                                    </Text>
                                  }
                                  placeholder={getString('hubRepositoryURL')}
                                />
                                <RadioButtonGroup
                                  name="imageRegistryType"
                                  label={
                                    <Text font={{ variation: FontVariation.FORM_LABEL }}>
                                      {getString('registryType')}
                                    </Text>
                                  }
                                  selectedValue={initialValues.imageRegistryType}
                                  inline={true}
                                  className={css.subRadioBtn}
                                  onChange={(e: FormEvent<HTMLInputElement>) => {
                                    formikProps.setFieldValue('imageRegistryType', e.currentTarget.value);
                                  }}
                                  options={[
                                    {
                                      label: (
                                        <Text font={{ variation: FontVariation.FORM_LABEL }}>
                                          {getString('public')}
                                        </Text>
                                      ),
                                      value: ImageRegistryType.PUBLIC
                                    },
                                    {
                                      label: (
                                        <Text font={{ variation: FontVariation.FORM_LABEL }}>
                                          {getString('private')}
                                        </Text>
                                      ),
                                      value: ImageRegistryType.PRIVATE
                                    }
                                  ]}
                                />
                                {formikProps.values.imageRegistryType === ImageRegistryType.PRIVATE && (
                                  <Layout.Vertical width={'100%'}>
                                    <FormInput.Text
                                      name="secretName"
                                      label={
                                        <Text font={{ variation: FontVariation.FORM_LABEL }} margin={{ top: 'medium' }}>
                                          {getString('imageSecret')}
                                        </Text>
                                      }
                                      placeholder={getString('imageSecretPlaceholder')}
                                    />
                                  </Layout.Vertical>
                                )}
                              </Layout.Vertical>
                            )}
                          </Layout.Vertical>
                        ),
                        value: 'false'
                      }
                    ]}
                  />
                </Form>
              );
            }}
          </Formik>
        </Container>
      </Loader>
    </DefaultLayout>
  );
}
