// @flow

import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { TEXT, LINE, SILVER } from 'AppColors';
import { SFMedium } from 'AppFonts';
import Icon from 'react-native-vector-icons/MaterialIcons';

const styles = StyleSheet.create({
  SectionListItemStyle: {
    fontSize: 15,
    color: TEXT,
    paddingVertical: 5,
    backgroundColor: SILVER
  },
  SectionListItemStyle2: {
    fontSize: 12,
    color: LINE,
    paddingBottom: 5,
    backgroundColor: SILVER
  }
});

export function EmailListItem({
  dataSource,
  onClick
}) {

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: LINE }}>
      <TouchableOpacity
        onPress={() => { onClick(dataSource); }}
        style={{ paddingBottom: 2 }}
      >
        <View style={{ flexDirection: 'row', marginLeft: '3%', alignItems: 'center' }}>
          <View style={{ width: '60%' }}>
            <SFMedium
              style={styles.SectionListItemStyle}
            >
              {dataSource.name}
            </SFMedium>
            <SFMedium
              style={styles.SectionListItemStyle2}
            >
              {dataSource.email}
            </SFMedium>
          </View>
          {dataSource.check &&
          <View style={{ marginLeft: '25%' }}>
            <Icon name="check" color="#7ED321" size={20} />
          </View>
          }
        </View>
      </TouchableOpacity>
    </View>
  );
}
