export interface ValidationResult {
    isValid: boolean;
    errorMessage: string;
  }
  
  export const checkEmpty = (value: string): ValidationResult => {
    if (!value) {
      return { isValid: false, errorMessage: 'This field cannot be empty!' };
    }
    return { isValid: true, errorMessage: '' };
  };
  
  export const validatePasswordsMatch = (password: string, confirmPassword: string): ValidationResult => {
    if (password !== confirmPassword) {
      return { isValid: false, errorMessage: 'Passwords do not match!' };
    }
    return { isValid: true, errorMessage: '' };
  };
  
  export const validateEmail = (email: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, errorMessage: 'Invalid email format!' };
    }
    return { isValid: true, errorMessage: '' };
  };