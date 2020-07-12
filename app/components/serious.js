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

export default class Serious extends Component {
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
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.cancelled) {
        this.setState({ image: result.uri });
      }

      console.log(result);
    } catch (E) {
      console.log(E);
    }
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

  

  handleGoogleResponse(req,result) {
        
    if(req.includes("joke")){
        console.log(result);
        let text = result.queryResult.fulfillmentMessages[0].text.text[0];
        this.sendBotResponse(text);
    }
    else if(req.includes("civic")){
        var i=0;
        let text = [];
    for(i=0;i<result.length;i++){
        text.push("\n\n"+(i+1)+". "+result[i].name+"\nDescription: "+result[i].description+"\nCategory: "+result[i].category+"\nStatus: "+result[i].status+"\nType: "+result[i].type);
        
    }
    
    this.sendBotResponse(text);
    }
    else if(req.includes("advice")){
        console.log(result);
        let text = result;
        this.sendBotResponse(text);
    }
  
  else if(req.includes("weather")){
        let text = []
        
        text.push("\nFeels Like: "+(result[0]["feels_like"]*(9/5)-459.67).toFixed(2)+" F" +"\nTemperature: "+(result[0]["temp"]*(9/5)-459.67).toFixed(2)+" F" +"\nHumidity: "+result[0]["humidity"]+"\nPressure: "+result[0]["pressure"]);
        console.log(result[1]);
        text.push("\n"+result[1]["main"]+"\n"+result[1]["description"]);
        this.sendBotResponse(text);

  }
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
    console.log(message);
    var test = message;
    
    if(test.includes("weather")){
        fetch('https://api.openweathermap.org/data/2.5/weather?lat=34.51&lon=-117.41&appid=1f4f2ef2146f3fb37180e51479079695', {
        method: 'GET',
      })
    .then((response) => response.json())
    .then((responseJson) => {
        str = responseJson;
        
        let data = [];
        data.push(str.main);
        data.push(str.weather[0]);
        //console.log(data);
        this.handleGoogleResponse(test,data);
    })
    .catch((error) => {
        console.error(error);
    });
    }
    else if(test.includes("advice")){
        fetch('https://api.adviceslip.com/advice', {
        method: 'GET',
      })
    .then((response) => response.json())
    .then((responseJson) => {
        str = responseJson.slip;
        data = str.advice;
        
        console.log(data);
        this.handleGoogleResponse(test,data);
    })
    .catch((error) => {
        console.error(error);
    });
    }
    else{
        Dialogflow_V2.requestQuery(
            message,
            result => this.handleGoogleResponse(test,result),
            error => console.log(error)
          );
      
    }
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
    
    return (
      <View style={styles.container}>
        <Image source={require('../assets/images/serious.png')} style={styles.mode}></Image>
        <Text style={styles.modeSelect} onPress={()=>this.props.navigation.navigate('Chat')}>Serious</Text>
        <Image source={require('../assets/images/header.png')} style={styles.header}></Image>
        <Image source={require('../assets/images/image.png')} style={styles.image}></Image>
        <Text onPress={this._pickImage} style={{position:'absolute',zIndex:6,bottom:10,right:50, fontSize:20, color:'transparent'}} >"PICK"</Text>
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
          infiniteScroll 
          loadEarlier
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
    left:'15%',
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

