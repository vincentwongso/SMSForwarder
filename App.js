import React from 'react';
import { StyleSheet, AsyncStorage } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

import SMSForwarder from './SMSForwarder';

const styles = StyleSheet.create({
  image: {
    width: 320,
    height: 320,
  },
});

const slides = [
  {
    key: 'FirstPage',
    title: 'SMS Forwarder',
    text: 'Welcome to SMS Forwarder.\nAutomatically forward received SMS to your email.',
    image: require('./assets/1.jpg'),
    imageStyle: styles.image,
    backgroundColor: '#59b2ab',
  },
  {
    key: 'somethun-dos',
    title: 'HOW IT WORKS',
    text: '1. Specify email destination.\n2. Specify sms filter (phone no & message body)\n3. Save.',
    image: require('./assets/2.jpg'),
    imageStyle: styles.image,
    backgroundColor: '#febe29',
  },
];

export default class App extends React.Component {
  state = {
    welcomeScreenFinished: false,
  };

  async componentWillMount() {
    console.log('component will mount');
    try {
      const value = await AsyncStorage.getItem(
        '@SMSForwarder:welcomeScreenDone'
      );
      console.log('trying to get value', value);
      if (value !== null && value === 'true') {
        this.setState({
          welcomeScreenFinished: true,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  _onDone = () => {
    try {
      AsyncStorage.setItem('@SMSForwarder:welcomeScreenDone', 'true');
    } catch (error) {
      console.log(error);
    }
    this.setState({
      welcomeScreenFinished: true,
    });
  };
  render() {
    if (!this.state.welcomeScreenFinished) {
      return <AppIntroSlider slides={slides} onDone={this._onDone} />;
    }
    return <SMSForwarder />;
  }
}
