import React, { useState, useCallback, useEffect, Component } from 'react'
import { StyleSheet, Text, View, Image, Button} from 'react-native';

import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat'
import { Dialogflow_V2 } from 'react-native-dialogflow';
import { dialogflowConfig } from '../env';

import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';



const BOT_USER = {
  _id: 2,
  name: 'FunnyBunny',
  avatar: require('../assets/images/bunny.png')
};

export default class Chat extends Component {
  state = {
    image: null,
    messages: [
      {
        _id: 1,
        text: `Hey there! I'm FunnyBunny.\nWhat's up?`,
        createdAt: new Date(),
        user: BOT_USER
      }
    ],
  
  };

  
  componentDidMount() {
    
    this.getPermissionAsync();
    Dialogflow_V2.setConfiguration(
      dialogflowConfig.client_email,
      dialogflowConfig.private_key,
      Dialogflow_V2.LANG_ENGLISH_US,
      dialogflowConfig.project_id
    );
  }

  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permission to make this work!');
      }
    }
  };

  _pickImage = async () => {
    
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [9,12],
        quality: 0.5,
        base64: true,
      });
      if (result.cancelled) {
        this.setState({ image: null });
      }
      

      console.log(result);
    

    let cloudinary = 'https://api.cloudinary.com/v1_1/diywehkap/image/upload';
    //this.setState({ localUri: result.uri });
    let base64Img = `data:image/jpg;base64,${result.base64}`;

    let data = {
      "file": base64Img,
      "upload_preset": "hm4fkyir",
    }
    fetch(cloudinary, {
      body: JSON.stringify(data),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
    }).then(async r => {
      let data = await r.json()
      let cUrl=data.secure_url;
      let pUrl=cUrl.toString();
      console.log(pUrl);
      this.setState({ image: pUrl });
      

              
          }).catch(err=>console.log(err));
    

  };

  renderSend(props) {
    return (
        <Send
            {...props}
        >
            <View style={{marginRight: 10, marginBottom: 5}}>
                <Image source={require('../assets/images/send.png')} />
            </View>
        </Send>
    );
};


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
    let text = result.toString();
    console.log(text);
    this.sendBotResponse(text);
  }

  onSend(messages = [], image) {
    image=this.state.image;
    console.log(this.state.image);
    const msg = {
      ...messages[0],
      image
    };
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, msg)
    }));

    let message = messages[0].text;

    fetch('http://acd835cbbea3.ngrok.io/teacup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'            
            },
            body: JSON.stringify({img:image})
          }).then(response => response.json())
          .then(data => {
            console.log(data);
            console.log(data.res);
            this.handleGoogleResponse(data.res);
          })
          .catch(err=>console.log(err));

    /*
    fetch('http://3cdd4b10abe4.ngrok.io/talkback', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "text": message
                    })
            })
                .then((response) => response.json())
                .then((responseJson) => {
            console.log(responseJson);
            this.handleGoogleResponse(responseJson);
                })
                .catch((error) => {
                    console.error(error);
                });*/

   /*} fetch('https://reactnative.dev/movies.json')
      .then((response) => response.json())
      .then((json) => {
        this.setState({ data: json.movies });
        this.handleGoogleResponse(json.movies),
        console.log(this.state.data);
      })*/
   
  }

  sendBotResponse(text) {
    let msg = {
      _id: this.state.messages.length + 1,
      text,
      createdAt: new Date(),
      user: BOT_USER
    };
    console.log(msg);

    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg])
    }));
  }

  render() {
    
    return (
      <View style={styles.container}>
        <Image source={require('../assets/images/sarcastic.png')} style={styles.mode}></Image>
        <Text style={styles.modeSelect} onPress={()=>this.props.navigation.navigate('Serious')}>Serious</Text>
        <Image source={require('../assets/images/header.png')} style={styles.header}></Image><Text>1</Text>
        <Image source={require('../assets/images/image.png')} style={styles.image}></Image>
        <Text onPress={this._pickImage} style={{position:'absolute',zIndex:6,bottom:10,right:50, fontSize:20, color:'transparent'}} >"PICK!"</Text>
        <GiftedChat
          
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1
          }}
          renderBubble={this.renderBubble}
          isTyping
          alwaysShowSend 
          renderSend={this.renderSend}
        />
      </View>
    );
  
  }
}


const styles = StyleSheet.create({
  container: {
    height:'100%',
    position:'relative',
    backgroundColor: '#FFF4F4',
    
  },
  header:{
    height:200,
    width:'100%',
    resizeMode: 'contain',
    position:'absolute',
    top:-70,
    zIndex:2,
  },
  mode:{
    
    width:'100%',
    resizeMode: 'contain',
    position:'absolute',
    top:40,
    zIndex:2,
  },
  modeSelect:{
    fontSize:30,
    position:'absolute',
    top:'11%',
    right:'15%',
    zIndex:4,
    color:'transparent',
  },
  image:{
    
    resizeMode: 'contain',
    position:'absolute',
    bottom:6,
    right:50,
    zIndex:5,
  }
  
});

