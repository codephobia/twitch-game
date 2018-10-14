/// <reference types="passport"/>

import passport = require('passport');
import express = require('express');

interface Profile extends passport.Profile {
    id: string;
    username: string;
    displayName: string;
    email: string;

    _raw: string;
    _json: any;
}

interface IStrategyOptionBase {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope: string;
}

interface IStrategyOption extends IStrategyOptionBase {
    passReqToCallback?: false;
}

interface IStrategyOptionWithRequest  extends IStrategyOptionBase {
    passReqToCallback: true;
}

declare class TwitchStrategy extends passport.Strategy {
    constructor(options: IStrategyOption,
        verify: (accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void) => void);
    constructor(options: IStrategyOptionWithRequest,
        verify: (req: express.Request, accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void) => void);

    name: string;
    authenticate(req: express.Request, options?: Object): void;
}
