import React from 'react';
import { 
  ScrollView,
  Animated, 
  View,
  Text,
  PanResponder, 
  Dimensions, 
  TouchableWithoutFeedback,
  StatusBar
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
export default class OnboardingComponent extends React.PureComponent {

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
  _handlePanResponderEnd = (ev, values) => {
  
    let previousX = this._currentScene * windowWidth
    , dx = this._currentX - previousX;

    // Define swipe direction, then animate toward the nearest view and setOffset
    let { minValueSwipeAccepted } = this.props;
    if (dx > minValueSwipeAccepted) {

      // Swiped left, go to next scene
      this._nextScene();
    } else if (dx < -1 * minValueSwipeAccepted) {

      // Swiped right, go to previous scene
      this._prevScene();
    } else {

      // Not swipe strong enough, recenter scene
      this._recenterScene();
    }
  }

  _recenterScene = () => {
    this._animateScene(this._currentScene * windowWidth)
  }

  _prevScene = () => {
    if (this._currentScene > 0) {
      this._animateToSceneNo(this._currentScene - 1);
    } else {
      this._recenterScene()
    }
  }

  /**
   * Animate to next scene
   */
  _nextScene = () => {
    
    if (this._currentScene < this.props.scenes.length -1) {

      // Animate to next scene and update currentScene index
      this._animateToSceneNo(this._currentScene + 1)
    } else {

      // Recenter scene if already in the last scene
      this._recenterScene()
    }
  }

  /**
   * Navigate to a given scene number
   *
   * @memberof OnboardingComponent
   */
  _animateToSceneNo = (sceneNo) => {
    if (this._currentScene != sceneNo) {
      let toPosition = sceneNo * windowWidth;
      this._currentScene = sceneNo;
      this._animateScene(toPosition);
    }
  }


  _animateScene = (toValue) => {
    if (toValue < this.props.scenes.length * windowWidth) {
      this._scrollView.scrollTo({ x: toValue })
    }
  }

  /**
   * Get background colors from each scene, create then return an animated background style 
   */
  _getTransitionBackground = () => {
    let { scenes } = this.props
      , inputRange = [], outputRange = []
      , i;

    for (i = 0; i < scenes.length; i++) {
      inputRange.push(i * windowWidth)
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
    , startPosition = index * windowWidth
    , animatedIndicatorBackground = {
      backgroundColor: this._translateXValue.interpolate({
        inputRange: [startPosition - (windowWidth / 2), startPosition, startPosition + (windowWidth / 2)],
        outputRange: [inactiveColor, activeColor, inactiveColor],
        extrapolate: 'clamp'
      })
    };

    return <TouchableWithoutFeedback 
      onPress={() => { this._animateToSceneNo(index)}} 
      key={`obs_pageindicator-${index}`}
    >
        <View style={Styles.activePageIndicator}>
            <Animated.View style={[Styles.indicator, animatedIndicatorBackground]}></Animated.View>
        </View>
    </TouchableWithoutFeedback>;
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

  _renderScene = (scene, index) => {
    let { sceneContainerStyle } = this.props
    , animatedValue = this._translateXValue.interpolate({
      inputRange: [index * windowWidth, (index + 1) * windowWidth],
      outputRange: [0, windowWidth]
    });

    return <View
      key={`onboarding_scene_${index}`}
      style={sceneContainerStyle}
      collapsable={false}
    >
      {React.createElement(scene.component, { animatedValue })}
    </View>
  }

  render() {
    let { 
      scenes, 
      enableBackgroundColorTransition, 
      actionableScene,
      activeColor,
      hideStatusBar,
      navigateButtonTitle,
      skipToActionableTextTitle
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
      >
        <ScrollView
          useScrollView={true}
          ref={ref => this._scrollView = ref}
          style={{flex: 1}}
          horizontal={true}
          vertical={false}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={14}
          onScroll={Animated.event([{
            nativeEvent: { contentOffset : { x: this._translateXValue }}
          }])}
          onScrollEndDrag={this._handlePanResponderEnd}
        >
          <View style={[
            Styles.animatedContainer,
            {
              width: windowWidth * scenes.length 
            } 
          ]}>
          {scenes.map(this._renderScene)}
          {this._renderActionablePage()}
          </View>
        </ScrollView>
        
        {/* Navigation Area */}
        <View style={[Styles.controllerWrapper]}>

          {/* Slider active scene indicator */}
          <View style={Styles.activePageIndicatorWrapper}>
            {scenes.map(this._renderIndicator)}
          </View>
          {/* END: Slider active scene indicator */}

          {/* Text button for actionable scene */}
          { !actionableScene ? null :
            <TouchableWithoutFeedback onPress={() => {
              this._animateToSceneNo(sceneLength - 1)
            }}>
              <View style={{ padding: 10, marginBottom: 5 }}>
                <Text style={[Styles.btnText, { color: activeColor }]}>{ skipToActionableTextTitle }</Text>
              </View>
            </TouchableWithoutFeedback>
          }
          {/* END: Text button for actionable scene */}
          
          {/* Navigate to next page button */}
          <TouchableWithoutFeedback onPress={() => this._nextScene()}>
            <View style={[Styles.btnPositive, { width: windowWidth * .7, backgroundColor: activeColor }]}>
              <Text style={Styles.btnPositiveText}>{ navigateButtonTitle }</Text>
            </View>
          </TouchableWithoutFeedback>
          {/* END: Navigate to next page button */}

        </View>
        {/* END: Navigation Area */}

        <StatusBar hidden={hideStatusBar} />
      </Animated.View>
    );
  }
}

OnboardingComponent.propTypes = {

  // Mininum acceptable value for allowing navigate to next or previous scene
  minValueSwipeAccepted: PropTypes.number,

  // Color when indicator is showing active state
  activeColor: PropTypes.string,

  // Color when indicator is showing inactive state
  inactiveColor: PropTypes.string,

  // Style of each scene container
  sceneContainerStyle: View.propTypes.style,

  // Hide statusbar
  hideStatusBar: PropTypes.bool,

  // Text title of the navigate to next scene button
  navigateButtontitle: PropTypes.string,

  // Text title of the link to navigate to the actionable scene
  skipToActionableTextTitle: PropTypes.string
};

OnboardingComponent.defaultProps = {
  minValueSwipeAccepted: 60,
  activeColor: Colors.activeColor,
  inactiveColor: Colors.inactiveColor,
  sceneContainerStyle: Styles.sceneContainer,
  hideStatusBar: true,
  navigateButtontitle: 'Continue',
  skipToActionableTextTitle: 'Skip to Get Started'
}