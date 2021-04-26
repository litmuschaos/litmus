import { Modal, ButtonOutlined, ButtonFilled, InputField } from 'litmus-ui';
import { MenuItem, Select, InputLabel } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import React from 'react';
import useStyles from './styles';
import ProbeDetails from './ProbeDetails';

interface AddProbeProps {
  probesValue: any;
  addProbe: (probes: any) => void;
  handleClose: () => void;
  open: boolean;
}

interface RunProperties {
  probeTimeout: string;
  retry: string;
  interval: string;
  probePollingInterval?: string;
  initialDelaySeconds?: string;
}

const AddProbe: React.FC<AddProbeProps> = ({
  probesValue,
  addProbe,
  handleClose,
  open,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [allProbes, setAllProbes] = React.useState(
    probesValue && probesValue.length ? probesValue : []
  );
  const [probeType, setProbeType] = React.useState('httpProbe/inputs');
  const [runProperties, setRunProperties] = React.useState<RunProperties>({
    probeTimeout: '',
    retry: '',
    interval: '',
    probePollingInterval: '',
    initialDelaySeconds: '',
  });
  const [probeData, setProbeData] = React.useState({
    name: '',
    type: 'httpProbe',
    mode: 'Continuous',
    runProperties: {},
    'httpProbe/inputs': {},
  });
  const handleRunProps = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRunProperties({
      ...runProperties,
      [e.target.name]: parseInt(e.target.value, 10),
    });
  };

  const renameKey = (object: any, key: string, newKey: string) => {
    const clonedObj = { ...object };
    const targetKey = clonedObj[key];
    delete clonedObj[key];
    clonedObj[newKey] = targetKey;
    return clonedObj;
  };

  const onTypeChange = (
    e: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    const newProbe = `${e.target.value}/inputs`;
    const a = renameKey(probeData, probeType, newProbe);
    setProbeData({
      ...a,
      type: e.target.value as string,
    });
    setProbeType(newProbe);
  };

  const handleAddProbe = () => {
    const properties = runProperties;
    if (Number.isNaN(parseInt(properties.initialDelaySeconds as string, 10))) {
      delete properties.initialDelaySeconds;
    }
    if (Number.isNaN(parseInt(properties.probePollingInterval as string, 10))) {
      delete properties.probePollingInterval;
    }
    allProbes.push({
      ...probeData,
      runProperties: {
        ...properties,
      },
    });
    setAllProbes(allProbes);
    addProbe(allProbes);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      width="60%"
      className={classes.modal}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      modalActions={
        <ButtonOutlined className={classes.closeButton} onClick={handleClose}>
          &#x2715;
        </ButtonOutlined>
      }
    >
      <div className={classes.modal}>
        <form onSubmit={handleAddProbe} className={classes.form}>
          <div className={classes.heading}>
            {t('createWorkflow.tuneWorkflow.addProbe.heading')}
            <strong>
              {' '}
              {t('createWorkflow.tuneWorkflow.addProbe.headingStrong')}
            </strong>
          </div>
          <div className={classes.formField}>
            <InputLabel htmlFor="name" className={classes.formLabel}>
              {t('createWorkflow.tuneWorkflow.addProbe.labels.probeName')}
            </InputLabel>
            <InputField
              variant="primary"
              id="name"
              name="name"
              type="text"
              required
              value={probeData.name}
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
                {t('createWorkflow.tuneWorkflow.addProbe.labels.timeout')}
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
                {t('createWorkflow.tuneWorkflow.addProbe.labels.retry')}
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
                {t('createWorkflow.tuneWorkflow.addProbe.labels.interval')}
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
            <div className={classes.formField}>
              <InputLabel className={classes.formLabel} htmlFor="polling">
                {t('createWorkflow.tuneWorkflow.addProbe.labels.polling')}
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
          </div>
          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="initial-delay">
              {t('createWorkflow.tuneWorkflow.addProbe.labels.initialDelay')}
            </InputLabel>
            <InputField
              variant="primary"
              width="70%"
              id="initial-delay"
              name="initialDelaySeconds"
              type="number"
              value={runProperties.initialDelaySeconds}
              onChange={handleRunProps}
            />
          </div>
          <hr className={classes.line} />
          <div className={classes.subHeading}>
            {t('createWorkflow.tuneWorkflow.addProbe.labels.probeDetails')}
          </div>

          <ProbeDetails setProbeData={setProbeData} probeData={probeData} />

          <div className={classes.buttonDiv}>
            <ButtonOutlined onClick={handleClose}>
              {t('createWorkflow.tuneWorkflow.addProbe.button.cancel')}
            </ButtonOutlined>
            <ButtonFilled type="submit">
              {t('createWorkflow.tuneWorkflow.addProbe.button.addProbe')}
            </ButtonFilled>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddProbe;
