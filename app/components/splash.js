import React from 'react';
import { StyleSheet, Text, View, Image} from 'react-native';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';

let customFonts  = {
  'Avenir': require('../assets/fonts/Avenir.ttf'),
  'Futura': require('../assets/fonts/Futura.ttf'),
};

export default class Splash extends React.Component  {
  state = {
    fontsLoaded: false,
  };

  async _loadFontsAsync() {
    await Font.loadAsync(customFonts);
    this.setState({ fontsLoaded: true });
  }

  componentDidMount() {
    this._loadFontsAsync();
  }

  render(){
    if (this.state.fontsLoaded) {
    return (
    <View style={styles.container}>
      <Image source={require('../assets/images/splash.png')} style={styles.header}></Image>
      <Text style={{position:'absolute',zIndex:3,fontSize:100,top:50,left:'20%', color:'transparent'}}onPress={()=>this.props.navigation.navigate('Chat')}>NEXT</Text>
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
    backgroundColor: '#8a91f9',
    
  },
  header:{
    height:'100%',
    width:'100%',
  },
  
});