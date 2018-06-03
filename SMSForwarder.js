import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  ScrollView,
  View,
  PermissionsAndroid,
  Alert,
  ToastAndroid,
  TouchableHighlight,
  AsyncStorage,
  Linking
} from 'react-native';
import SmsListener from 'react-native-android-sms-listener';
import KeepAwake from 'react-native-keep-awake';
import { Input, Button } from 'react-native-elements';
import { AdMobBanner } from 'react-native-admob';

import ErrorBoundary from './ErrorBoundary';
import SMTPSettings from './SMTPSettings';

export default class SMSForwarder extends Component {
  state = {
    phoneNo: '',
    message: '',
    email: '',
    subscription: null,
    showModal: false,
    showHelpModal: false,
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
      `SMS from ${from} successfully forwarded to ${this.state.email}`,
      ToastAndroid.LONG,
      ToastAndroid.TOP
    );
  };

  sendEmail = async (message, destinationEmail) => {
    const smtp = await AsyncStorage.getItem('@SMSForwarder:smtpSettings');
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
        smtp: smtp ? JSON.parse(smtp) : null,
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

  showSmtpSettings = () => {
    this.setState({
      showModal: true,
    });
  };

  closeSmtpSettings = () => {
    this.setState({
      showModal: false,
    });
  };

  toggleHelpModal = visible => {
    this.setState({
      showHelpModal: visible,
    });
  };

  render() {
    const { phoneNo, message, email, subscription, showModal } = this.state;
    return (
      <ScrollView>
        <View style={styles.container}>
          <ErrorBoundary>
            <AdMobBanner
              adSize="banner"
              adUnitID="ca-app-pub-2865790332277864/7814843869"
              testDevices={[AdMobBanner.simulatorId]}
            />
          </ErrorBoundary>
          <Text style={styles.welcome}>
            SMS Forwarder
          </Text>
          <Text style={styles.filter}>Specify Message Filter</Text>
          <Input
            inputStyle={{ fontSize: 12 }}
            placeholder="From Phone No (eg: +6141234567)"
            onChangeText={phoneNo => this.setState({ phoneNo })}
            value={phoneNo}
            autoFocus={true}
          />
          <Input
            inputStyle={{ fontSize: 12 }}
            placeholder="Message Contains"
            onChangeText={message => this.setState({ message })}
            value={message}
          />
          <Text style={styles.filter}>Specify Destination Email</Text>
          <Input
            inputStyle={{ fontSize: 12 }}
            placeholder="Email"
            onChangeText={email => this.setState({ email })}
            value={email}
          />
          <View style={styles.buttonsContainer}>
            {!subscription &&
              <Button
                raised
                title="SWITCH ON"
                buttonStyle={{
                  backgroundColor: 'rgba(111, 202, 186, 1)',
                  borderColor: 'transparent',
                }}
                onPress={this.saveForwarder}
              />}
            {subscription &&
              <Button
                raised
                title="SWITCH OFF"
                buttonStyle={{
                  backgroundColor: 'rgba(199, 43, 98, 1)',
                  borderColor: 'transparent',
                }}
                onPress={this.stopForwarding}
              />}
          </View>
          <Text style={styles.info}>
            Forwarder will not work if it's in the background.
          </Text>
          <View style={styles.helperLink}>
            <TouchableHighlight onPress={this.showSmtpSettings}>
              <Text style={{ color: 'blue' }}>SMTP Settings</Text>
            </TouchableHighlight>
            <SMTPSettings showModal={showModal} close={this.closeSmtpSettings} />
            <TouchableHighlight
              onPress={() => Linking.openURL('mailto:support@smsforwarder.app')}
              style={{ marginLeft: 60 }}
            >
              <Text style={{ color: 'blue' }}>Help & Support</Text>
            </TouchableHighlight>
          </View>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    marginBottom: 40,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  filter: {
    textAlign: 'left',
    margin: 10,
    marginTop: 25,
    fontWeight: 'bold',
  },
  phoneNoLabel: {
    textAlign: 'left',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 30,
  },
  info: {
    textAlign: 'left',
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 10,
  },
  helperLink: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    marginTop: 30
  },
});
