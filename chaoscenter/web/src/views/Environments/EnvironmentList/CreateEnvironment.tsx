import { Button, ButtonVariation, CardSelect, Container, FormInput, Layout, Text, useToaster } from '@harnessio/uicore';
import { FontVariation, Color } from '@harnessio/design-system';
import { Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import type { MutationFunction } from '@apollo/client';
import { DescriptionTags } from '@components/NameIdDescriptionTags/NameIdDescriptionTags';
import { useStrings } from '@strings';
import { Environment, EnvironmentType } from '@api/entities';
import type {
  CreateEnvironmentRequest,
  CreateEnvironmentResponse,
  UpdateEnvironmentRequest
} from '@api/core/environments';
import { getScope } from '@utils';
import Loader from '@components/Loader';
import css from './EnvironmentsList.module.scss';

interface CreateEnvironmentData {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  type: EnvironmentType;
}

interface CreateEnvironmentProps {
  editable?: boolean;
  environmentID?: string;
  existingEnvironment?: Environment;
  closeModal: () => void;
  mutation: {
    createEnvironment?: MutationFunction<CreateEnvironmentResponse, CreateEnvironmentRequest>;
    updateEnvironment?: MutationFunction<string, UpdateEnvironmentRequest>;
  };
  loading?: {
    getEnvironment?: boolean;
  };
}

export default function CreateEnvironment({
  editable,
  environmentID,
  mutation,
  existingEnvironment,
  loading,
  closeModal
}: CreateEnvironmentProps): React.ReactElement {
  const { getString } = useStrings();
  const scope = getScope();
  const { showError } = useToaster();
  const initialValues: CreateEnvironmentData = {
    id: editable ? environmentID ?? '' : '',
    name: editable ? existingEnvironment?.name ?? '' : '',
    description: editable ? existingEnvironment?.description ?? '' : '',
    tags: editable ? existingEnvironment?.tags ?? [] : [],
    type: editable ? existingEnvironment?.type ?? EnvironmentType.NON_PROD : EnvironmentType.NON_PROD
  };
  const environmentTypes = [
    {
      _cardName: EnvironmentType.NON_PROD,
      name: 'Pre-Production'
    },
    {
      _cardName: EnvironmentType.PROD,
      name: 'Production'
    }
  ];

  return (
    <Layout.Vertical height={'100%'} padding="small">
      <Loader loading={loading?.getEnvironment}>
        <Formik<CreateEnvironmentData>
          initialValues={initialValues}
          onSubmit={data => {
            !editable
              ? mutation.createEnvironment &&
                mutation
                  .createEnvironment({
                    variables: {
                      projectID: scope.projectID,
                      request: {
                        environmentID: data.id,
                        name: data.name,
                        description: data.description,
                        tags: data.tags,
                        type: data.type
                      }
                    }
                  })
                  .catch(() => showError(getString('alreadyExistsID', { value: data.id })))
                  .then(() => closeModal())
              : mutation.updateEnvironment &&
                environmentID &&
                mutation.updateEnvironment({
                  variables: {
                    projectID: scope.projectID,
                    request: {
                      environmentID: environmentID,
                      name: data.name,
                      description: data.description,
                      tags: data.tags,
                      type: data.type
                    }
                  }
                });
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().trim().required(getString('environmentNameIsRequired'))
          })}
        >
          {formikProps => {
            return (
              <Form style={{ height: '100%' }}>
                <Layout.Vertical height={'100%'}>
                  <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_800} margin={{ bottom: 'small' }}>
                    {editable ? 'Edit Environment' : 'New Environment'}
                  </Text>
                  <Text color={Color.GREY_700} margin={{ bottom: 'large' }}>
                    {getString('environmentDescription')}
                  </Text>
                  <div className={css.maxInputNameId}>
                    <FormInput.InputWithIdentifier
                      inputName="name"
                      idName="id"
                      isIdentifierEditable={editable ? false : true}
                      inputLabel="Environment Name"
                      inputGroupProps={{
                        placeholder: 'Environment Name',
                        className: css.maxWidthFormInput
                      }}
                    />
                  </div>
                  <DescriptionTags formikProps={formikProps} className={css.maxWidthFormInput} />
                  <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_800} margin={{ bottom: 'large' }}>
                    {getString('environmentType')}
                  </Text>
                  <CardSelect
                    selected={environmentTypes.find(objective => objective._cardName === formikProps.values.type)}
                    data={environmentTypes}
                    onChange={key => {
                      formikProps.setFieldValue('type', key._cardName);
                    }}
                    cornerSelected
                    className={css.cardContainer}
                    renderItem={item => (
                      <Container className={css.card} flex={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Text font={{ variation: FontVariation.BODY, align: 'center' }}>{item.name}</Text>
                      </Container>
                    )}
                  />
                  <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'medium'}>
                    <Button
                      disabled={false}
                      onClick={() => closeModal()}
                      variation={ButtonVariation.SECONDARY}
                      text={getString('cancel')}
                    />
                    <Button
                      onClick={() => formikProps.handleSubmit()}
                      variation={ButtonVariation.PRIMARY}
                      text={getString('save')}
                    />
                  </Layout.Horizontal>
                </Layout.Vertical>
              </Form>
            );
          }}
        </Formik>
      </Loader>
    </Layout.Vertical>
  );
}
