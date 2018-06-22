import React from 'react';
import { Animated, View, PanResponder, Dimensions } from 'react-native';

import Styles from './styles';

const windowWidth = Dimensions.get('window').width;

export default class OnBoarding extends React.Component {
  
  _currentX = 0;
  _currentScene = 0;
  _minXSwipeAccepted = 100;
  _translateXValue = new Animated.Value(0);
  
  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminate: this._handlePanResponderEnd,
      onPanResponderTerminationRequest: this._handlePanResponderEnd,
    });

    this._translateXValue.addListener(({ value }) => {
      this._currentX = value;
    })
  }
  
  _handleMoveShouldSetPanResponder = (ev, gestureState) => {
    
    // Allow pan responder to be activate on view
    return true;
  }
  
  _handlePanResponderGrant = (ev, gestureState) => {
    
    // Do something when pan responder is activated
  }
  
  // When user is swiping, animate x cordinate accordingly 
  _handlePanResponderMove = Animated.event([
    null,
    { dx: this._translateXValue }
  ]);
  
  // Handler when user stop swiping action
  _handlePanResponderEnd = (ev, { dx }) => {

    // Define swipe direction, then animate toward the nearest view and setOffset
    let { _minXSwipeAccepted } = this;
    
    if (dx < -1 * _minXSwipeAccepted) {

      // Swiped left, go to next screen
      this._nextScene();
    } else if (dx > _minXSwipeAccepted) {

      // Swiped right, go to previous screen
      this._prevScene();
    } else {

      // Not swipe strong enough, recenter screen
      this._recenterScene();
    }
  }
  
  _recenterScene = () => {
    this._animateScene(0)
  }
  
  _prevScene = () => {
    if (this._currentScene > 0) {
      this._animateScene(windowWidth);
      this._currentScene--;
    } else {
      this._recenterScene()
    }
  }
  
  _nextScene = () => {
    if (this._currentScene < this.props.scenes.length - 1) {
      this._animateScene(windowWidth * -1)
      this._currentScene++;
    } else {
      this._recenterScene()
    }
  }
  
  _animateScene = (toValue, duration = 200) => {
    
    Animated.timing(this._translateXValue, {
      toValue,
      duration
    }).start(({finished}) => {
      finished ? this._translateXValue.setOffset(this._currentX) : null
    })
  }
  
  _renderScene = (scene, index) => {
    let animatedWidthValue = windowWidth * -1
    , animatedValue = this._translateXValue.interpolate({
      inputRange: [(index + 1) * animatedWidthValue, index * animatedWidthValue],
      outputRange: [windowWidth, 0],
      extrapolate: 'clamp'
    });
    return <View 
      key={`onboarding_scene_${index}`} 
      style={Styles.sceneContainer}
      collapsable={false}
    > 
    { React.createElement(scene.component, { animatedValue }) }
    </View>
  }

  _getTransitionBackground = () => {
    let { scenes } = this.props
    , inputRange = [], outputRange = []
    , i = scenes.length - 1;

    for (i; i >= 0; i--) {
      inputRange.push(-1 * i * windowWidth)
      outputRange.push(scenes[i].backgroundColor)
    }

    return {
      backgroundColor: this._translateXValue.interpolate({
        inputRange,
        outputRange,
        extrapolate: 'clamp'
      })
    };
  }

  render() {
    let { scenes, enableBackgroundColorTransition } = this.props;
    
    let containerStyle = [
      Styles.container
    ]

    if (enableBackgroundColorTransition) {
      containerStyle.push(
        this._getTransitionBackground()
      )
    }

    return (
      <Animated.View 
        style={containerStyle}
        {...this._panResponder.panHandlers}
      >
        <Animated.View
          style={[ 
            Styles.animatedContainer, 
            {
              width: scenes.length * windowWidth,
              transform: [{ translateX: this._translateXValue }]
            }
          ]}
        >
        
          { scenes.map(this._renderScene) }
        
        </Animated.View>
      </Animated.View>
    );
  }
}
