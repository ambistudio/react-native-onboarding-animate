import React from 'react';
import { ScrollView, Animated, ViewStyle, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
/**
 * React Native Component for onboarding process, support animation
 *
 * @version 0.x
 * @author [Ambi Studio](https://github.com/ambistudio)
 */
export default class OnboardingAnimate extends React.Component<Props> {
    state: {
        isLastScene: boolean;
    };
    _currentScene: number;
    _scrollView?: ScrollView | null;
    _translateXValue: Animated.Value;
    _currentX: number;
    UNSAFE_componentWillMount(): void;
    _handlePanResponderMove: (...args: any[]) => void;
    _handlePanResponderEnd: (handler: NativeSyntheticEvent<NativeScrollEvent>) => void;
    _recenterScene: () => void;
    _prevScene: () => void;
    /**
     * Animate to next scene
     */
    _nextScene: () => void;
    /**
     * Navigate to a given scene number
     *
     * @memberof OnboardingAnimate
     */
    _animateToSceneNo: (sceneNo: number) => void;
    _updateState: () => void;
    _animateScene: (toValue: number) => void;
    /**
     * Get background colors from each scene, create then return an animated background style
     */
    _getTransitionBackground: () => {
        backgroundColor: Animated.AnimatedInterpolation;
    };
    _renderIndicator: (p: any, index: number) => JSX.Element;
    /**
     * Render actionable page
     * (page that is not included within on boarding scenes)
     */
    _renderActionablePage: () => JSX.Element | undefined;
    _renderScene: (scene: Scene, index: number) => JSX.Element;
    render(): JSX.Element;
}
declare type Props = {
    minValueSwipeAccepted?: number;
    activeColor?: string;
    inactiveColor?: string;
    sceneContainerStyle?: ViewStyle;
    hideStatusBar?: boolean;
    navigateButtonTitle?: string;
    buttonActionableTitle?: string;
    onCompleted?: Function;
    navigateButtonCompletedTitle?: string;
    enableBackgroundColorTransition: boolean;
    scenes: Scene[];
    actionableScene?: any;
};
declare type Scene = {
    component: any;
    backgroundColor: string;
};
export {};
