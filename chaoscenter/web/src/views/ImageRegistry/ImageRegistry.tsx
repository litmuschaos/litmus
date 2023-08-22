import { Button, ButtonVariation, Text, Layout, Container, RadioButtonGroup, FormInput } from '@harnessio/uicore';
import React, { FormEvent } from 'react';
import { Color, FontVariation } from '@harnessio/design-system';
import type { ApolloQueryResult, MutationFunction } from '@apollo/client';
import { useHistory, useParams } from 'react-router-dom';
import { Form, FormikProps, Formik } from 'formik';
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
import { useRouteWithBaseUrl } from '@hooks';
import { useStrings } from '@strings';
import css from './ImageRegistry.module.scss';

enum ImageRegistryValues {
  DEFAULT = 'default',
  CUSTOM = 'custom'
}

interface CustomValuesData {
  isDefault: boolean;
  imageRegistryName?: string;
  imageRegistryRepo?: string;
  registryType?: ImageRegistryType;
  secretName?: string;
}

interface ImageRegistryViewProps {
  getImageRegistryData: ImageRegistry | undefined;
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
  getImageRegistryData,
  addImageRegistryMutation,
  updateImageRegistryMutation,
  loading
}: ImageRegistryViewProps): React.ReactElement {
  const { getString } = useStrings();
  const initialValues: CustomValuesData = {
    isDefault: getImageRegistryData?.imageRegistryInfo.isDefault ?? true,
    imageRegistryName: !getImageRegistryData?.imageRegistryInfo.isDefault
      ? getImageRegistryData?.imageRegistryInfo.imageRegistryName
      : '',
    imageRegistryRepo: !getImageRegistryData?.imageRegistryInfo.isDefault
      ? getImageRegistryData?.imageRegistryInfo.imageRepoName
      : '',
    registryType: !getImageRegistryData?.imageRegistryInfo.isDefault
      ? (getImageRegistryData?.imageRegistryInfo.imageRegistryType as ImageRegistryType)
      : ImageRegistryType.PUBLIC,
    secretName: !getImageRegistryData?.imageRegistryInfo.isDefault
      ? getImageRegistryData?.imageRegistryInfo.secretName
      : ''
  };
  const history = useHistory();
  const paths = useRouteWithBaseUrl();
  const [imageRegValueType, setImageRegValuetype] = React.useState<ImageRegistryValues>(
    getImageRegistryData
      ? getImageRegistryData.imageRegistryInfo.isDefault
        ? ImageRegistryValues.DEFAULT
        : ImageRegistryValues.CUSTOM
      : ImageRegistryValues.DEFAULT
  );

  const { projectID } = useParams<{ projectID: string }>();
  const formikRef: React.Ref<FormikProps<CustomValuesData>> = React.useRef(null);

  function handleSubmit(values: CustomValuesData): void {
    const data: ImageRegistryInfo = {
      imageRegistryName: values.imageRegistryName
        ? imageRegValueType === ImageRegistryValues.DEFAULT
          ? 'docker.io'
          : values.imageRegistryName
        : '',
      imageRepoName: values.imageRegistryRepo
        ? imageRegValueType === ImageRegistryValues.DEFAULT
          ? 'litmuschaos'
          : values.imageRegistryRepo
        : '',
      imageRegistryType: values.registryType
        ? imageRegValueType === ImageRegistryValues.DEFAULT
          ? ImageRegistryType.PRIVATE
          : values.registryType
        : ImageRegistryType.PUBLIC,
      secretName: values.secretName ? (imageRegValueType === ImageRegistryValues.DEFAULT ? '' : values.secretName) : '',
      secretNamespace: values.imageRegistryName
        ? imageRegValueType === ImageRegistryValues.DEFAULT
          ? ''
          : values.imageRegistryName
        : '',
      enableRegistry: imageRegValueType === ImageRegistryValues.DEFAULT ? false : true,
      isDefault: imageRegValueType === ImageRegistryValues.DEFAULT ? true : false
    };
    getImageRegistryData
      ? updateImageRegistryMutation({
          variables: {
            projectID: projectID,
            imageRegistryID: getImageRegistryData.imageRegistryID,
            imageRegistryInfo: data
          }
        })
      : addImageRegistryMutation({
          variables: {
            projectID: projectID,
            imageRegistryInfo: data
          }
        });
  }
  return (
    <DefaultLayout
      headerToolbar={
        <Layout.Horizontal flex={{ distribution: 'space-between' }} width="12%">
          <RbacButton
            intent="primary"
            data-testid="save-image-registry"
            iconProps={{ size: 10 }}
            text={getString('save')}
            loading={
              getImageRegistryData
                ? loading.updateImageRegistryMutationLoading
                : loading.addImageRegistryMutationLoading
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
      <Container
        padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}
        height="100%"
        style={{ overflowY: 'auto' }}
      >
        <Formik<CustomValuesData>
          initialValues={initialValues}
          onSubmit={values => handleSubmit(values)}
          innerRef={formikRef}
        >
          {formikProps => {
            return (
              <Form className={css.formContainer}>
                <RadioButtonGroup
                  className={css.radioButton}
                  name="type"
                  inline={false}
                  selectedValue={
                    getImageRegistryData
                      ? getImageRegistryData?.imageRegistryInfo.isDefault
                        ? ImageRegistryValues.DEFAULT
                        : ImageRegistryValues.CUSTOM
                      : ImageRegistryValues.DEFAULT
                  }
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
                          {imageRegValueType === ImageRegistryValues.DEFAULT && (
                            <Layout.Horizontal
                              flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}
                              className={css.subCard}
                            >
                              <Layout.Vertical margin={{ right: 'huge' }}>
                                <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
                                  {getString('registry')}:
                                </Text>
                                <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>
                                  {getString('docker')}
                                </Text>
                              </Layout.Vertical>
                              <Layout.Vertical margin={{ right: 'huge' }}>
                                <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
                                  {getString('repository')}:
                                </Text>
                                <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>
                                  {getString('litmusChaos')}
                                </Text>
                              </Layout.Vertical>
                              <Layout.Vertical>
                                <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
                                  {getString('registryType')}:
                                </Text>
                                <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>
                                  {getString('public')}
                                </Text>
                              </Layout.Vertical>
                            </Layout.Horizontal>
                          )}
                        </Layout.Vertical>
                      ),
                      value: ImageRegistryValues.DEFAULT
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

                          {imageRegValueType === ImageRegistryValues.CUSTOM && (
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
                                name="imageRegistryRepo"
                                label={
                                  <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('customRepo')}</Text>
                                }
                                placeholder={getString('hubRepositoryURL')}
                              />
                              <RadioButtonGroup
                                name="registryType"
                                label={
                                  <Text font={{ variation: FontVariation.FORM_LABEL }}>
                                    {getString('registryType')}
                                  </Text>
                                }
                                selectedValue={initialValues.registryType}
                                inline={true}
                                className={css.subRadioBtn}
                                onChange={(e: FormEvent<HTMLInputElement>) => {
                                  formikProps.setFieldValue('registryType', e.currentTarget.value);
                                }}
                                options={[
                                  {
                                    label: (
                                      <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('public')}</Text>
                                    ),
                                    value: ImageRegistryType.PUBLIC
                                  },
                                  {
                                    label: (
                                      <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('private')}</Text>
                                    ),
                                    value: ImageRegistryType.PRIVATE
                                  }
                                ]}
                              />
                              {formikProps.values.registryType === ImageRegistryType.PRIVATE && (
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
                      value: ImageRegistryValues.CUSTOM
                    }
                  ]}
                  onChange={(e: FormEvent<HTMLInputElement>) => {
                    setImageRegValuetype(e.currentTarget.value as ImageRegistryValues);
                  }}
                />
              </Form>
            );
          }}
        </Formik>
        {/* </Loader> */}
      </Container>
    </DefaultLayout>
  );
}
