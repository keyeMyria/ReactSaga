// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View
} from 'react-native';
import MapView from 'react-native-maps';
import supercluster from 'supercluster';
import _ from 'lodash';
import { Marker } from './Marker';
import { fakers } from './faker';

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
      cluster: null,
      fakers,
      mapPoints: props.mapPoints
    };
  }

  setMarkers = (mapPoints) => {
    const cluster = supercluster({
      radius: 50,
      maxZoom: 16
    });

    cluster.load(mapPoints);

    this.setState({ cluster, isFake: false, mapPoints: [] });
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

        /* eslint-disable */
        return points.map((point) => {
          return (
            <Marker
              key={`${point.properties.id}:${point.geometry.coordinates[1]}:${point.geometry.coordinates[0]}`}
              onPress={() => this.onPressMarker(point)}
              text={getCount(point)}
              region={{
                latitude: point.geometry.coordinates[1],
                longitude: point.geometry.coordinates[0]
              }}
            />
          );
        });
        /* eslint-disable */
      } catch (e) {
        return [];
      }
    }

    const { mapPoints } = this.state;

    return mapPoints.map((point) => {
      return (
        <Marker
          key={point.properties.id}
          onPress={() => this.onPressMarker(point)}
          text={point.properties.point_count}
          region={{
            latitude: point.geometry.coordinates[1],
            longitude: point.geometry.coordinates[0]
          }}
        />
      );
    });
  };

  onPressMarker = (point) => {
    const { onPressMarker } = this.props;

    if (!point) {
      if (onPressMarker) {
        onPressMarker([]);
      }
    } else {
      if (point.properties.cluster_id) {
        const points = this.state.cluster.getLeaves(point.properties.cluster_id);

        if (onPressMarker) {
          const firstElement = points[0];
          if (firstElement.properties.providers_ids) {
            onPressMarker(points, false);
          } else {
            const geoDetail = {
              latitude: firstElement.geometry.coordinates[1],
              longitude: firstElement.geometry.coordinates[0]
            };

            onPressMarker(geoDetail, true);
          }
        }
      } else {
        if (onPressMarker) {
          if (point.properties.providers_ids) {
            onPressMarker([point], false);
          } else {
            const geoDetail = {
              latitude: point.geometry.coordinates[1],
              longitude: point.geometry.coordinates[0]
            };

            onPressMarker(geoDetail, true);
          }
        }
      }
    }
  };

  animateToRegion = (region, duration = 2000) => {
    this.map.animateToRegion(region, duration);
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
