import React from 'react';
import { 
  Animated, 
  View,
  Text,
  PanResponder, 
  Dimensions, 
  TouchableOpacity 
} from 'react-native';
import PropTypes from 'prop-types';

import Styles, { Colors } from './styles';

const windowWidth = Dimensions.get('window').width;

/**
 * React Native Component for onboarding process, support animation
 * 
 * @version 0.2.0
 * @author [Ambi Studio](https://github.com/ambistudio)
 */
export default class OnBoardingView extends React.PureComponent {

  // Scene being displayed, change everytime user navigate (swipe/click) to new scene
  _currentScene = 0;

  // Animated value
  _translateXValue = new Animated.Value(0);
  _currentX = 0;

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
    let { minValueSwipeAccepted } = this.props;

    if (dx < -1 * minValueSwipeAccepted) {

      // Swiped left, go to next screen
      this._nextScene();
    } else if (dx > minValueSwipeAccepted) {

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

  /**
   * Animate to next screen
   */
  _nextScene = () => {
    
    if (this._currentScene < this.props.scenes.length) {

      // Animate to next scene and update currentScene index
      this._animateScene(windowWidth * -1)
      this._currentScene++;
    } else {

      // Recenter scene if already in the last scene
      this._recenterScene()
    }
  }

  _animateScene = (toValue, duration = 200) => {

    Animated.timing(this._translateXValue, {
      toValue,
      duration
    }).start(({ finished }) => {
      finished ? this._translateXValue.setOffset(this._currentX) : null
    })
  }

  _renderScene = (scene, index) => {
    let { sceneContainerStyle } = this.props
    , animatedWidthValue = windowWidth * -1
    , animatedValue = this._translateXValue.interpolate({
      inputRange: [(index + 1) * animatedWidthValue, index * animatedWidthValue],
      outputRange: [windowWidth, 0]
    });

    return <View
      key={`onboarding_scene_${index}`}
      style={sceneContainerStyle}
      collapsable={false}
    >
      {React.createElement(scene.component, { animatedValue })}
    </View>
  }

  /**
   * Get background colors from each scene, create then return an animated background style 
   */
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

  _renderIndicator = (p, index) => {

    let { activeColor, inactiveColor } = this.props
    , animatedWidthValue = windowWidth * -1
    , startPosition = index * animatedWidthValue
    , endPosition = (index + 1) * animatedWidthValue
    , animatedIndicatorBackground = {
      backgroundColor: this._translateXValue.interpolate({
        inputRange: [startPosition - (windowWidth / 2), startPosition, startPosition + (windowWidth / 2)],
        outputRange: [inactiveColor, activeColor, inactiveColor],
        extrapolate: 'clamp'
      })
    };

    return <TouchableOpacity 
      onPress={() => { this._animateToSceneNo(index)}} 
      key={`obs_pageindicator-${index}`}
    >
        <View style={Styles.activePageIndicator}>
            <Animated.View style={[Styles.indicator, animatedIndicatorBackground]}></Animated.View>
        </View>
    </TouchableOpacity>;
  }

  /**
   * Render actionable page
   * (page that is not included within on boarding scenes)
   */
  _renderActionablePage = () => {
    let { actionableScene, sceneContainerStyle } = this.props;

    if (actionableScene) {
      return <View
        style={sceneContainerStyle}
        collapsable={false}
      >
      {React.createElement(actionableScene)}
      </View>
    }
  }

  _animateToSceneNo = (sceneNo) => {
    if (this._currentScene != sceneNo) {
      let toPosition = (this._currentScene - sceneNo) * windowWidth;
      this._animateScene(toPosition);
      this._currentScene = sceneNo;
    }
  }

  render() {
    let { 
      scenes, 
      enableBackgroundColorTransition, 
      actionableScene,
      activeColor
    } = this.props

    , containerStyle = [
      Styles.container
    ]
    , sceneLength = scenes.length + (actionableScene ? 1 : 0);

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
              width: sceneLength * windowWidth,
              transform: [{ translateX: this._translateXValue }]
            }
          ]}
        >

          {scenes.map(this._renderScene)}

          
          {this._renderActionablePage()}

        </Animated.View>
        
        {/* Navigation Buttons */}
        <View style={[Styles.controllerWrapper]}>
          <View style={Styles.activePageIndicatorWrapper}>
            {scenes.map(this._renderIndicator)}
          </View>
          <TouchableOpacity onPress={() => {
            this._animateToSceneNo(sceneLength - 1)
          }}>
            <View style={{ padding: 10, marginBottom: 5 }}>
              <Text style={[Styles.btnText, { color: activeColor }]}>Skip to Get Started</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._nextScene}>
            <View style={[Styles.btnPositive, { width: windowWidth * .7, backgroundColor: activeColor }]}>
              <Text style={Styles.btnPositiveText}>
                {'Continue'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* END: Navigation Buttons */}

      </Animated.View>
    );
  }
}

OnBoardingView.propTypes = {

  // Mininum acceptable value for allowing navigate to next or previous screen
  minValueSwipeAccepted: PropTypes.number,

  // Color when indicator is showing active state
  activeColor: PropTypes.string,

  // Color when indicator is showing inactive state
  inactiveColor: PropTypes.string,

  // Style of each scene container
  sceneContainerStyle: View.propTypes.style
};

OnBoardingView.defaultProps = {
  minValueSwipeAccepted: 80,
  activeColor: Colors.activeColor,
  inactiveColor: Colors.inactiveColor,
  sceneContainerStyle: Styles.sceneContainer
}