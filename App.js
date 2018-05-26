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
    text: 'Welcome to SMS Forwarder.\nForward your SMS to your email.',
    image: require('./assets/1.jpg'),
    imageStyle: styles.image,
    backgroundColor: '#59b2ab',
  },
  {
    key: 'somethun-dos',
    title: 'HOW IT WORKS',
    text: 'Simply specify your destination email and your filter (origination phone no and message) that you want to forward. Then click save and keep the app open.',
    image: require('./assets/2.jpg'),
    imageStyle: styles.image,
    backgroundColor: '#febe29',
  },
];

export default class App extends React.Component {
  state = {
    welcomeScreenFinished: false,
  };

  async componendDidMount() {
    try {
      const value = await AsyncStorage.getItem(
        '@SMSForwarder:welcomeScreenDone'
      );
      if (value !== null && value === 'true') {
        this.setState({
          welcomeScreenFinished: true,
        });
      }
    } catch (error) {
      // Error saving data
    }
  }

  _onDone = () => {
    try {
      AsyncStorage.setItem('@SMSForwarder:welcomeScreenDone', 'true');
    } catch (error) {
      // Error saving data
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
