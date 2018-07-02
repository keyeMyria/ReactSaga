// // @flow
//
// import React, { PureComponent } from 'react';
// import PropTypes from 'prop-types';
// import { View, TouchableOpacity, Text } from 'react-native';
// import styles from '../../Styles/SearchDoubleBarStyles';
// import { Colors, Metrics } from '../../../Themes/index';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import Entypo from 'react-native-vector-icons/Entypo';
// import I18n from 'react-native-i18n';
// import { Actions as NavigationActions } from 'react-native-router-flux';
//
// export class SearchDoubleBar extends PureComponent {
//
//   static propTypes = {
//     searchTextProvider: PropTypes.string,
//     searchTextLocation: PropTypes.string
//   };
//
//   render() {
//     const { searchTextLocation, searchTextProvider, onSearch, onShowLocation } = this.props;
//
//     return (
//       <View
//         style={[styles.container, this.props.grey
//           ? { backgroundColor: Colors.backgroundGrey }
//           : {},
//           this.props.style
//         ]}
//       >
//         <TouchableOpacity
//           onPress={() => NavigationActions.searchSuggest({ searchType: 'provider', onSearch })}
//           style={styles.row}
//         >
//           <Icon name={'search'} size={Metrics.icons.small} style={styles.searchIcon} />
//           <Text style={styles.searchInput}>
//             {searchTextProvider ||
//               <Text style={styles.placeholder}>{I18n.t('searchExample')}</Text>
//             }
//           </Text>
//         </TouchableOpacity>
//         <View style={[styles.hr, this.props.grey ? { borderBottomColor: Colors.snow } : null]} />
//         <TouchableOpacity
//           onPress={() => NavigationActions.searchSuggest({
//             searchType: 'location', onSearch, onShowLocation })
//           }
//           style={styles.row}
//         >
//           <Entypo name={'location'} size={Metrics.icons.small} style={styles.searchIcon} />
//           <Text style={styles.searchInput}>
//             {searchTextLocation ||
//               <Text style={styles.placeholder}>{I18n.t('location')}</Text>
//             }
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }
// }
