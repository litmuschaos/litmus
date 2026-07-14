import * as Yup from 'yup';
import type { ObjectShape } from 'yup/lib/object';
import { FaultTunable, FaultTunableInputType, FaultTunables } from '@models';
import type { TuneExperimentForm } from '../views/ExperimentCreationFaultConfiguration/Tabs/FaultTunablesTab/types';

export function getFaultTunableFromTuneExperimentFormValues(formValues: TuneExperimentForm): FaultTunables {
  const faultTunable: FaultTunables = {};

  Object.entries(formValues).map(([key, value]) => {
    faultTunable[key as keyof FaultTunables] = {
      type: getFaultTunablesInputType(value),
      value: value
    };
  });

  return faultTunable;
}

export function getInitialValueFromFaultTunable(faultTunables: FaultTunables): TuneExperimentForm {
  const initialValues: TuneExperimentForm = {};

  Object.entries(faultTunables).map(([key, value]) => {
    if (typeof value.value === 'boolean') initialValues[key] = value.value;
    else initialValues[key] = value.value;
  });

  return initialValues;
}

export function getYupValidationFromFaultTunable(faultTunables: FaultTunables): any {
  const validationObject: ObjectShape = {};
  Object.entries(faultTunables).map(([key, value]) => {
    validationObject[key] = getYupObjectBasedOnEnvInputType(value);
  });

  return Yup.object().shape(validationObject);
}

function getYupObjectBasedOnEnvInputType(faultTunable: FaultTunable): any {
  switch (faultTunable.type) {
    case FaultTunableInputType.Text: {
      const validationObject = Yup.string().trim();
      if (faultTunable.required) validationObject.required();
      return validationObject;
    }
    case FaultTunableInputType.Number: {
      const validationObject = Yup.number().min(0);
      if (faultTunable.required) validationObject.required();
      return validationObject;
    }
    case FaultTunableInputType.Boolean: {
      const validationObject = Yup.boolean();
      if (faultTunable.required) validationObject.required();
      return validationObject;
    }
  }
}

export function getFaultTunablesInputType(value: any): FaultTunableInputType {
  switch (typeof value) {
    case 'string':
      return FaultTunableInputType.Text;
    case 'number':
      return FaultTunableInputType.Number;
    case 'boolean':
      return FaultTunableInputType.Boolean;
    default:
      return FaultTunableInputType.Text;
  }
}
