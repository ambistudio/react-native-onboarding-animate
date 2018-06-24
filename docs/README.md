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

import OnboardingAnimate from 'react-native-onboarding-animate';
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

    return <OnboardingAnimate
        scenes={scenes}
        enableBackgroundColorTransition={true}
    />;
  }
}

```

### animatedValue

Each of scence will be injected in `this.props` with an `animatedValue` with `inputRange = [0, windowWidth]`. This can be used for any animation within the scence by using interpolate. For example:

```javascript
    var animateValue = this.props.animatedValue.interpolate({
        inputRange: [0, windowWidth],
        outputRange: [0, 10]
    })
```

(Please see actual code in the Expo example, file `./ExampleScenes/FirstScene.js` line `19` )

## Properties

| Name | Type | Default Value | Definition |
| ---- | ---- | ------------- | ---------- |
| scenes | array of object { component: (required), backgroundColor: (optional) } | - | component: the view that will be displayed, backgroundColor: color of the view's background that will be animated
| enableBackgroundColorTransition | boolean | undefined | Set to `true` to animate background color when transitining view/component
| activeColor | string (hex, rgba, etc.) | `rgba(32, 119, 336, 1)` | color of active indicator, `Continue` button background color
| inactiveColor | string (hex, rgba, etc.) |  `rgba(0, 0, 0, 0.2)` | color of inactive indicator


### Property injected in each scence `props`

| Name | Type | Default Value | Definition |
| ---- | ---- | ------------- | ---------- |
| animatedValue | interpolate value of Animated.Value | inputRange: [0, windowWidth] | an animated value, use for animation within a page by using `this.props.animatedValue.interpolate`

## Todo

- Test on android
- Create tests