import JalaliAntdDatePicker from './JalaliAntdDatePicker';
import { Form } from 'antd';
import moment, { Moment } from 'moment-jalaali';
import { MouseEvent, ReactNode, useState } from 'react';

const { RangePicker } = JalaliAntdDatePicker;

interface Props {
  label?: ReactNode;
  name?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  isFormItem?: true;
}

function DateRangePicker(props: Props) {
  const { defaultValue, onChange, isFormItem, name, label } = props;

  const [internalValue, setInternalValue] = useState<string | null>(
    getDefaultValue,
  );

  function getDefaultValue() {
    if (!valueIsValid(defaultValue)) return null;
    return defaultValue as string;
  }

  function handleChange(dates: [Moment | null, Moment | null] | null) {
    if (!dates || !dates[0] || !dates[1]) {
      if (!isFormItem) setInternalValue(null);
      return null;
    }
    const formatedDates = [
      dates[0].format('YYYY-MM-DD'),
      dates[1].format('YYYY-MM-DD'),
    ];
    const value = formatedDates.join(',');
    if (!isFormItem) setInternalValue(value);
    onChange?.(value);
    return value;
  }

  function valueIsValid(value?: string | null) {
    if (!value) return false;
    const stringDates = value.split(',');
    return !(
      stringDates.length !== 2 ||
      !stringDates.every((date) => moment(date, 'YYYY-MM-DD').isValid())
    );
  }

  function getValue(value?: string | null) {
    if (!valueIsValid(value)) return { value: null };

    return {
      value: (value as string)
        .split(',')
        .map((date) => moment(date, 'YYYY-MM-DD')) as [Moment, Moment],
    };
  }

  const Element = (
    <RangePicker
      className="w-full"
      value={isFormItem && getValue(internalValue).value}
      onChange={handleChange}
      onClick={(e: MouseEvent<HTMLInputElement>) => e.stopPropagation()}
    />
  );

  if (isFormItem) {
    return (
      <Form.Item
        name={name}
        label={label}
        getValueFromEvent={handleChange}
        getValueProps={getValue}
      >
        {Element}
      </Form.Item>
    );
  }

  return (
    <div className="flex flex-col gap-y-2">
      {label && <div>{label}</div>}
      {Element}
    </div>
  );
}

export default DateRangePicker;
