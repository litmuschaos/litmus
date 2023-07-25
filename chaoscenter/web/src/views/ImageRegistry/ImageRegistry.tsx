import { Button, ButtonVariation, Text, Layout, Container, RadioButtonGroup, FormInput } from '@harnessio/uicore';
import React, { FormEvent } from 'react';
import { Color, FontVariation } from '@harnessio/design-system';
import { Form, Formik } from 'formik';
import DefaultLayout from '@components/DefaultLayout';
import RbacButton from '@components/RbacButton';
import { PermissionGroup } from '@models';
import { ImageRegistryInfo, ImageRegistryType, RepoType } from '@api/entities';
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
  getImageRegistryData: ImageRegistryInfo;
  loading: {
    getImageRegistry: boolean;
  };
}

export default function ImageRegistryView({ getImageRegistryData }: ImageRegistryViewProps): React.ReactElement {
  const initialValues: CustomValuesData = {
    isDefault: getImageRegistryData.isDefault,
    imageRegistryName: !getImageRegistryData?.isDefault ? getImageRegistryData?.imageRegistryName : '',
    imageRegistryRepo: !getImageRegistryData?.isDefault ? getImageRegistryData?.imageRepoName : '',
    registryType: !getImageRegistryData?.isDefault
      ? (getImageRegistryData?.imageRegistryType as ImageRegistryType)
      : ImageRegistryType.PUBLIC,
    secretName: !getImageRegistryData?.isDefault ? getImageRegistryData?.secretName : ''
  };

  const [imageRegValueType, setImageRegValuetype] = React.useState<ImageRegistryValues>(
    !getImageRegistryData?.isDefault ? ImageRegistryValues.CUSTOM : ImageRegistryValues.DEFAULT
  );
  return (
    <DefaultLayout
      headerToolbar={
        <Layout.Horizontal flex={{ distribution: 'space-between' }} width="12%">
          <RbacButton
            intent="primary"
            data-testid="save-image-registry"
            iconProps={{ size: 10 }}
            text="Save"
            permission={PermissionGroup.EDITOR}
          />
          <Button disabled={false} variation={ButtonVariation.SECONDARY} text="Discard" />
        </Layout.Horizontal>
      }
      title="Image Registry"
      breadcrumbs={[]}
      //   subHeader={}
    >
      <Container
        padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}
        height="100%"
        style={{ overflowY: 'auto' }}
      >
        <Formik initialValues={initialValues} onSubmit={() => console.log('')}>
          {formikProps => {
            return (
              <Form className={css.formContainer}>
                <RadioButtonGroup
                  className={css.radioButton}
                  name="type"
                  inline={false}
                  selectedValue={
                    getImageRegistryData?.isDefault ? ImageRegistryValues.DEFAULT : ImageRegistryValues.CUSTOM
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
                              Use Default Values
                            </Text>
                            <Text font={{ size: 'small' }}>
                              All YAML files use these default values provided by Litmus. The values cannot be changed.
                            </Text>
                          </Layout.Vertical>
                          {imageRegValueType === ImageRegistryValues.DEFAULT && (
                            <Layout.Horizontal
                              flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}
                              className={css.subCard}
                            >
                              <Layout.Vertical margin={{ right: 'huge' }}>
                                <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
                                  Registry:
                                </Text>
                                <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>docker.io</Text>
                              </Layout.Vertical>
                              <Layout.Vertical margin={{ right: 'huge' }}>
                                <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
                                  Repository:
                                </Text>
                                <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>litmuschaos</Text>
                              </Layout.Vertical>
                              <Layout.Vertical>
                                <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
                                  Registry Type:
                                </Text>
                                <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>public</Text>
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
                              Use Custom Values
                            </Text>
                            <Text font={{ size: 'small' }}>
                              All YAML files use these default values provided by Litmus. The values cannot be changed.
                            </Text>
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
                                    Custom Image Registry
                                  </Text>
                                }
                                placeholder="Custom Name"
                              />

                              <FormInput.Text
                                name="imageRegistryRepo"
                                label={<Text font={{ variation: FontVariation.FORM_LABEL }}>Custom Repo</Text>}
                                placeholder="Repo URL"
                              />
                              <RadioButtonGroup
                                name="registryType"
                                label={<Text font={{ variation: FontVariation.FORM_LABEL }}>Registry Type</Text>}
                                selectedValue={initialValues.registryType}
                                inline={true}
                                className={css.subRadioBtn}
                                onChange={(e: FormEvent<HTMLInputElement>) => {
                                  formikProps.setFieldValue('registryType', e.currentTarget.value);
                                }}
                                options={[
                                  {
                                    label: <Text font={{ variation: FontVariation.FORM_LABEL }}>Public</Text>,
                                    value: ImageRegistryType.PUBLIC
                                  },
                                  {
                                    label: <Text font={{ variation: FontVariation.FORM_LABEL }}>Private</Text>,
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
                                        Image Secret
                                      </Text>
                                    }
                                    placeholder="Enter your Image Secret"
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
      </Container>
    </DefaultLayout>
  );
}
