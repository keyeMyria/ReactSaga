// @flow

import React from 'react';
import { Image } from 'react-native';
import { createImageProgress } from 'react-native-image-progress';
import FastImage from 'react-native-fast-image';

const RNFastImage = createImageProgress(FastImage);

export function OMImage(props) {
  const source = props.source;
  if (!source || !source.uri) {
    return (
      <Image
        {...props}
        source={props.placeholder}
      />
    );
  }

  if (source.uri.indexOf('http') < 0 && source.uri.indexOf('https') < 0) {
    return (
      <Image
        {...props}
      />
    );
  }

  return (
    <RNFastImage
      {...props}
    />
  );
}
