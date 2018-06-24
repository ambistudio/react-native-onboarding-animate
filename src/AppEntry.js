import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component used as an entry point
 * to define whether to display actual app component or on boarding process
 */
export default class AppEntry extends React.PureComponent {

    reload = () => {
        this.forceUpdate()
    }

    render() {
        let { 
            isOnboardingCompleted,
            appComponent,
            onboardingComponent
        } = this.props
        ,   activeComponent = isOnboardingCompleted() ? appComponent : onboardingComponent;

        delete this.props.isOnboardingCompleted;
        delete this.props.appComponent;
        delete this.props.onboardingComponent;

        return React.createElement(activeComponent, { reloadAppEntry: this.reload , ...this.props });
    }
}

AppEntry.defaultProps = {
    isOnboardingCompleted: () => true
}

AppEntry.propTypes = {

    /**
     * (method) used to define whether display onboarding process or actual app
     * return boolean
     */
    isOnboardingCompleted: PropTypes.func.isRequired
}