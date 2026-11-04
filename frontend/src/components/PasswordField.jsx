import { useState } from 'react';
import FormField from './FormField';

const PasswordField = (props) => {
  const [visible, setVisible] = useState(false);

  return (
    <FormField {...props} type={visible ? 'text' : 'password'}>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 px-3.5 text-xs font-medium text-primary hover:text-primary-hover"
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </FormField>
  );
};

export default PasswordField;