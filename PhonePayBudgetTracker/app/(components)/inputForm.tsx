import React from 'react';
import { TextInput, StyleSheet, TextInputProps, View } from 'react-native';

interface FormInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  isEmpty?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({ value, onChangeText, placeholder, isEmpty = false, ...rest }) => (
  <View style={styles.container}>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      style={[styles.input, isEmpty && styles.emptyInput]}
      {...rest}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  emptyInput: {
    borderColor: 'red',
  },
});

export default FormInput;
