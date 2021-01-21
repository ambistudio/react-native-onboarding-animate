var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React from 'react';
/**
 * Component used as an entry point
 * to define whether to display actual app component or on boarding process
 */
export class AppEntry extends React.PureComponent {
    constructor() {
        super(...arguments);
        this._isOnboardingCompleted = () => {
            return true;
        };
        this.reload = () => {
            this.forceUpdate();
        };
    }
    render() {
        const _a = this.props, { isOnboardingCompleted, appComponent, onboardingComponent } = _a, rest = __rest(_a, ["isOnboardingCompleted", "appComponent", "onboardingComponent"]);
        const activeComponent = (isOnboardingCompleted || this._isOnboardingCompleted)() ?
            appComponent :
            onboardingComponent;
        return React.createElement(activeComponent, Object.assign({ reloadAppEntry: this.reload }, rest));
    }
}
