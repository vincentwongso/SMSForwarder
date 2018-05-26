import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Alert,
  ToastAndroid,
} from 'react-native';
import SmsListener from 'react-native-android-sms-listener';
import KeepAwake from 'react-native-keep-awake';

import { FormLabel, FormInput, Input, Button } from 'react-native-elements';

export default class SMSForwarder extends Component {
  state = {
    phoneNo: '',
    message: '',
    email: '',
    subscription: null,
  };
  async componentDidMount() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        {
          title: 'SMS Forwarder',
          message: 'SMS Forwarder needs access to read your sms.',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permission granted');
      } else {
        console.log('Permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  notifySuccess = from => {
    ToastAndroid.showWithGravity(
      `SMS successfully forwarded to: ${from}`,
      ToastAndroid.LONG,
      ToastAndroid.TOP
    );
  };

  sendEmail = async (message, destinationEmail) => {
    const url = 'https://frozen-falls-13030.herokuapp.com/mail';
    const headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_2_6 like Mac OS X) AppleWebKit/604.5.6 (KHTML, like Gecko) Mobile/15D100',
    });
    const config = {
      method: 'POST',
      headers,
      body: JSON.stringify({
        subject: `Forwarding SMS From: ${message.originatingAddress}`,
        body: message.body,
        destination: destinationEmail,
      }),
    };
    try {
      const response = await fetch(url, config);
      const result = await response.json();
      if (result && result.success) {
        console.log(result);
        this.notifySuccess(message.originatingAddress);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Notification', 'Failed delivering sms!');
    }
  };

  isValidMessage = message => {
    if (
      message.originatingAddress === this.state.phoneNo ||
      this.state.phoneNo === ''
    ) {
      const patt = new RegExp(this.state.message, 'gi');
      console.log('valid message 1');
      if (patt.test(message.body) || this.state.message === '') {
        return true;
      }
    }
    return false;
  };

  saveForwarder = () => {
    if (this.state.email !== '') {
      Alert.alert('Notification', 'Forwarder is now enabled!');
      const subscription = SmsListener.addListener(message => {
        if (this.isValidMessage(message)) {
          this.sendEmail(message, this.state.email);
        }
      });
      this.setState({ subscription });
      KeepAwake.activate();
    } else {
      Alert.alert('Error', 'Destination email cannot be empty!');
    }
  };

  stopForwarding = () => {
    console.log('Stop forwarding');
    Alert.alert('Notification', 'Forwarder is now stopped!');
    if (this.state.subscription) {
      this.state.subscription.remove();
    }
    this.setState({
      subscription: null,
    });
    KeepAwake.deactivate();
  };

  render() {
    const { phoneNo, message, email, subscription } = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to SMS Forwarder!
        </Text>
        <Text>Forwarder {subscription !== null ? 'ON' : 'OFF'}</Text>
        <Text style={styles.filter}>Filter SMS By</Text>
        <FormInput
          placeholder="From Phone No (eg: +6141234567)"
          label="Phone No (Int'l Format, eg: +6141234567)"
          onChangeText={phoneNo => this.setState({ phoneNo })}
          value={phoneNo}
        />
        <FormInput
          placeholder="Message Contains"
          label="Message Contains"
          onChangeText={message => this.setState({ message })}
          value={message}
        />
        <Text style={styles.filter}>Destination Email</Text>
        <FormInput
          placeholder="Email"
          label="Email"
          onChangeText={email => this.setState({ email })}
          value={email}
        />
        <View style={styles.buttonsContainer}>
          {!subscription &&
            <Button
              raised
              title="SAVE FORWARDER"
              buttonStyle={{
                backgroundColor: 'rgba(111, 202, 186, 1)',
              }}
              onPress={this.saveForwarder}
            />}
          {subscription &&
            <Button
              raised
              title="STOP FORWARDER"
              buttonStyle={{
                backgroundColor: 'rgba(92, 99,216, 1)',
              }}
              onPress={this.stopForwarding}
            />}
        </View>
        <Text style={styles.info}>
          Forwarder will not work if this app is in the background.
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  filter: {
    textAlign: 'left',
    margin: 10,
    fontWeight: 'bold',
  },
  phoneNoLabel: {
    textAlign: 'left',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  info: {
    textAlign: 'left',
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 10,
  },
});
