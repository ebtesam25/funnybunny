import React, { useState, useCallback, useEffect, Component } from 'react'
import { StyleSheet, Text, View, Image} from 'react-native';
import { AppLoading } from 'expo';
import { GiftedChat, Bubble } from 'react-native-gifted-chat'


let customFonts  = {
  'Avenir': require('../assets/fonts/Avenir.ttf'),
  'Futura': require('../assets/fonts/Futura.ttf'),
};


const BOT_USER = {
  _id: 2,
  name: 'FunnyBunny',
  avatar: require('../assets/images/bunny.png')
};

export default class Chat extends Component {
  state = {
    messages: [
      {
        _id: 1,
        text: `Hey there! I'm FunnyBunny.\nWhat's up?`,
        createdAt: new Date(),
        user: BOT_USER
      }
    ],
    fontsLoaded: false,
  };

  async _loadFontsAsync() {
    await Font.loadAsync(customFonts);
    this.setState({ fontsLoaded: true });
  }

  componentDidMount() {
    this._loadFontsAsync();
  }

  renderBubble(props) {
    return (
      // Step 3: return the component
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            // Here is the color change
            backgroundColor: '#A3CBEA'
          },
          left: {
            backgroundColor: '#EEB0BC'
          }
        }}
        textStyle={{
          right: {
            color: '#fff'
          },
          left: {
            color: '#fff'
          }
        }}
      />
    );
  };

  

  handleGoogleResponse(result) {
    let text = result[0].title;
    this.sendBotResponse(text);
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages)
    }));

    let message = messages[0].text;

    fetch('https://reactnative.dev/movies.json')
      .then((response) => response.json())
      .then((json) => {
        this.setState({ data: json.movies });
        this.handleGoogleResponse(json.movies),
        console.log(this.state.data);
      })
   
  }

  sendBotResponse(text) {
    let msg = {
      _id: this.state.messages.length + 1,
      text,
      createdAt: new Date(),
      user: BOT_USER
    };

    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg])
    }));
  }

  render() {
    if (this.state.fontsLoaded) {
    return (
      <View style={styles.container}>
        <Image source={require('../assets/images/header.png')} style={styles.header}></Image>
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1
          }}
          renderBubble={this.renderBubble}
          textInputStyle={{fontFamily:'Futura'}}
        />
      </View>
    );
  }
  else {
  return <AppLoading />;
  }
  }
}


const styles = StyleSheet.create({
  container: {
    height:'100%',
    position:'relative',
    backgroundColor: '#FFF4F4',
    fontFamily: 'Futura',
  },
  header:{
    height:'35%',
    width:'100%',
    resizeMode: 'contain',
    position:'absolute',
    top:'-15%',
  },
  
});

