import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Typography,
} from '@material-ui/core';
import { ButtonFilled, InputField } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../components/Loader';
import { constants } from '../../../constants';
import {
  GET_IMAGE_REGISTRY,
  LIST_IMAGE_REGISTRY,
  UPDATE_IMAGE_REGISTRY,
} from '../../../graphql';
import { getProjectID } from '../../../utils/getSearchParams';
import useStyles from './styles';

interface RegistryInfo {
  registry_name: string;
  repo_name: string;
  registry_type: string;
  secret_name: string;
  secret_namespace: string;
  enable_registry: boolean;
}

interface RegistryData {
  registry_name: string;
  repo_name: string;
  registry_type: string;
}

const ImageRegistry = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const projectID = getProjectID();
  const [registry, setRegistry] = useState('enabled');
  const [registryID, setRegistryID] = useState('');
  const [registryType, setRegistryType] = useState('Public');
  const [isCustomRegistryEnabled, setIsCustomRegistryEnabled] = useState(false);
  /**
   * GetRegistryData to fetch Registry Data by ID
   */
  const [getRegistryData, { data, loading }] = useLazyQuery(
    GET_IMAGE_REGISTRY,
    {
      fetchPolicy: 'network-only',
    }
  );
  const [registryInfo, setRegistryInfo] = useState<RegistryInfo>({
    registry_name: '',
    repo_name: '',
    registry_type: constants.public,
    secret_name: '',
    secret_namespace: '',
    enable_registry: true,
  });
  const [registryData, setRegistryData] = useState<RegistryData>({
    registry_name: '',
    repo_name: '',
    registry_type: '',
  });
  /**
   * ListImageRegistry is used to fetch the list of image registries
   */
  const { loading: listLoading } = useQuery(LIST_IMAGE_REGISTRY, {
    variables: {
      data: projectID,
    },
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      setRegistryID(data.ListImageRegistry[0].image_registry_id);
      getRegistryData({
        variables: {
          registryid: data.ListImageRegistry[0].image_registry_id,
          projectid: projectID,
        },
      });
    },
  });

  /**
   * UpdateImageRegistry is used to update the Image Registry
   */
  const [updateImageRegistry, { loading: updateLoader }] = useMutation(
    UPDATE_IMAGE_REGISTRY,
    {
      onCompleted: (data) => {
        if (
          data.updateImageRegistry.image_registry_info.image_repo_name ===
          'litmuschaos'
        ) {
          setIsCustomRegistryEnabled(false);
          setRegistry('disabled');
        } else {
          setIsCustomRegistryEnabled(true);
          setRegistry('enabled');
        }
        setRegistryData({
          registry_name:
            data.updateImageRegistry.image_registry_info.image_registry_name,
          repo_name:
            data.updateImageRegistry.image_registry_info.image_repo_name,
          registry_type:
            data.updateImageRegistry.image_registry_info.image_registry_type,
        });
      },
    }
  );

  /**
   * UseEffect to set the initial data of image registry
   */
  useEffect(() => {
    if (data !== undefined) {
      if (
        data.GetImageRegistry.image_registry_info.image_repo_name ===
        constants.litmus
      ) {
        setRegistry('disabled');
        setIsCustomRegistryEnabled(false);
        setRegistryData({
          registry_name: constants.docker,
          repo_name: constants.litmus,
          registry_type: constants.public,
        });
      } else {
        setRegistry('enabled');
        setIsCustomRegistryEnabled(true);
        setRegistryData({
          registry_name:
            data.GetImageRegistry.image_registry_info.image_registry_name,
          repo_name: data.GetImageRegistry.image_registry_info.image_repo_name,
          registry_type:
            data.GetImageRegistry.image_registry_info.image_registry_type,
        });
      }
    }
  }, [data]);

  /**
   * HandleSubmit is used to update the image registry to custom registry
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateImageRegistry({
      variables: {
        imageRegistryID: registryID,
        projectID,
        imageRegistryInfo: {
          image_registry_name: registryInfo.registry_name,
          image_repo_name: registryInfo.repo_name,
          image_registry_type: registryInfo.registry_type,
          secret_name: registryInfo.secret_name,
          secret_namespace: registryInfo.secret_namespace,
          enable_registry: true,
        },
      },
    });
  };

  return (
    <div className={classes.container}>
      <Typography className={classes.headerText}>
        {t('settings.imageRegistry.heading')}
      </Typography>
      <Typography className={classes.headerDesc}>
        {t('settings.imageRegistry.headingDesc')}
      </Typography>

      {listLoading && loading ? (
        <>
          <Loader />
        </>
      ) : (
        <form id="login-form" autoComplete="on" onSubmit={handleSubmit}>
          <FormControl component="fieldset" style={{ width: '70%' }}>
            <RadioGroup
              name="image-registry"
              value={registry}
              onChange={(event) => {
                setRegistry(event.target.value);
              }}
            >
              <div className={classes.mainRadioDiv}>
                <FormControlLabel
                  value="disabled"
                  control={
                    <Radio
                      classes={{
                        root: classes.radio,
                        checked: classes.checked,
                      }}
                    />
                  }
                  data-cy="localRadioButton"
                  label={
                    <Typography className={classes.defaultText}>
                      {t('settings.imageRegistry.defaultValues')}
                    </Typography>
                  }
                />
                <Typography className={classes.defaultTextDesc}>
                  {t('settings.imageRegistry.defaultText')}
                </Typography>
                <div className={classes.registryInfoDiv}>
                  <Typography className={classes.registryInfoText}>
                    {t('settings.imageRegistry.registry')}
                    <strong> {t('settings.imageRegistry.dockerio')}</strong>
                  </Typography>
                  <Typography className={classes.registryInfoText}>
                    {t('settings.imageRegistry.repo')}
                    <strong> {t('settings.imageRegistry.litmus')}</strong>
                  </Typography>
                  <Typography className={classes.registryInfoText}>
                    {t('settings.imageRegistry.repoType')}
                    <strong> {t('settings.imageRegistry.public')}</strong>
                  </Typography>
                </div>

                {registry === 'disabled' && isCustomRegistryEnabled === true ? (
                  <div>
                    <ButtonFilled
                      className={classes.defaultBtn}
                      data-cy="disableGitopsButton"
                      disabled={updateLoader}
                      onClick={() =>
                        updateImageRegistry({
                          variables: {
                            imageRegistryID: registryID,
                            projectID,
                            imageRegistryInfo: {
                              image_registry_name: constants.dockerio,
                              image_repo_name: constants.litmus,
                              image_registry_type: constants.public,
                              secret_name: '',
                              secret_namespace: '',
                              enable_registry: true,
                            },
                          },
                        })
                      }
                    >
                      {t('settings.imageRegistry.defaultReg')}
                    </ButtonFilled>
                  </div>
                ) : null}
              </div>
              <div className={classes.mainRadioDiv}>
                <FormControlLabel
                  value="enabled"
                  control={
                    <Radio
                      classes={{
                        root: classes.radio,
                        checked: classes.checked,
                      }}
                    />
                  }
                  data-cy="localRadioButton"
                  label={
                    <Typography className={classes.defaultText}>
                      {t('settings.imageRegistry.customValues')}
                    </Typography>
                  }
                />

                {isCustomRegistryEnabled ? (
                  <>
                    <div className={classes.registryInfoDiv}>
                      <Typography className={classes.registryInfoText}>
                        {t('settings.imageRegistry.registry')}
                        <strong>{registryData.registry_name}</strong>
                      </Typography>
                      <Typography className={classes.registryInfoText}>
                        {t('settings.imageRegistry.repo')}
                        <strong>{registryData.repo_name}</strong>
                      </Typography>
                      <Typography className={classes.registryInfoText}>
                        {t('settings.imageRegistry.repoType')}
                        <strong>{registryData.registry_type}</strong>
                      </Typography>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={classes.customDiv}>
                      <InputField
                        label="Custom Image Registry"
                        value={registryInfo.registry_name}
                        className={classes.inputDiv}
                        onChange={(event) => {
                          setRegistryInfo({
                            ...registryInfo,
                            registry_name: event.target.value,
                          });
                        }}
                      />

                      <InputField
                        label="Custom Image Repository"
                        value={registryInfo.repo_name}
                        onChange={(event) => {
                          setRegistryInfo({
                            ...registryInfo,
                            repo_name: event.target.value,
                          });
                        }}
                      />
                    </div>
                    <FormControl
                      variant="outlined"
                      className={classes.formControl}
                    >
                      <InputLabel
                        className={classes.labelText}
                        id="demo-simple-select-helper-label"
                      >
                        {t('settings.imageRegistry.registryLabel')}
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-helper-label"
                        id="demo-simple-select-helper"
                        value={registryType}
                        onChange={(event) => {
                          setRegistryType(event.target.value as string);
                          setRegistryInfo({
                            ...registryInfo,
                            registry_type: event.target.value as string,
                          });
                        }}
                        label="Registry Type"
                      >
                        <MenuItem value="Public">
                          {t('settings.imageRegistry.public')}
                        </MenuItem>
                        <MenuItem value="Private">
                          {t('settings.imageRegistry.private')}
                        </MenuItem>
                      </Select>
                    </FormControl>
                    <br />
                    {registryType === 'Private' && (
                      <>
                        <hr />
                        <Typography className={classes.additionalDetails}>
                          {t('settings.imageRegistry.additionalInfo')}
                        </Typography>
                        <div className={classes.customDiv}>
                          <InputField
                            label="Custom Image Secret"
                            value={registryInfo.secret_name}
                            className={classes.inputDiv}
                            onChange={(event) => {
                              setRegistryInfo({
                                ...registryInfo,
                                secret_name: event.target.value,
                              });
                            }}
                          />
                          <InputField
                            label="Secret Namespace"
                            value={registryInfo.secret_namespace}
                            onChange={(event) => {
                              setRegistryInfo({
                                ...registryInfo,
                                secret_namespace: event.target.value,
                              });
                            }}
                          />
                        </div>
                        <br />
                      </>
                    )}
                    <ButtonFilled
                      disabled={
                        registry === 'disabled' ||
                        registryInfo.registry_name.trim().length === 0 ||
                        registryInfo.repo_name.trim().length === 0
                      }
                      type="submit"
                    >
                      {t('settings.imageRegistry.save')}
                    </ButtonFilled>
                  </>
                )}
              </div>
            </RadioGroup>
          </FormControl>
        </form>
      )}
    </div>
  );
};

export default ImageRegistry;
