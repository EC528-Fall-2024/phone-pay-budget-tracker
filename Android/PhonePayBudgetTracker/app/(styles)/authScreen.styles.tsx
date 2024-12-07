import { StyleSheet } from 'react-native';


const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#f7f7f7',
    },
    error: {
      color: 'red',
      marginBottom: 10, 
      textAlign: 'center',
    },
    appTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#4CAF50',
      marginBottom: 50, 
      textAlign: 'center',
    },
    authContainer: {
      width: '80%',
      backgroundColor: '#ffffff',
      padding: 20,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 5 },
      shadowRadius: 10,
      elevation: 5, 
    },
    title: {
      fontSize: 24,
      marginBottom: 20,
      textAlign: 'center',
      color: '#333', 
    },
    input: {
      height: 50,
      borderColor: '#ddd',
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 20,
      paddingHorizontal: 15,
      backgroundColor: '#fafafa', 
    },
    emptyInput:{
      backgroundColor: '#fddfdf'
    },
    authButton: {
      backgroundColor: '#4CAF50', 
      paddingVertical: 15,
      borderRadius: 5,
      alignItems: 'center',
      marginBottom: 20,
    },
    authButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    link: {
      marginTop: 10,
      color: '#4CAF50', 
      textAlign: 'center',
      fontSize: 16,
      textDecorationLine: 'underline', 
    },
  });

export default styles;