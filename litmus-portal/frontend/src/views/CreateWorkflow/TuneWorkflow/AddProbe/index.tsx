import { Modal, ButtonOutlined, ButtonFilled, InputField } from 'litmus-ui';
import { MenuItem, Select, InputLabel } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface AddProbeProps {
  handleClose: () => void;
  open: boolean;
  addProbe: () => void;
}

const AddProbe: React.FC<AddProbeProps> = ({ open, handleClose, addProbe }) => {
  const classes = useStyles();
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
            Add<strong> Probe</strong>
          </div>

          <div className={classes.formField}>
            <InputLabel htmlFor="probe-name" className={classes.formLabel}>
              Probe Name
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
              Probe Type
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
              <MenuItem value="Http">Http</MenuItem>
              <MenuItem value="cmd">cmd</MenuItem>
              <MenuItem value="k8s">k8s</MenuItem>
              <MenuItem value="Prom">Prom</MenuItem>
            </Select>
          </div>
          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="probe-prop">
              Probe Properties
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
              <MenuItem value="SoT">SoT</MenuItem>
              <MenuItem value="EoT">EoT</MenuItem>
              <MenuItem value="Edge">Edge</MenuItem>
              <MenuItem value="Continous">Continuos</MenuItem>
              <MenuItem value="onChaos">onChaos</MenuItem>
            </Select>
          </div>
          <hr style={{ width: '100%' }} />

          <div className={classes.subHeading}>Probe Properties</div>

          <div style={{ display: 'flex', width: '100%' }}>
            <div className={classes.formField}>
              <InputLabel className={classes.formLabel} htmlFor="timeout">
                Timeout
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
                Retry
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
          <div style={{ display: 'flex', width: '100%' }}>
            <div className={classes.formField}>
              <InputLabel className={classes.formLabel} htmlFor="interval">
                Interval
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
                Polling Interval
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
              Interval Delay seconds
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
          <hr style={{ width: '100%' }} />

          <div className={classes.subHeading}>Probe details</div>

          <div className={classes.formField}>
            <InputLabel className={classes.formLabel} htmlFor="url">
              URL
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
              Expected response code
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
            <ButtonOutlined onClick={handleClose}>Cancel</ButtonOutlined>
            <ButtonFilled type="submit">Add Probe</ButtonFilled>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddProbe;
