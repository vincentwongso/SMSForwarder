import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ToastAndroid,
  Modal,
  Dimensions,
  AsyncStorage,
  Alert,
  ScrollView,
} from 'react-native';
import { Input, Icon, Button } from 'react-native-elements';
import SimpleIcon from 'react-native-vector-icons/SimpleLineIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default class SMTPSettings extends React.Component {
  state = {
    host: '',
    port: '',
    username: '',
    password: '',
    fromMail: '',
  };

  componentDidMount() {
    AsyncStorage.getItem('@SMSForwarder:smtpSettings').then(data => {
      if (data) {
        const smtp = JSON.parse(data);
        this.setState({
          host: smtp.host,
          port: smtp.port,
          username: smtp.username,
          password: smtp.password,
          fromMail: smtp.fromMail,
        });
      }
    });
  }

  saveSettings = () => {
    const { host, port, username, password, fromMail } = this.state;
    const errors = [];
    if (host === '') {
      errors.push('SMTP Host cannot be empty!');
    }
    if (port === '') {
      errors.push('SMTP Port cannot be empty!');
    }
    if (errors.length === 0) {
      AsyncStorage.setItem(
        '@SMSForwarder:smtpSettings',
        JSON.stringify({
          host,
          port,
          username,
          password,
          fromMail,
        })
      );
      this.props.close();
    } else {
      Alert.alert('Error', errors.join('\n'));
    }
  };

  useDefaultSmtp = () => {
    AsyncStorage.removeItem('@SMSForwarder:smtpSettings').then(() => {
      Alert.alert(
        'Info',
        'Default SMTP is shared by many users, if the server is busy your email delivery might be delayed.'
      );
      this.props.close();
    });
  };

  render() {
    const { showModal } = this.props;
    const { host, port, username, password, fromMail } = this.state;
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={showModal}
        onRequestClose={() => console.log('closing')}
      >
        <ScrollView style={styles.container}>
          <View style={{ backgroundColor: "rgba(46, 50, 72, 1)", width: SCREEN_WIDTH, alignItems: "center" }}>
            <Text
              style={{
                color: 'white',
                fontSize: 18,
                marginVertical: 10,
                fontWeight: '300',
              }}
            >
              Please Fill SMTP Settings
            </Text>
            <Input
              inputContainerStyle={styles.inputContainerStyle}
              underlineColorAndroid="transparent"
              leftIcon={
                <MaterialIcon
                  name="http"
                  color="rgba(110, 120, 170, 1)"
                  size={25}
                />
              }
              iconContainerStyle={{ marginLeft: 20 }}
              placeholder="SMTP Host"
              placeholderTextColor="rgba(110, 120, 170, 1)"
              inputStyle={{ marginLeft: 10, color: 'white', borderWidth: 0 }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardAppearance="light"
              keyboardType="default"
              returnKeyType="done"
              value={host}
              onChangeText={host => this.setState({ host })}
              ref={input => this.hostInput = input}
            />
            <Input
              inputContainerStyle={styles.inputContainerStyle}
              underlineColorAndroid="transparent"
              leftIcon={
                <MaterialIcon
                  name="info"
                  color="rgba(110, 120, 170, 1)"
                  size={25}
                />
              }
              iconContainerStyle={{ marginLeft: 20 }}
              placeholder="SMTP Port"
              placeholderTextColor="rgba(110, 120, 170, 1)"
              inputStyle={{ marginLeft: 10, color: 'white', borderWidth: 0 }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardAppearance="light"
              keyboardType="default"
              returnKeyType="done"
              value={port}
              onChangeText={port => this.setState({ port })}
            />
            <Input
              inputContainerStyle={styles.inputContainerStyle}
              underlineColorAndroid="transparent"
              leftIcon={
                <SimpleIcon
                  name="user"
                  color="rgba(110, 120, 170, 1)"
                  size={25}
                />
              }
              iconContainerStyle={{ marginLeft: 20 }}
              placeholder="SMTP Username"
              placeholderTextColor="rgba(110, 120, 170, 1)"
              inputStyle={{ marginLeft: 10, color: 'white', borderWidth: 0 }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardAppearance="light"
              keyboardType="default"
              returnKeyType="done"
              value={username}
              onChangeText={username => this.setState({ username })}
            />
            <Input
              inputContainerStyle={styles.inputContainerStyle}
              underlineColorAndroid="transparent"
              leftIcon={
                <MaterialIcon
                  name="lock"
                  color="rgba(110, 120, 170, 1)"
                  size={25}
                />
              }
              iconContainerStyle={{ marginLeft: 20 }}
              placeholder="SMTP Password"
              placeholderTextColor="rgba(110, 120, 170, 1)"
              inputStyle={{ marginLeft: 10, color: 'white', borderWidth: 0 }}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
              keyboardAppearance="light"
              keyboardType="default"
              returnKeyType="done"
              value={password}
              onChangeText={password => this.setState({ password })}
            />
            <Input
              inputContainerStyle={styles.inputContainerStyleBottom}
              underlineColorAndroid="transparent"
              leftIcon={
                <MaterialIcon
                  name="mail"
                  color="rgba(110, 120, 170, 1)"
                  size={25}
                />
              }
              iconContainerStyle={{ marginLeft: 20 }}
              placeholder="From Email"
              placeholderTextColor="rgba(110, 120, 170, 1)"
              inputStyle={{ marginLeft: 10, color: 'white', borderWidth: 0 }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardAppearance="light"
              keyboardType="default"
              returnKeyType="done"
              value={fromMail}
              onChangeText={fromMail => this.setState({ fromMail })}
            />
            <View style={styles.buttonsContainer}>
              <Button
                raised
                title="SAVE SETTINGS"
                buttonStyle={styles.saveButton}
                onPress={this.saveSettings}
              />
              <Button
                raised
                title="USE DEFAULT SMTP"
                buttonStyle={styles.defaultSmtpButton}
                onPress={this.useDefaultSmtp}
              />
            </View>
          </View>
        </ScrollView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(46, 50, 72, 1)',
  },
  inputContainerStyleTop: {
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(110, 120, 170, 1)',
    height: 50,
    width: SCREEN_WIDTH - 50,
    marginTop: 30,
    marginBottom: 10,
  },
  inputContainerStyle: {
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(110, 120, 170, 1)',
    height: 50,
    width: SCREEN_WIDTH - 50,
    marginTop: 10,
    marginBottom: 10,
  },
  inputContainerStyleBottom: {
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(110, 120, 170, 1)',
    height: 50,
    width: SCREEN_WIDTH - 50,
    marginTop: 10,
    marginBottom: 30,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: 'rgba(111, 202, 186, 1)',
  },
  defaultSmtpButton: {
    backgroundColor: '#00acc1',
  },
});
