import React from 'react';

type Props = {
    appComponent: any,
    onboardingComponent: any,
    isOnboardingCompleted?: () => boolean
}

/**
 * Component used as an entry point
 * to define whether to display actual app component or on boarding process
 */
export class AppEntry extends React.PureComponent<Props> {



    private _isOnboardingCompleted = () => {
        return true
    };

    reload = () => {
        this.forceUpdate()
    }

    render() {
        const {
            isOnboardingCompleted,
            appComponent,
            onboardingComponent,
            ...rest
        } = this.props;

        const activeComponent = (isOnboardingCompleted || this._isOnboardingCompleted)() ?
            appComponent :
            onboardingComponent;

        return React.createElement(activeComponent, { reloadAppEntry: this.reload, ...rest });
    }
}