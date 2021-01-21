import React from 'react';
declare type Props = {
    appComponent: any;
    onboardingComponent: any;
    isOnboardingCompleted?: () => boolean;
};
/**
 * Component used as an entry point
 * to define whether to display actual app component or on boarding process
 */
export declare class AppEntry extends React.PureComponent<Props> {
    private _isOnboardingCompleted;
    reload: () => void;
    render(): React.CElement<{
        children?: React.ReactNode;
        reloadAppEntry: () => void;
    }, React.Component<{
        children?: React.ReactNode;
        reloadAppEntry: () => void;
    }, any, any>>;
}
export {};
