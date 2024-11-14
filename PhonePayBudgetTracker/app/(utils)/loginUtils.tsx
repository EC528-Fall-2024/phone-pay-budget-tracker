import auth from '@react-native-firebase/auth';
import { getFunctions, httpsCallable } from "firebase/functions";
import { checkEmpty, validateEmail} from './validationUtils';

export const validateLogin = (
    email: string,
    password: string,
  ) => {
    if (!validateEmail(email)) return 'Invalid email format!';
    if (checkEmpty(email)) return 'Email cannot be empty!';
    if (checkEmpty(password)) return 'Password cannot be empty!';
    return '';
  };

async function getUserProfile(
    email: string, 
    username: string,
    uid: string ) {

    const functions = getFunctions();
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

export const handleLogin = async (
    username: string,
    email: string,
    password: string,
    onSuccess: () => void,
    onError: (message: string) => void
  ) => {
    try {
      const data = await auth().signInWithEmailAndPassword(email, password);
      getUserProfile(email, username, data.user.uid);
      onSuccess();
    } catch (error: any) {
        if (error.code === 'auth/invalid-email') {
            onError('That email address is invalid!');
        } else {
            onError('Signup failed. Please try again.');
            console.error(error);
      }
    }
  };