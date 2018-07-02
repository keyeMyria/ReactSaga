// @flow

import React, { PureComponent } from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import { TINT } from 'AppColors';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 50,
    height: 75
  },
  backgroundImage: {
    position: 'absolute',
    width: 50,
    height: 75,
    resizeMode: 'cover'
  },
  text: {
    marginTop: 12,
    color: TINT,
    fontSize: 12,
    fontWeight: 'bold'
  }
});

export class Marker extends PureComponent {

  state = {
    initialRender: true
  };

  render() {
    const { region, text } = this.props;

    return (
      <MapView.Marker
        coordinate={region}
        onPress={this.props.onPress}
      >
        <View style={styles.container} >
          <Image source={require('img/images/marker.png')}
            style={styles.backgroundImage}
            onLayout={() => this.setState({ initialRender: false })}
            key={`${this.state.initialRender}`}
          />
          <Text
            allowFontScaling={false} numberOfLines={1}
            style={styles.text}
          >
            {text}
          </Text>
        </View>
      </MapView.Marker>
    );
  }
}
