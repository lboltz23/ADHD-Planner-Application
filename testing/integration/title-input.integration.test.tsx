import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import TitleInput from '../../src/components/TitleInput';

jest.mock('lucide-react-native', () => ({
  Pencil: () => null,
}));

describe('TitleInput integration', () => {
  test('renders label and forwards text changes', () => {
    const onChange = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <TitleInput value="" onChange={onChange} />
    );

    expect(getByText(/Title:/)).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Plan sprint');
    expect(onChange).toHaveBeenCalledWith('Plan sprint');
  });

  test('supports a custom placeholder', () => {
    const { getByPlaceholderText } = render(
      <TitleInput
        value=""
        onChange={() => {}}
        placeholder="Type a quick task"
      />
    );

    expect(getByPlaceholderText('Type a quick task')).toBeTruthy();
  });
});
