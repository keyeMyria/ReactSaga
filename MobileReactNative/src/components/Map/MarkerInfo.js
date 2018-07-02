// @flow

import React from 'react';
import { Text, View, Image } from 'react-native';

import MapView from 'react-native-maps';
import styles from '../Styles/MarkerInfoStyle';
import I18n from 'react-native-i18n';
import openMap from 'react-native-open-maps';

export class MarkerInfo extends React.PureComponent {

  state = {
    initialRender: true
  };

  render() {
    const { region, text } = this.props;

    return (
      <MapView.Marker
        coordinate={region}
        onPress={() => openMap(region)}
        flat
        anchor={{ x: 0.1, y: 1 }}
      >
        <View style={styles.container}>
          <Image
            source={require('img/images/marker-info.png')}
            style={styles.backgroundImage}
            onLayout={() => this.setState({ initialRender: false })}
            key={`${this.state.initialRender}`}
          />
          <Text allowFontScaling={false} numberOfLines={1} style={styles.text} >
            {text}
          </Text>
          <Text allowFontScaling={false} style={styles.openInMap}>
            {I18n.t('openInMap')}
          </Text>
        </View>
      </MapView.Marker>
    );
  }
}
