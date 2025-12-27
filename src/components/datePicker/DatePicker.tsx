import JalaliAntdDatePicker from './JalaliAntdDatePicker';
import FA_TEXT from '@/constants/FA_TEXT';
import { Form } from 'antd';
import { Rule } from 'antd/lib/form';
import moment, { Moment } from 'moment-jalaali';
import { NamePath } from 'rc-field-form/lib/interface';
import { MouseEvent, ReactNode, useState } from 'react';

interface Props {
  label?: ReactNode;
  name?: NamePath;
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  isFormItem?: true;
  allowClear?: true;
  rules?: Rule[];
  isRequired?: boolean;
  format?: 'jYYYY-jMM-jDD' | 'jYYYY/jMM/jDD';
  type: 'birth-date';
  disabled :boolean;
  showTime :boolean;
}

function DatePicker(props: Props) {
  const {
    label,
    name,
    value,
    onChange,
    defaultValue,
    placeholder,
    isFormItem,
    allowClear,
    rules,
    isRequired,
    type,
    format,
      disabled,
      showTime
  } = props;

  const dateFormat = format || 'YYYY-MM-DD';

  const generatedRules: Rule[] = [];
  if (isRequired && label) {
    generatedRules.push({
      required: true,
      message: `${label || FA_TEXT.THIS_FIELD} ${FA_TEXT.IS_REQUIRED}`,
    });
  }
  const finalRules = [...generatedRules, ...(rules || [])];

  const [internalValue, setInternalValue] = useState<string | null>(
    getDefaultValue,
  );

  function getDefaultValue() {
    if (!valueIsValid(defaultValue)) return null;
    return defaultValue as string;
  }

  function handleChange(date: Moment | null) {
    console.log('handleChange called with:', date);
    if (!date) {
      if (!isFormItem) setInternalValue(null);
      onChange?.('');
      return '';
    }
    // Ensure we format the date in Gregorian YYYY-MM-DD format with English locale
    // Clone and set locale to 'en' to get ASCII numerals instead of Persian numerals
    const formattedDate = date.clone().locale('en').format(showTime ? "YYYY/MM/DD HH:mm" : "YYYY/MM/DD");
    console.log('formattedDate:', formattedDate);
    if (!isFormItem) setInternalValue(formattedDate);
    onChange?.(formattedDate);
    return formattedDate;
  }

  function valueIsValid(value?: string | null) {
    if (!value) return false;
    // Check both formats: with and without time
    const formats = ['YYYY-MM-DD', 'YYYY/MM/DD HH:mm', 'YYYY/MM/DD'];
    const isValid = moment(value, formats, true).isValid();
    console.log('valueIsValid:', value, isValid);
    return isValid;
  }

  function getValue(value?: string | null) {
    console.log('getValue called with:', value);
    if (!valueIsValid(value)) return { value: null };
    // Parse the Gregorian date string with multiple format support
    const formats = ['YYYY-MM-DD', 'YYYY/MM/DD HH:mm', 'YYYY/MM/DD'];
    const momentValue = moment(value, formats, true);
    return { value: momentValue };
  }

  const defaultPickerValues = {
    'birth-date': moment('1992-08-07', 'YYYY-MM-DD'),
  };

  const disableDate = {
    'birth-date': (current: Moment) =>
      current && current > moment().endOf('day'),
  };

  if (isFormItem) {
    return (
      <Form.Item
        name={name}
        label={label}
        rules={finalRules}
        getValueFromEvent={handleChange}
        getValueProps={getValue}
      >
        <JalaliAntdDatePicker
          className="w-full"
          size={'large'}
          allowClear={allowClear}
          onChange={handleChange}
          onClick={(e: MouseEvent<HTMLInputElement>) => e.stopPropagation()}
          placeholder={placeholder}
          format={showTime ? "YYYY-MM-DD HH:mm" : "YYYY/MM/DD"  }
          inputReadOnly={true}
          disabled={disabled}
          disabledDate={disableDate[type]}
          showTime={showTime}
          // defaultPickerValue={defaultPickerValues[type]}
        />
      </Form.Item>
    );
  }

  const Element = (
    <JalaliAntdDatePicker
      className="w-full"
      size={'large'}
      allowClear={allowClear}
      value={getValue(internalValue).value}
      onChange={handleChange}
      onClick={(e: MouseEvent<HTMLInputElement>) => e.stopPropagation()}
      placeholder={placeholder}
      format={showTime ? "YYYY-MM-DD HH:mm" : "YYYY/MM/DD"}
      inputReadOnly={true}
      disabled={disabled}
      disabledDate={disableDate[type]}
      showTime={showTime}
      defaultPickerValue={defaultPickerValues[type]}
    />
  );

  return (
    <div className="flex flex-col gap-y-2">
      {label && <div>{label}</div>}
      {Element}
    </div>
  );
}

export default DatePicker;
