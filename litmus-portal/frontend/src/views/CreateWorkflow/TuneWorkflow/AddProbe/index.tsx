import { Modal, ButtonOutlined, ButtonFilled, InputField } from 'litmus-ui';
import { MenuItem, Select, InputLabel } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import React from 'react';
import useStyles from './styles';

interface AddProbeProps {
  handleClose: () => void;
  open: boolean;
  addProbe: () => void;
}

const AddProbe: React.FC<AddProbeProps> = ({ open, handleClose, addProbe }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [probeData, setProbeData] = React.useState({
    probeName: '',
    probeType: '',
    probeProperties: '',
    timeout: '',
    retry: '',
    interval: '',
    pollingInterval: '',
    intervalDelaySeconds: '',
    url: '',
    expectedResponseCode: '',
  });

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
        <form onSubmit={addProbe} className={classes.form}>
          <div className={classes.heading}>
            {t('createWorkflow.tuneWorkflow.addProbe.heading')}
            <strong>
              {' '}
              {t('createWorkflow.tuneWorkflow.addProbe.headingStrong')}
            </strong>
          </div>

          <div className={classes.formField}>
            <InputLabel htmlFor="probe-name" className={classes.formLabel}>
              {t('createWorkflow.tuneWorkflow.addProbe.labels.probeName')}
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="probe-name"
              type="text"
              value={probeData.probeName}
              onChange={(e) =>
                setProbeData({ ...probeData, probeName: e.target.value })
              }
            />
          </div>

          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="probe-type">
              {t('createWorkflow.tuneWorkflow.addProbe.labels.probeType')}
            </InputLabel>
            <Select
              value={probeData.probeType}
              className={classes.select}
              variant="outlined"
              onChange={(e) =>
                setProbeData({
                  ...probeData,
                  probeType: e.target.value as string,
                })
              }
              inputProps={{
                id: 'probe-type',
              }}
            >
              <MenuItem value="Http">
                {t('createWorkflow.tuneWorkflow.addProbe.select.http')}
              </MenuItem>
              <MenuItem value="cmd">
                {t('createWorkflow.tuneWorkflow.addProbe.select.cmd')}
              </MenuItem>
              <MenuItem value="k8s">
                {t('createWorkflow.tuneWorkflow.addProbe.select.k8s')}
              </MenuItem>
              <MenuItem value="Prom">
                {t('createWorkflow.tuneWorkflow.addProbe.select.prom')}
              </MenuItem>
            </Select>
          </div>
          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="probe-prop">
              {t('createWorkflow.tuneWorkflow.addProbe.labels.probeProp')}
            </InputLabel>
            <Select
              value={probeData.probeProperties}
              className={classes.select}
              variant="outlined"
              onChange={(e) =>
                setProbeData({
                  ...probeData,
                  probeProperties: e.target.value as string,
                })
              }
              inputProps={{
                id: 'probe-prop',
              }}
            >
              <MenuItem value="SoT">
                {t('createWorkflow.tuneWorkflow.addProbe.select.sot')}
              </MenuItem>
              <MenuItem value="EoT">
                {t('createWorkflow.tuneWorkflow.addProbe.select.eot')}
              </MenuItem>
              <MenuItem value="Edge">
                {t('createWorkflow.tuneWorkflow.addProbe.select.edge')}
              </MenuItem>
              <MenuItem value="Continous">
                {t('createWorkflow.tuneWorkflow.addProbe.select.continuos')}
              </MenuItem>
              <MenuItem value="onChaos">
                {t('createWorkflow.tuneWorkflow.addProbe.select.onChaos')}
              </MenuItem>
            </Select>
          </div>
          <hr className={classes.detailContainer} />

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
                type="number"
                value={probeData.timeout}
                onChange={(e) =>
                  setProbeData({ ...probeData, timeout: e.target.value })
                }
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
                type="number"
                value={probeData.retry}
                onChange={(e) =>
                  setProbeData({ ...probeData, retry: e.target.value })
                }
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
                type="number"
                value={probeData.interval}
                onChange={(e) =>
                  setProbeData({ ...probeData, interval: e.target.value })
                }
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
                type="number"
                value={probeData.pollingInterval}
                onChange={(e) =>
                  setProbeData({
                    ...probeData,
                    pollingInterval: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="interval-delay">
              {t('createWorkflow.tuneWorkflow.addProbe.labels.intervalDelay')}
            </InputLabel>
            <InputField
              variant="primary"
              width="30%"
              id="interval-delay"
              type="number"
              value={probeData.intervalDelaySeconds}
              onChange={(e) =>
                setProbeData({
                  ...probeData,
                  intervalDelaySeconds: e.target.value,
                })
              }
            />
          </div>
          <hr className={classes.detailContainer} />

          <div className={classes.subHeading}>
            {t('createWorkflow.tuneWorkflow.addProbe.labels.probeDetails')}
          </div>

          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="url">
              {t('createWorkflow.tuneWorkflow.addProbe.labels.url')}
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="url"
              type="text"
              value={probeData.url}
              onChange={(e) =>
                setProbeData({ ...probeData, url: e.target.value })
              }
            />
          </div>
          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="response">
              {t('createWorkflow.tuneWorkflow.addProbe.labels.expectedRes')}
            </InputLabel>
            <InputField
              variant="primary"
              width="50%"
              id="response"
              type="number"
              value={probeData.expectedResponseCode}
              onChange={(e) =>
                setProbeData({
                  ...probeData,
                  expectedResponseCode: e.target.value,
                })
              }
            />
          </div>

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
