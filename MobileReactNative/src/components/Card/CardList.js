// @flow
import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity
} from 'react-native';
import {
  PRIMARY_COLOR,
  BACKGROUND,
  LINE,
  TEXT
} from 'AppColors';

import { WINDOW_WIDTH } from 'AppConstants';
import { OMImage } from 'AppComponents';
import { SFBold, SFRegular } from 'AppFonts';
import Icon from 'react-native-vector-icons/Ionicons';
import Swipeout from 'react-native-swipeout';
import * as Progress from 'react-native-progress';

const styles = StyleSheet.create({
  mainView: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderColor: LINE,
    borderBottomWidth: 0.5,
    width: WINDOW_WIDTH
  },
  cardImage: {
    width: WINDOW_WIDTH * 0.15,
    marginLeft: 10
  },
  cardNumber: {
    width: WINDOW_WIDTH * 0.37
  },
  cardActive: {
    width: WINDOW_WIDTH * 0.30
  },
  arrowView: {
    width: WINDOW_WIDTH * 0.05
  },
  activeText: {
    fontSize: 14,
    color: PRIMARY_COLOR,
  },
  cardNumberText: {
    fontSize: 16,
    color: TEXT
  }
});

export class CardList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { cardImage: require('img/images/card/credit-card.png') };
  }

  setCardImage = (brand) => {
    let cardImage;
    try {
      switch (brand.toLowerCase()) {
        case 'mastercard':
          cardImage = require('img/images/card/mastercard.png');
          this.setState({ cardImage });
          break;
        case 'american express':
          cardImage = require('img/images/card/american-express.png');
          this.setState({ cardImage });
          break;
        case 'visa':
          cardImage = require('img/images/card/visa.png');
          this.setState({ cardImage });
          break;
        case 'discover':
          cardImage = require('img/images/card/discover.png');
          this.setState({ cardImage });
          break;
        case 'diners club':
          cardImage = require('img/images/card/diners-club-credit-card-logo.png');
          this.setState({ cardImage });
          break;
        case 'jcb':
          cardImage = require('img/images/card/jcb.png');
          this.setState({ cardImage });
          break;
        default:
          cardImage = require('img/images/card/credit-card.png');
          this.setState({ cardImage });
          break;
      }
    } catch (e) {
      cardImage = require('img/images/card/credit-card.png');
      this.setState({ cardImage });
    }
  }

  render() {
    const {
      cardData,
      onPressDeletePayment,
      onSelectCard
    } = this.props;

    this.setCardImage(cardData.brand);
    const swipeBtns = [
      {
        component: (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}
          >
            <TouchableOpacity
              onPress={() => { onPressDeletePayment(cardData.id); }}
            >
              <View style={{
                justifyContent: 'center',
                flex: 1,
                backgroundColor: 'red',
                width: 80,
                alignItems: 'center'
              }}
              >
                <SFBold style={{ color: '#fff', fontSize: 16 }}>Delete</SFBold>
              </View>
            </TouchableOpacity>
          </View>
        ),
        backgroundColor: BACKGROUND,
      }
    ];

    return (
      <View>
        <Swipeout
          right={swipeBtns}
          backgroundColor="transparent"
          buttonWidth={80}
          autoClose={true}
          close={true}
        >
          <TouchableOpacity
            onPress={() => { onSelectCard(cardData); }}
          >
            <View style={styles.mainView}>
              <View style={styles.cardImage}>
                <OMImage
                  style={{ height: 25, width: 25 }}
                  resizeMode={'contain'}
                  indicator={Progress.Circle}
                  indicatorProps={{
                    size: 10,
                    thickness: 0.5,
                    borderWidth: 0,
                    color: PRIMARY_COLOR,
                  }}
                  placeholder={this.state.cardImage}
                  threshold={50}
                />
              </View>
              <View style={styles.cardNumber}>
                <SFRegular style={styles.cardNumberText}>**** {cardData.last4}</SFRegular>
              </View>
              {
                <View style={styles.cardActive}>
                  { cardData.is_main &&
                  <SFRegular style={styles.activeText}>
                  Preferred
                  </SFRegular>}
                </View>
              }
              <View style={styles.arrowView}>
                <Icon name={'ios-arrow-forward'} size={20} style={{ color: LINE }} />
              </View>
            </View>
          </TouchableOpacity>
        </Swipeout>
      </View>
    );
  }
}
