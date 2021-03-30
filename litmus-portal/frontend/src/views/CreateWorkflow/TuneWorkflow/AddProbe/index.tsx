import { Modal, ButtonOutlined, ButtonFilled, InputField } from 'litmus-ui';
import { MenuItem, Select, InputLabel } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import React from 'react';
import useStyles from './styles';
import ProbeDetails from './ProbeDetails';

interface AddProbeProps {
  probesData: any;
  setProbesData: React.Dispatch<any>;
  addProbe: () => void;
  handleClose: () => void;
  open: boolean;
}

const AddProbe: React.FC<AddProbeProps> = ({
  probesData,
  setProbesData,
  addProbe,
  handleClose,
  open,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const allProbes = probesData;
  const [probeType, setProbeType] = React.useState('httpProbe/inputs');
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
    },
    'httpProbe/inputs': {},
  });
  const handleRunProps = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProbeData({
      ...probeData,
      runProperties: {
        ...probeData.runProperties,
        [e.target.name]: e.target.value,
      },
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
    allProbes.push(probeData);
    setProbesData(allProbes);
    addProbe();
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
                type="number"
                value={probeData.runProperties.probeTimeout}
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
                type="number"
                value={probeData.runProperties.retry}
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
                name="interval"
                type="number"
                value={probeData.runProperties.interval}
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
                value={probeData.runProperties.probePollingInterval}
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
              value={probeData.runProperties.initialDelaySeconds}
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
