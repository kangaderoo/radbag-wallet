import React from 'react';
import { ScrollView, Text, TouchableOpacity,FlatList, SectionList, View, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';
import { ListItem, Avatar } from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale'; // https://github.com/kohver/react-native-touchable-scale
import LinearGradient from 'react-native-linear-gradient'; // Only if no expo
import IconMaterial  from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFA  from 'react-native-vector-icons/FontAwesome5';


const Separator = () => (
  <View style={styles.separator} />
);

const list = [
  {
    name: 'Amy Farha',
    avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
    subtitle: 'Vice President'
  },
  {
    name: 'Chris Jackson',
    avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
    subtitle: 'Vice Chairman'
  },
];

 const Settings = ({route, navigation}) => {
 return ( 
     <ScrollView style={styles.scrollView} > 


  <View>
  <Separator/>

 <ListItem
  onPress={() => {navigation.navigate('Mnemonic Display')}}
  Component={TouchableScale}
  friction={90} //
  tension={100} // These props are passed to the parent component (here TouchableScale)
  activeScale={0.95} //
  linearGradientProps={{
    colors: ['#ffffff', '#ffffff'],
    start: { x: 1, y: 0 },
    end: { x: 0.2, y: 0 },
  }}
  ViewComponent={LinearGradient} // Only if no expo
>

<IconMaterial name="file-word-box-outline" size={20} color="#4F8EF7" />

  <ListItem.Content >
  
    <ListItem.Title >
 <Text style={{fontSize:14,  color: 'black', fontWeight: 'bold', flex:1  }}>Show Mnemonic</Text>

    </ListItem.Title>

    <ListItem.Subtitle  >
      <Text style={{fontSize:14,  color: 'black', flexWrap: 'wrap', flex:1 }}>Show the mnemonic phrase that you set up when you created this wallet</Text>
    </ListItem.Subtitle>

  </ListItem.Content>
  <ListItem.Chevron color="black" />
  

</ListItem>


<Separator/>

{/* <ListItem
 onPress={() => {alert("ASF")}}
  Component={TouchableScale}
  friction={90} //
  tension={100} // These props are passed to the parent component (here TouchableScale)
  activeScale={0.95} //
  linearGradientProps={{
    colors: ['#ffffff', '#ffffff'],
    start: { x: 1, y: 0 },
    end: { x: 0.2, y: 0 },
  }}
  ViewComponent={LinearGradient} // Only if no expo
>
<IconFA name="network-wired" size={20} color="#4F8EF7" />
  <ListItem.Content>
    <ListItem.Title style={{fontSize:14, color: 'black', fontWeight: 'bold' }}>
      <Text>Select Network</Text>
    </ListItem.Title>
    <ListItem.Subtitle style={{fontSize:14,  color: 'black' }}>
      <Text>Select the Radix network that this app should connect to</Text>
    </ListItem.Subtitle>
  </ListItem.Content>
  <ListItem.Chevron color="black" />
</ListItem> 

<Separator/>*/}

<ListItem
 onPress={() => {navigation.navigate('Address Options')}}
  Component={TouchableScale}
  friction={90} //
  tension={100} // These props are passed to the parent component (here TouchableScale)
  activeScale={0.95} //
  linearGradientProps={{
    colors: ['#ffffff', '#ffffff'],
    start: { x: 1, y: 0 },
    end: { x: 0.2, y: 0 },
  }}
  ViewComponent={LinearGradient} // Only if no expo
>
<IconMaterial name="pound" size={20} color="#4F8EF7"/>
  <ListItem.Content>
    <ListItem.Title style={{fontSize:14,  color: 'black', fontWeight: 'bold' }}>
      <Text>Address Options</Text>
    </ListItem.Title>
    <ListItem.Subtitle style={{fontSize:14,  color: 'black' }}>
      <Text>Options for the currently selected address</Text>
    </ListItem.Subtitle>
  </ListItem.Content>
  <ListItem.Chevron color="black" />
</ListItem>
<Separator/>

<ListItem
 onPress={() => {navigation.navigate('Wallet Options')}}
  Component={TouchableScale}
  friction={90} //
  tension={100} // These props are passed to the parent component (here TouchableScale)
  activeScale={0.95} //
  linearGradientProps={{
    colors: ['#ffffff', '#ffffff'],
    start: { x: 1, y: 0 },
    end: { x: 0.2, y: 0 },
  }}
  ViewComponent={LinearGradient} // Only if no expo
>
<IconMaterial name="wallet" size={20} color="#4F8EF7"/>
  <ListItem.Content>
    <ListItem.Title style={{fontSize:14,  color: 'black', fontWeight: 'bold' }}>
      <Text>Wallet Options</Text>
    </ListItem.Title>
    <ListItem.Subtitle style={{fontSize:14,  color: 'black' }}>
      <Text>Options for the currently selected wallet</Text>
    </ListItem.Subtitle>
  </ListItem.Content>
  <ListItem.Chevron color="black" />
</ListItem>
<Separator/>

{/* <ListItem
 onPress={() => {alert("ASF")}}
  Component={TouchableScale}
  friction={90} //
  tension={100} // These props are passed to the parent component (here TouchableScale)
  activeScale={0.95} //
  linearGradientProps={{
    colors: ['#ffffff', '#ffffff'],
    start: { x: 1, y: 0 },
    end: { x: 0.2, y: 0 },
  }}
  ViewComponent={LinearGradient} // Only if no expo
>
<IconMaterial name="delete-forever-outline" size={20} color="#4F8EF7" />
  <ListItem.Content>
    <ListItem.Title style={{fontSize:14,  color: 'black', fontWeight: 'bold' }}>
      <Text>Remove Address</Text>
    </ListItem.Title>
    <ListItem.Subtitle style={{fontSize:14,  color: 'black' }}>
      <Text>Remove the currently selected address</Text>
    </ListItem.Subtitle>
  </ListItem.Content>
  <ListItem.Chevron color="black" />
</ListItem>
<Separator/> */}

{/* <ListItem
 onPress={() => {alert("ASF")}}
  Component={TouchableScale}
  friction={90} //
  tension={100} // These props are passed to the parent component (here TouchableScale)
  activeScale={0.95} //
  linearGradientProps={{
    colors: ['#ffffff', '#ffffff'],
    start: { x: 1, y: 0 },
    end: { x: 0.2, y: 0 },
  }}
  ViewComponent={LinearGradient} // Only if no expo
>
<IconMaterial name="delete-forever-outline" size={20} color="#4F8EF7" />
  <ListItem.Content>
    <ListItem.Title style={{fontSize:14,  color: 'black', fontWeight: 'bold' }}>
      <Text>Remove Wallet</Text>
    </ListItem.Title>
    <ListItem.Subtitle style={{fontSize:14,  color: 'black' }}>
      <Text>Remove the currently selected wallet{"\n"}{"\n"}(NOTE: This will also remove all addresses associated to the currently selected wallet)</Text>
    </ListItem.Subtitle>
  </ListItem.Content>
  <ListItem.Chevron color="black" />
</ListItem> 

<Separator/>*/}


  </View>  
  
  </ScrollView>)
};


const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical:35
  },
  container: {
    flex: 1,
    paddingTop: 22
   },
   sectionHeader: {
     paddingTop: 2,
     paddingLeft: 10,
     paddingRight: 10,
     paddingBottom: 2,
     fontSize: 14,
     fontWeight: 'bold',
     backgroundColor: 'rgba(247,247,247,1.0)',
   },
   item: {
     padding: 10,
     fontSize: 18,
     height: 44,
   },
   separator: {
    marginVertical: 0,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default Settings;
