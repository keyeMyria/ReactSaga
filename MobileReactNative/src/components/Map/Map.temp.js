// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View
} from 'react-native';
import MapView from 'react-native-maps';
import supercluster from 'supercluster';
import { requestLocationAccess, AlertMessage } from 'AppUtilities';
import _ from 'lodash';
import { Marker } from './Marker';
import { fakers } from './faker';
import { DEFAULT_COORDS, PermissionsAndroid } from 'AppConstants';
import GeolocationAPI from 'react-native/Libraries/Geolocation/Geolocation';

const geolocationErrors = {
  1: ['Permission Denied', 'We haven\'t permission for this operation'],
  2: ['Position Unavailable', 'Please turn on your GPS'],
  3: ['Can\'t load location', 'We can\'t find you location'],
};

export class Map extends PureComponent {
  static propTypes = {
    initialRegion: PropTypes.object,
    onRegionChange: PropTypes.func,
    onRegionChangeComplete: PropTypes.func,
    onPressMarker: PropTypes.func
  };

  static defaultProps = {
    mapPoints: []
  };

  constructor(props) {
    super(props);

    this.state = {
      region: {},
      isFake: true,
      fakers,
      cluster: null
    };
  }

  setFakeMarkers = () => this.setState({ isFake: true });

  setMarkers = (mapPoints) => {
    const cluster = supercluster({
      radius: 50,
      maxZoom: 16
    });

    cluster.load(mapPoints);

    this.setState({ cluster, isFake: false });
  };

  renderFakeMakers = () => {
    return this.state.fakers.map((point, i) => {
      return (
        <Marker
          key={i}
          onPress={() => this.onPressMarker(null)}
          text={point.count}
          region={{
            latitude: point.geo[0],
            longitude: point.geo[1]
          }}
        />
      );
    });
  };

  renderMarkers = () => {
    const { region, cluster } = this.state;
    if (cluster) {
      try {
        const padding = 0.1;
        const getZoomLevel = () => {
          const angle = region.longitudeDelta;
          return Math.round(Math.log(360 / angle) / Math.LN2);
        };

        const getCount = (point) => {
          if (point.properties.id) {
            return point.properties.point_count;
          }

          const points = cluster.getLeaves(point.properties.cluster_id, 9999);
          return _.sumBy(points, subPoint => subPoint.properties.point_count);
        };

        const points = cluster.getClusters([
          region.longitude - (region.longitudeDelta * (0.5 + padding)),
          region.latitude - (region.latitudeDelta * (0.5 + padding)),
          region.longitude + (region.longitudeDelta * (0.5 + padding)),
          region.latitude + (region.latitudeDelta * (0.5 + padding))
        ], getZoomLevel());

        return points.map((point) => {
          return (
            <Marker
              key={point.properties.id || point.properties.cluster_id}
              onPress={() => this.onPressMarker(point)}
              text={getCount(point)}
              region={{
                latitude: point.geometry.coordinates[1],
                longitude: point.geometry.coordinates[0]
              }}
            />
          );
        });
      } catch (e) {
        return [];
      }
    }

    return [];
  };

  onPressMarker = (point) => {
    const { onPressMarker } = this.props;

    if (!point) {
      onPressMarker([]);
    } else {
      if (point.properties.cluster_id) {
        const points = this.state.cluster.getLeaves(point.properties.cluster_id);
        if (onPressMarker) {
          onPressMarker(points);
        }
      } else {
        if (onPressMarker) {
          onPressMarker([point]);
        }
      }
    }
  };

  animateToRegion = (region) => {
    this.map.animateToRegion(region, 2000);
  };

  goToRegion = (region, padding) => {
    this.map.fitToCoordinates(region, {
      edgePadding: { top: padding, right: padding, bottom: padding, left: padding },
      animated: true
    });
  };

  onChangeRegionComplete = (region) => {
    const { onChangeRegionComplete } = this.props;

    this.setState({ region });

    if (onChangeRegionComplete) {
      onChangeRegionComplete(region);
    }
  };

  onChangeRegion = (region) => {
    const { onChangeRegion } = this.props;

    if (onChangeRegion) {
      onChangeRegion(region);
    }
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <MapView
          ref={ref => this.map = ref}
          style={{ flex: 1 }}
          {...this.props}
          onRegionChange={this.onChangeRegion}
          onRegionChangeComplete={this.onChangeRegionComplete}
        >
          {this.state.isFake && this.renderFakeMakers()}
          {!this.state.isFake && this.renderMarkers()}
        </MapView>
      </View>
    );
  }
}

Map.propTypes = {
  enableToLoadUserLocation: PropTypes.bool,
  setLocation: PropTypes.func.isRequired,
};

Map.defaultProps = {
  enableToLoadUserLocation: false
};
