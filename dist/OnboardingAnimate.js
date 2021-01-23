import React from 'react';
import { Animated, View, Text, Dimensions, TouchableWithoutFeedback, StatusBar } from 'react-native';
import Styles from './styles';
const windowWidth = Dimensions.get("window").width;
/**
 * React Native Component for onboarding process, support animation
 *
 * @version 0.x
 * @author [Ambi Studio](https://github.com/ambistudio)
 */
export default class OnboardingAnimate extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            isLastScene: false
        };
        // Scene being displayed, change everytime user navigate (swipe/click) to new scene
        this._currentScene = 0;
        // Animated value
        this._translateXValue = new Animated.Value(0);
        this._currentX = 0;
        // When user is swiping, animate x cordinate accordingly
        this._handlePanResponderMove = Animated.event([
            null,
            { dx: this._translateXValue }
        ], { useNativeDriver: false });
        // Handler when user stop swiping action
        this._handlePanResponderEnd = (handler) => {
            let previousX = this._currentScene * windowWidth, dx = this._currentX - previousX;
            // Define swipe direction, then animate toward the nearest view and setOffset
            // @ts-ignore
            const minValueSwipeAccepted = this.props.minValueSwipeAccepted;
            if (dx > minValueSwipeAccepted) {
                // Swiped left, go to next scene
                this._nextScene();
            }
            else if (dx < -1 * minValueSwipeAccepted) {
                // Swiped right, go to previous scene
                this._prevScene();
            }
            else {
                // Not swipe strong enough, recenter scene
                this._recenterScene();
            }
        };
        this._recenterScene = () => {
            this._animateScene(this._currentScene * windowWidth);
        };
        this._prevScene = () => {
            if (this._currentScene > 0) {
                this._animateToSceneNo(this._currentScene - 1);
            }
            else {
                this._recenterScene();
            }
        };
        /**
         * Animate to next scene
         */
        this._nextScene = () => {
            let lastScene = this.props.scenes.length - 1;
            if (this._currentScene < lastScene) {
                // Animate to next scene and update currentScene index
                this._animateToSceneNo(this._currentScene + 1);
            }
            else if (this._currentScene == lastScene) {
                // Process to main application, or any callback after the last scene
                this.props.onCompleted && this.props.onCompleted();
            }
            else {
                // Recenter scene in any other case, might never happend
                this._recenterScene();
            }
        };
        /**
         * Navigate to a given scene number
         *
         * @memberof OnboardingAnimate
         */
        this._animateToSceneNo = (sceneNo) => {
            if (this._currentScene != sceneNo) {
                let toPosition = sceneNo * windowWidth;
                this._currentScene = sceneNo;
                this._animateScene(toPosition);
                this._updateState();
            }
        };
        // Check current scene and update isLastScene state
        this._updateState = () => {
            let { _currentScene } = this;
            if (_currentScene == this.props.scenes.length - 1) {
                this.setState({ isLastScene: true });
            }
            else if (this.state.isLastScene) {
                this.setState({ isLastScene: false });
            }
        };
        this._animateScene = (toValue) => {
            if (toValue < this.props.scenes.length * windowWidth && this._scrollView) {
                this._scrollView.scrollTo({ x: toValue });
            }
        };
        /**
         * Get background colors from each scene, create then return an animated background style
         */
        this._getTransitionBackground = () => {
            let { scenes } = this.props, inputRange = [], outputRange = [], i;
            for (i = 0; i < scenes.length; i++) {
                inputRange.push(i * windowWidth);
                outputRange.push(scenes[i].backgroundColor);
            }
            return {
                backgroundColor: this._translateXValue.interpolate({
                    inputRange,
                    outputRange,
                    extrapolate: 'clamp'
                })
            };
        };
        this._renderIndicator = (p, index) => {
            let { activeColor, inactiveColor } = this.props, startPosition = index * windowWidth, animatedIndicatorBackground = {
                backgroundColor: this._translateXValue.interpolate({
                    inputRange: [startPosition - (windowWidth / 2), startPosition, startPosition + (windowWidth / 2)],
                    outputRange: [inactiveColor, activeColor, inactiveColor],
                    extrapolate: 'clamp'
                })
            };
            return React.createElement(TouchableWithoutFeedback, { onPress: () => { this._animateToSceneNo(index); }, key: `obs_pageindicator-${index}` },
                React.createElement(View, { style: Styles.activePageIndicator },
                    React.createElement(Animated.View, { style: [Styles.indicator, animatedIndicatorBackground] })));
        };
        /**
         * Render actionable page
         * (page that is not included within on boarding scenes)
         */
        this._renderActionablePage = () => {
            let { actionableScene, sceneContainerStyle } = this.props;
            if (actionableScene) {
                return React.createElement(View, { style: sceneContainerStyle, collapsable: false }, React.createElement(actionableScene));
            }
        };
        this._renderScene = (scene, index) => {
            let { sceneContainerStyle } = this.props, animatedValue = this._translateXValue.interpolate({
                inputRange: [index * windowWidth, (index + 1) * windowWidth],
                outputRange: [0, windowWidth]
            });
            return React.createElement(View, { key: `onboarding_scene_${index}`, style: sceneContainerStyle, collapsable: false }, React.createElement(scene.component, { animatedValue }));
        };
    }
    UNSAFE_componentWillMount() {
        this._translateXValue.addListener(({ value }) => {
            // Keep track of transition X value, used to difine swipe direction
            this._currentX = value;
        });
    }
    render() {
        let { scenes, enableBackgroundColorTransition, actionableScene, activeColor, hideStatusBar, navigateButtonTitle, navigateButtonCompletedTitle, buttonActionableTitle } = this.props, containerStyle = [
            Styles.container
        ], sceneLength = scenes.length + (actionableScene ? 1 : 0);
        if (enableBackgroundColorTransition) {
            // @ts-ignore
            containerStyle.push(this._getTransitionBackground());
        }
        return (React.createElement(Animated.View, { style: containerStyle },
            React.createElement(Animated.ScrollView, { ref: (ref) => this._scrollView = ref, style: { flex: 1 }, horizontal: true, showsHorizontalScrollIndicator: false, scrollEventThrottle: 14, onScroll: Animated.event([{
                        nativeEvent: {
                            contentOffset: {
                                x: this._translateXValue
                            }
                        }
                    }], {
                    useNativeDriver: false
                }), onScrollEndDrag: this._handlePanResponderEnd },
                React.createElement(View, { style: [
                        Styles.animatedContainer,
                        {
                            width: windowWidth * scenes.length
                        }
                    ] },
                    scenes.map(this._renderScene),
                    this._renderActionablePage())),
            React.createElement(View, { style: [Styles.controllerWrapper] },
                React.createElement(View, { style: Styles.activePageIndicatorWrapper }, scenes.map(this._renderIndicator)),
                !actionableScene ? null :
                    React.createElement(TouchableWithoutFeedback, { onPress: () => {
                            this._animateToSceneNo(sceneLength - 1);
                        } },
                        React.createElement(View, { style: { padding: 10, marginBottom: 5 } },
                            React.createElement(Text, { style: [Styles.btnText, { color: activeColor }] }, buttonActionableTitle))),
                React.createElement(TouchableWithoutFeedback, { onPress: () => this._nextScene() },
                    React.createElement(View, { style: [Styles.btnPositive, { width: windowWidth * .7, backgroundColor: activeColor }] },
                        React.createElement(Text, { style: Styles.btnPositiveText }, this.state.isLastScene ? navigateButtonCompletedTitle : navigateButtonTitle)))),
            React.createElement(StatusBar, { hidden: hideStatusBar })));
    }
}
OnboardingAnimate.defaultProps = {
    minValueSwipeAccepted: 50
};
