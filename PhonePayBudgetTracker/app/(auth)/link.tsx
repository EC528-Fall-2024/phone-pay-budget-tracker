import React from 'react';
import {TextInput, Text, TouchableOpacity} from 'react-native';
import {styles} from './Styles';
import { useState } from 'react';
import { Button, Alert } from 'react-native';
import axios from 'axios';


import {
  LinkExit,
  LinkEvent,
  LinkLogLevel,
  LinkSuccess,
  dismissLink,
  LinkOpenProps,
  usePlaidEmitter,
  LinkIOSPresentationStyle,
  LinkTokenConfiguration,
  submit,
  SubmissionData,
} from 'react-native-plaid-link-sdk';

import {create, open} from 'react-native-plaid-link-sdk';

function isValidString(str: string): boolean {
  if (str && str.trim() !== '') {
    return true;
  }
  return false;
}

function createLinkTokenConfiguration(
  token: string,
  noLoadingState: boolean = false,
  ): LinkTokenConfiguration {
  console.log(`token: ${token}`);
  return {
    token: token,
    // Hides native activity indicator if true.
    noLoadingState: noLoadingState,
  };
}

function createSubmissionData(phoneNumber: string): SubmissionData {
  return {
    phoneNumber: phoneNumber,
  };
}



export default function PlaidLinkScreen() {
  // Render using the link_token integration. Refer to the docs
  // https://plaid.com/docs/#create-link-token on how to create
  // a new link_token.

  // Use event emitter to get real time events during a Link Session.
  usePlaidEmitter((event: LinkEvent) => {
    console.log(event);
  });

  const [linkToken, setLinkToken] = React.useState('');
  const [text, onChangeText] = React.useState('');
  const [disabled, setDisabled] = React.useState(true);
  const [publicToken, setPublicToken] = useState('');

  function createLinkOpenProps(): LinkOpenProps {
    return {
      onSuccess: (success: LinkSuccess) => {
        // User was able to successfully link their account.
        console.log('Success: ', success);
        success.metadata.accounts.forEach(it => console.log('accounts', it));
        const { publicToken } = success;
        setPublicToken(publicToken);
        console.log('Public Token:', publicToken);
      },
      onExit: (linkExit: LinkExit) => {
        console.log('Exit: ', linkExit);
        dismissLink();
      },
      // MODAL or FULL_SCREEEN presentation on iOS. Defaults to MODAL.
      iOSPresentationStyle: LinkIOSPresentationStyle.MODAL,
      logLevel: LinkLogLevel.ERROR,
    };
  }

  const fetchLinkToken = async () => {
    try {
      const response = await axios.post('https://us-central1-phonepaybudgettracker.cloudfunctions.net/createLinkToken');
      const data = response.data;
      console.log(data);
      setLinkToken(data.link_token);
    } catch (error) {
      console.error('Error fetching link token:', error);
  
      if (axios.isAxiosError(error)) {
        if (error.response) {
          Alert.alert('Error', error.response.data.error || 'Unable to fetch link token');
        } else {
          Alert.alert('Error', 'Unable to fetch link token');
        }
      } else {
        console.error('Unexpected error:', error);
        Alert.alert('Error', 'An unexpected error occurred');
      }
    }
  };
  
  const exchangePublicToken = async (publicToken: string) => {
    try {
      const response = await axios.post('https://us-central1-phonepaybudgettracker.cloudfunctions.net/exchangePublicToken', {
        public_token: publicToken,
        user_id: '',
      });
      const { access_token, item_id } = response.data;
  
      // Store or use the access token and item ID as needed
      console.log('Access Token:', access_token);
      console.log('Item ID:', item_id);
    } catch (error) {
      console.error('Error exchanging public token:', error);
      Alert.alert('Error', 'Unable to exchange public token');
    }
  };

  return (
    <>
      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={text}
        placeholder="link-sandbox-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        placeholderTextColor={'#D3D3D3'}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (isValidString(text)) {
            const tokenConfiguration = createLinkTokenConfiguration('text');
            create(tokenConfiguration);
            setDisabled(false);
          }
        }}>
        <Text style={styles.button}>Fucked up</Text>
      </TouchableOpacity>


      <TouchableOpacity
        disabled={disabled}
        style={disabled ? styles.disabledButton : styles.button}
        onPress={() => {
          const submissionData = createSubmissionData('415-555-0015');
          submit(submissionData);
        }}>
        <Text style={styles.button}>Dont Press</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={fetchLinkToken}>
        <Text style={styles.button}>Generate Link</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
            create({token: linkToken});
            setDisabled(false);
          }
        }>
        <Text style={styles.button}>Create Link</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={disabled ? styles.disabledButton : styles.button}
        onPress={() => {
          const openProps = createLinkOpenProps();
          open(openProps);
        }}
        disabled={disabled}>
        <Text style={styles.button}>Link Bank</Text>
      </TouchableOpacity>

      
      <TouchableOpacity style={styles.button} onPress={() => exchangePublicToken(publicToken)}>
        <Text style={styles.button}>Get acesss token</Text>
      </TouchableOpacity>
    </>
  );
}