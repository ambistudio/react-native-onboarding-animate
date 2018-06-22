# React Native Onboarding Animate
React native component for onboarding processes with animation

## Demo

[Onboarding Animation Expo's snack](https://snack.expo.io/@hieunc/on-boarding-animation)

## Install

Install `react-native-onboarding-animate` package and save into `package.json`:
```ssh
$ npm install react-native-onboarding-animate --save
```

## How to use?

```javascript
import React, { Component } from 'react';

import OnBoardingView from 'react-native-onboarding-animate';
import {
  FirstScene,
  SecondScene,
  ThirdScene
} from './ExampleScenes';

export default class App extends Component {
  
  render() {

    // Define scenes, it will be displayed in order
    let scenes = [
      {
        component: FirstScene,
        backgroundColor: 'yellow'
      }, {
        component: SecondScene,
        backgroundColor: 'orange'
      }, {
        component: ThirdScene,
        backgroundColor: 'red'
      }
    ];

    return <OnBoardingView
        scenes={scenes}
        enableBackgroundColorTransition={true}
    />;
  }
}

```

## Properties

| Name | Type | Default Value | Definition |
| ---- | ---- | ------------- | ---------- |
| scenes | array of object { component: (required), backgroundColor: (optional) } | - | component: the view that will be displayed, backgroundColor: color of the view's background that will be animated
| enableBackgroundColorTransition | boolean | undefined | Set to `true` to animate background color when transitining view/component

## Todo

- Test on android
- Create tests