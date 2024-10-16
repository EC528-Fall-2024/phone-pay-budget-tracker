import React, {useState, useEffect, useCallback} from 'react';
import {
  Text,
  View,
  ToastAndroid,
  Platform,
  Alert,
  StyleSheet
} from 'react-native';

const SuccessScreen = ({ navigation, route }: any) => {
  const [data, setData] = useState(null);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.heading}>
        <Text style={styles.titleText}>Balance Response</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.baseText}>
            {'Hello'}
        </Text>
      </View>
    </View>
  );
};

function notifyMessage(msg: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    Alert.alert(msg);
  }
}

const styles = StyleSheet.create({
    heading: {
        alignItems: 'center',
        paddingHorizontal: 32,
        justifyContent: 'flex-start',
        backgroundColor: '#FFFFFF',
        paddingBottom: 32,
      },
      body: {
        flex: 1,
        paddingHorizontal: 32,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor: '#FFFFFF',
      },
      baseText: {
        fontSize: 16,
        marginTop: 8,
        color: '#4B4B4B',
        textAlign: 'left',
      },
      titleText: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 36,
        marginHorizontal: 10,
      },
      bottom: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 32,
        paddingBottom: 32,
      },
      buttonContainer: {
        elevation: 4,
        backgroundColor: '#000',
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 16,
      },
      buttonText: {
        fontSize: 20,
        color: '#FFF',
        backgroundColor: '#000',
        fontWeight: 'bold',
        alignSelf: 'center',
        textTransform: 'uppercase',
      },
    });

export default SuccessScreen;