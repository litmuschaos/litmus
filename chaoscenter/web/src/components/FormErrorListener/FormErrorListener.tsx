import { FormikErrors, useFormikContext } from 'formik';
import { isEqual } from 'lodash-es';
import React from 'react';

export default function FormErrorListener<T>({ onError }: { onError: (errors: FormikErrors<T>) => void }): null {
  const formik = useFormikContext();
  const [errors, updateErrors] = React.useState<FormikErrors<T>>(formik.errors);

  React.useEffect(() => {
    if (!isEqual(errors, formik.errors)) {
      onError(formik.errors);
      updateErrors(formik.errors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.errors]);

  return null;
}
