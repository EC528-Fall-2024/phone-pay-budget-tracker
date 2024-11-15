import auth from '@react-native-firebase/auth';
import { getFunctions, httpsCallable } from "@react-native-firebase/functions";
import { checkEmpty, validatePasswordsMatch} from './validationUtils';

export const validateSignup = (
  username: string,
  email: string,
  password: string,
  cpassword: string
): string => {
  if (!checkEmpty(username).isValid) return 'Full name cannot be empty!';
  if (!checkEmpty(email).isValid) return 'Email cannot be empty!';
  if (!checkEmpty(password).isValid) return 'Password cannot be empty!';
  if (!checkEmpty(cpassword).isValid) return 'Confirm password cannot be empty!';
  if (!validatePasswordsMatch(password, cpassword).isValid) return 'Passwords do not match!';

  return '';
};

async function createUserProfile(
  email: string, 
  username: string,
  uid: string ) {

  const functions = getFunctions();
  console.log(email, username, uid);
  const createUserDocument = httpsCallable(functions, "createUserDocument");

  try {
    const result = await createUserDocument({
      email: email,
      username: username,
      uid: uid,
    });
    console.log(uid, 'has registered db successfully');;
  } catch (error) {
    console.error(uid, "db failed");
  }
}

export const handleSignup = async (
  username: string,
  email: string,
  password: string,
  onSuccess: () => void,
  onError: (message: string) => void
) => {
  try {
    const data = await auth().createUserWithEmailAndPassword(email, password);
    console.log('User account created in FB!');
    
    await createUserProfile(email, username, data.user.uid);

    onSuccess();
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      onError('That email address is already in use!');
    } else if (error.code === 'auth/invalid-email') {
      onError('That email address is invalid!');
    } else {
      onError('Signup failed. Please try again.');
      console.error(error);
    }
  }
};