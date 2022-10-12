import { Drawer, InputLabel, MenuItem, Select } from '@material-ui/core';
import { ButtonFilled, ButtonOutlined, InputField } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { validateProbeName } from '../../../../utils/validate';
import ProbeDetails from './ProbeDetails';
import useStyles from './styles';

interface AddProbeProps {
  isEdit: boolean;
  editIndex: number;
  addButtonState: boolean;
  allProbesData: any;
  probesValue: any;
  addProbe: (probes: any) => void;
  handleClose: () => void;
  open: boolean;
}

interface RunProperties {
  probeTimeout: string;
  retry: string;
  interval: string;
  probePollingInterval: string;
  initialDelaySeconds: string;
  stopOnFailure: boolean;
}

const AddProbe: React.FC<AddProbeProps> = ({
  isEdit,
  editIndex,
  allProbesData,
  probesValue,
  addButtonState,
  addProbe,
  handleClose,
  open,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [allProbes, setAllProbes] = React.useState<any>(allProbesData ?? []); // Used for validation
  const [probeType, setProbeType] = React.useState('httpProbe/inputs');

  const [runProperties, setRunProperties] = React.useState<any>({
    probeTimeout: '',
    retry: '',
    interval: '',
    probePollingInterval: '',
    initialDelaySeconds: '',
    stopOnFailure: false,
  });

  const [probeData, setProbeData] = React.useState({
    name: '',
    type: 'httpProbe',
    mode: 'Continuous',
    runProperties: {
      probeTimeout: '',
      retry: '',
      interval: '',
      probePollingInterval: '',
      initialDelaySeconds: '',
      stopOnFailure: false,
    },
    'httpProbe/inputs': {},
  });

  React.useEffect(() => {
    if (allProbes.length !== 0) {
      setProbeData(probesValue);
      setRunProperties(probesValue.runProperties);
      setProbeType(`${probesValue.type}/inputs`);
      if (addButtonState) {
        setProbeData({
          name: '',
          type: 'httpProbe',
          mode: 'Continuous',
          runProperties: {
            probeTimeout: '',
            retry: '',
            interval: '',
            probePollingInterval: '',
            initialDelaySeconds: '',
            stopOnFailure: false,
          },
          'httpProbe/inputs': {},
        });
        setRunProperties({
          probeTimeout: '',
          retry: '',
          interval: '',
          probePollingInterval: '',
          initialDelaySeconds: '',
          stopOnFailure: false,
        });
      }
    }
  }, [addButtonState, probesValue]);

  const handleRunProps = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRunProperties({
      ...runProperties,
      [e.target.name]: parseInt(e.target.value, 10),
    });
  };

  const renameKey = (object: any, key: string) => {
    const clonedObj = { ...object };
    delete clonedObj[key];
    return clonedObj;
  };

  const onTypeChange = (
    e: React.ChangeEvent<{
      name?: string;
      value: unknown;
    }>
  ) => {
    const newProbe = `${e.target.value}/inputs`;
    const a = renameKey(probeData, probeType);
    setProbeData({
      ...a,
      type: e.target.value as string,
    });
    setProbeType(newProbe);
  };

  // Reset all input data on clicking close button or cancel button
  const clearData = () => {
    setProbeData({
      name: '',
      type: 'httpProbe',
      mode: 'Continuous',
      runProperties: {
        probeTimeout: '',
        retry: '',
        interval: '',
        probePollingInterval: '',
        initialDelaySeconds: '',
        stopOnFailure: false,
      },
      'httpProbe/inputs': {},
    });
    setRunProperties({
      probeTimeout: '',
      retry: '',
      interval: '',
      probePollingInterval: '',
      initialDelaySeconds: '',
      stopOnFailure: false,
    });
    setProbeType('httpProbe/inputs');
    (document.getElementById('probes-form') as HTMLFormElement).reset();
  };

  const handleAddProbe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const properties = runProperties;
    if (
      Number.isNaN(properties.initialDelaySeconds) ||
      properties.initialDelaySeconds === ''
    ) {
      delete properties.initialDelaySeconds;
    }
    if (
      Number.isNaN(properties.probePollingInterval) ||
      properties.probePollingInterval === ''
    ) {
      delete properties.probePollingInterval;
    }
    probeData['runProperties'] = properties;
    setProbeData(probeData);
    if (isEdit) {
      allProbes[editIndex] = probeData;
    } else {
      allProbes.push(probeData);
    }
    setAllProbes(allProbes);
    addProbe(allProbes);
    if (!isEdit) clearData();
  };

  return (
    <Drawer
      className={classes.drawer}
      anchor="right"
      open={open}
      classes={{
        paper: classes.drawerPaper,
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <div className={classes.modal}>
        <form
          onSubmit={handleAddProbe}
          className={classes.form}
          action="#"
          id="probes-form"
        >
          <div className={classes.heading}>
            {!addButtonState
              ? 'Edit'
              : t('createWorkflow.tuneWorkflow.addProbe.heading')}
            <strong>
              {' '}
              {t('createWorkflow.tuneWorkflow.addProbe.headingStrong')}
            </strong>
            <ButtonOutlined
              className={classes.closeButton}
              onClick={() => {
                if (!probesValue) clearData();
                handleClose();
              }}
            >
              &#x2715;
            </ButtonOutlined>
          </div>
          <div className={classes.formField}>
            <InputLabel htmlFor="name" className={classes.formLabel}>
              {t('createWorkflow.tuneWorkflow.addProbe.labels.probeName')}
            </InputLabel>
            <InputField
              id="name"
              name="name"
              type="text"
              required
              width="70%"
              value={probeData.name}
              helperText={
                !isEdit && validateProbeName(allProbes, probeData.name)
                  ? t('createWorkflow.tuneWorkflow.addProbe.validate')
                  : ''
              }
              variant={
                !isEdit && validateProbeName(allProbes, probeData.name)
                  ? 'error'
                  : 'primary'
              }
              onChange={(e) =>
                setProbeData({ ...probeData, name: e.target.value })
              }
            />
          </div>
          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="type">
              {t('createWorkflow.tuneWorkflow.addProbe.labels.probeType')}
            </InputLabel>
            <Select
              value={probeData.type}
              className={classes.select}
              variant="outlined"
              onChange={onTypeChange}
              inputProps={{
                id: 'type',
                name: 'type',
              }}
            >
              <MenuItem value="httpProbe">
                {t('createWorkflow.tuneWorkflow.addProbe.select.http')}
              </MenuItem>
              <MenuItem value="cmdProbe">
                {t('createWorkflow.tuneWorkflow.addProbe.select.cmd')}
              </MenuItem>
              <MenuItem value="k8sProbe">
                {t('createWorkflow.tuneWorkflow.addProbe.select.k8s')}
              </MenuItem>
              <MenuItem value="promProbe">
                {t('createWorkflow.tuneWorkflow.addProbe.select.prom')}
              </MenuItem>
            </Select>
          </div>
          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="mode">
              {t('createWorkflow.tuneWorkflow.addProbe.labels.probeMode')}
            </InputLabel>
            <Select
              value={probeData.mode}
              className={classes.select}
              variant="outlined"
              onChange={(e) =>
                setProbeData({
                  ...probeData,
                  mode: e.target.value as string,
                })
              }
              inputProps={{
                id: 'mode',
                name: 'mode',
              }}
            >
              <MenuItem value="SOT">
                {t('createWorkflow.tuneWorkflow.addProbe.select.sot')}
              </MenuItem>
              <MenuItem value="EOT">
                {t('createWorkflow.tuneWorkflow.addProbe.select.eot')}
              </MenuItem>
              <MenuItem value="Edge">
                {t('createWorkflow.tuneWorkflow.addProbe.select.edge')}
              </MenuItem>
              <MenuItem value="Continuous">
                {t('createWorkflow.tuneWorkflow.addProbe.select.continuous')}
              </MenuItem>
              <MenuItem value="OnChaos">
                {t('createWorkflow.tuneWorkflow.addProbe.select.onchaos')}
              </MenuItem>
            </Select>
          </div>
          <hr className={classes.line} />

          <div className={classes.subHeading}>
            {t('createWorkflow.tuneWorkflow.addProbe.labels.probeProp')}
          </div>

          <div className={classes.detailContainer}>
            <div className={classes.formField}>
              <InputLabel className={classes.formLabel} htmlFor="timeout">
                {t('createWorkflow.tuneWorkflow.addProbe.labels.timeout')}(sec)
                <span className={classes.required}>*</span>
              </InputLabel>
              <InputField
                variant="primary"
                width="50%"
                id="timeout"
                name="probeTimeout"
                required
                type="number"
                value={runProperties.probeTimeout}
                onChange={handleRunProps}
              />
            </div>
            <div className={classes.formField}>
              <InputLabel className={classes.formLabel} htmlFor="retry">
                {t('createWorkflow.tuneWorkflow.addProbe.labels.retry')}(times)
                <span className={classes.required}>*</span>
              </InputLabel>
              <InputField
                variant="primary"
                width="50%"
                id="retry"
                name="retry"
                required
                type="number"
                value={runProperties.retry}
                onChange={handleRunProps}
              />
            </div>
          </div>
          <div className={classes.detailContainer}>
            <div className={classes.formField}>
              <InputLabel className={classes.formLabel} htmlFor="interval">
                {t('createWorkflow.tuneWorkflow.addProbe.labels.interval')}(sec)
                <span className={classes.required}>*</span>
              </InputLabel>
              <InputField
                variant="primary"
                width="50%"
                id="interval"
                required
                name="interval"
                type="number"
                value={runProperties.interval}
                onChange={handleRunProps}
              />
            </div>
            {probeData.mode === 'Continuous' || probeData.mode === 'OnChaos' ? (
              <div className={classes.formField}>
                <InputLabel className={classes.formLabel} htmlFor="polling">
                  {t('createWorkflow.tuneWorkflow.addProbe.labels.polling')}
                  (sec)
                </InputLabel>
                <InputField
                  variant="primary"
                  width="50%"
                  id="polling"
                  name="probePollingInterval"
                  type="number"
                  value={runProperties.probePollingInterval}
                  onChange={handleRunProps}
                />
              </div>
            ) : (
              <div className={classes.formField} />
            )}
          </div>
          <div className={classes.detailContainer}>
            <div className={classes.formField}>
              <InputLabel className={classes.formLabel} htmlFor="initial-delay">
                {t('createWorkflow.tuneWorkflow.addProbe.labels.initialDelay')}
                (sec)
              </InputLabel>
              <InputField
                variant="primary"
                width="50%"
                id="initial-delay"
                name="initialDelaySeconds"
                type="number"
                value={runProperties.initialDelaySeconds}
                onChange={handleRunProps}
              />
            </div>
            <div className={classes.formField}>
              <InputLabel className={classes.formLabel} htmlFor="stopOnFailure">
                {t('createWorkflow.tuneWorkflow.addProbe.labels.stop')}
              </InputLabel>
              <Select
                style={{ width: '50%' }}
                value={runProperties.stopOnFailure}
                className={classes.select}
                variant="outlined"
                onChange={(e) =>
                  setRunProperties({
                    ...runProperties,
                    stopOnFailure: e.target.value === 'true',
                  })
                }
                inputProps={{
                  id: 'stopOnFailure',
                  name: 'stopOnFailure',
                }}
              >
                <MenuItem value="true">true</MenuItem>
                <MenuItem value="false">false</MenuItem>
              </Select>
            </div>
          </div>
          <hr className={classes.line} />
          <div className={classes.subHeading}>
            {t('createWorkflow.tuneWorkflow.addProbe.labels.probeDetails')}
          </div>

          <ProbeDetails
            isEdit={isEdit}
            setProbeData={(probes) => setProbeData(probes)}
            probeData={probeData}
          />

          <div className={classes.buttonDiv}>
            <ButtonOutlined
              onClick={() => {
                if (!probesValue) clearData();
                handleClose();
              }}
            >
              {t('createWorkflow.tuneWorkflow.addProbe.button.cancel')}
            </ButtonOutlined>
            <ButtonFilled
              type="submit"
              disabled={
                (!isEdit && validateProbeName(allProbes, probeData.name)) ||
                probeData.name.trim().length === 0
              }
            >
              {!addButtonState
                ? 'Edit Probe'
                : t('createWorkflow.tuneWorkflow.addProbe.button.addProbe')}
            </ButtonFilled>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default AddProbe;
