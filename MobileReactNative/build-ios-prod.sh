#!/bin/sh
rm -rf node_modules .env
npm install
cd ios
xcodebuild -alltargets clean
cd ..
(
    echo API_URL=https://bt-prod-pi.openmed.com/api/
    echo MAP_API_KEY=AIzaSyB5WVjj_VUj8RSvbQ8TCLldGFVJ08sOcb8
    echo GCM_SENDER_ID=852219021425
    echo FABRIC_API_KEY=071ae7313174ab876a71747cf531767025d3ea2a
    echo FACEBOOK_CUSTOM_URL_SCHEME=fb502518403432907
    echo FACEBOOK_APP_ID=502518403432907
    echo FACEBOOK_APP_NAME=OpenMed
    echo TERM_URL=https://goo.gl/UG2yAo 
) > .env
react-native run-ios --configuration Release
