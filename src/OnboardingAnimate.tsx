import React from 'react';
import {
  ScrollView,
  Animated,
  View,
  Text,
  Dimensions,
  TouchableWithoutFeedback,
  StatusBar,
  ViewStyle,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';

import Styles from './styles';

const windowWidth = Dimensions.get("window").width;

/**
 * React Native Component for onboarding process, support animation
 *
 * @version 0.x
 * @author [Ambi Studio](https://github.com/ambistudio)
 */
export default class OnboardingAnimate extends React.Component<Props> {

  state = {
    isLastScene: false
  }

  static defaultProps = {
    minValueSwipeAccepted: 50
  }

  // Scene being displayed, change everytime user navigate (swipe/click) to new scene
  _currentScene = 0;
  _scrollView?: ScrollView | null;

  // Animated value
  _translateXValue = new Animated.Value(0);
  _currentX = 0;

  UNSAFE_componentWillMount() {

    this._translateXValue.addListener(({ value }) => {

      // Keep track of transition X value, used to difine swipe direction
      this._currentX = value;
    })

  }

  // When user is swiping, animate x cordinate accordingly
  _handlePanResponderMove = Animated.event([
    null,
    { dx: this._translateXValue }
  ], { useNativeDriver: false });

  // Handler when user stop swiping action
  _handlePanResponderEnd = (handler: NativeSyntheticEvent<NativeScrollEvent>) => {


    let previousX = this._currentScene * windowWidth
      , dx = this._currentX - previousX;

    // Define swipe direction, then animate toward the nearest view and setOffset

    // @ts-ignore
    const minValueSwipeAccepted: number = this.props.minValueSwipeAccepted;

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

    let lastScene = this.props.scenes.length - 1;
    if (this._currentScene < lastScene) {

      // Animate to next scene and update currentScene index
      this._animateToSceneNo(this._currentScene + 1)

    } else if (this._currentScene == lastScene) {

      // Process to main application, or any callback after the last scene
      this.props.onCompleted && this.props.onCompleted();

    } else {

      // Recenter scene in any other case, might never happend
      this._recenterScene()

    }
  }

  /**
   * Navigate to a given scene number
   *
   * @memberof OnboardingAnimate
   */
  _animateToSceneNo = (sceneNo: number) => {
    if (this._currentScene != sceneNo) {
      let toPosition = sceneNo * windowWidth;
      this._currentScene = sceneNo;
      this._animateScene(toPosition);
      this._updateState();
    }
  }

  // Check current scene and update isLastScene state
  _updateState = () => {
    let { _currentScene } = this;
    if (_currentScene == this.props.scenes.length - 1) {
      this.setState({ isLastScene: true })
    } else if (this.state.isLastScene) {
      this.setState({ isLastScene: false })
    }

  }

  _animateScene = (toValue: number) => {
    if (toValue < this.props.scenes.length * windowWidth && this._scrollView) {
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

  _renderIndicator = (p: any, index: number) => {

    let { activeColor, inactiveColor } = this.props
      , startPosition = index * windowWidth
      , animatedIndicatorBackground = {
        backgroundColor: this._translateXValue.interpolate({
          inputRange: [startPosition - (windowWidth / 2), startPosition, startPosition + (windowWidth / 2)],
          outputRange: [inactiveColor as string, activeColor as string, inactiveColor as string],
          extrapolate: 'clamp'
        })
      };

    return <TouchableWithoutFeedback
      onPress={() => { this._animateToSceneNo(index) }}
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

  _renderScene = (scene: Scene, index: number) => {
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
      navigateButtonCompletedTitle,
      buttonActionableTitle
    } = this.props

      , containerStyle = [
        Styles.container
      ]
      , sceneLength = scenes.length + (actionableScene ? 1 : 0);

    if (enableBackgroundColorTransition) {
      // @ts-ignore
      containerStyle.push(this._getTransitionBackground());
    }

    return (
      <Animated.View
        style={containerStyle}
      >
        <Animated.ScrollView
          ref={(ref: ScrollView) => this._scrollView = ref}
          style={{ flex: 1 }}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={14}
          onScroll={Animated.event([{
            nativeEvent: {
              contentOffset: {
                x: this._translateXValue
              }
            }
          }], {
            useNativeDriver: false
          })}
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
        </Animated.ScrollView>

        {/* Navigation Area */}
        <View style={[Styles.controllerWrapper]}>

          {/* Slider active scene indicator */}
          <View style={Styles.activePageIndicatorWrapper}>
            {scenes.map(this._renderIndicator)}
          </View>
          {/* END: Slider active scene indicator */}

          {/* Text button for actionable scene */}
          {!actionableScene ? null :
            <TouchableWithoutFeedback onPress={() => {
              this._animateToSceneNo(sceneLength - 1)
            }}>
              <View style={{ padding: 10, marginBottom: 5 }}>
                <Text style={[Styles.btnText, { color: activeColor }]}>{buttonActionableTitle}</Text>
              </View>
            </TouchableWithoutFeedback>
          }
          {/* END: Text button for actionable scene */}

          {/* Navigate to next page button */}
          <TouchableWithoutFeedback onPress={() => this._nextScene()}>
            <View style={[Styles.btnPositive, { width: windowWidth * .7, backgroundColor: activeColor }]}>
              <Text style={Styles.btnPositiveText}>
                {this.state.isLastScene ? navigateButtonCompletedTitle : navigateButtonTitle}
              </Text>
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

type Props = {
  // Mininum acceptable value for allowing navigate to next or previous scene
  minValueSwipeAccepted?: number,
  // Color when indicator is showing active state
  activeColor?: string,
  // Color when indicator is showing inactive state
  inactiveColor?: string,
  // Style of each scene container
  sceneContainerStyle?: ViewStyle,
  // Hide statusbar
  hideStatusBar?: boolean,
  // Text title of the navigate to next scene button
  navigateButtonTitle?: string,
  // Text title of the link to navigate to the actionable scene
  buttonActionableTitle?: string,
  // Callback when click on 'Completed' butotn in the last scene
  onCompleted?: Function,

  navigateButtonCompletedTitle?: string,
  enableBackgroundColorTransition: boolean,

  scenes: Scene[],
  actionableScene?: any
};

type Scene = {
  component: any,
  backgroundColor: string,
}
