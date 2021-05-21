import { Provider, inject, ValueOrPromise, Context } from '@loopback/context';
import { Strategy } from 'passport';
import {
    AuthenticationBindings,
    AuthenticationMetadata,
} from '@loopback/authentication';
import { Strategy as TwitchStrategy, Profile } from 'passport-twitchtv';

import { User } from '../models';
import { UserRepository } from '../repositories';

const clientID = process.env.TEST_TWITCH_CLIENT_ID || "";
const clientSecret = process.env.TEST_TWITCH_CLIENT_SECRET || "";

export class TwitchOAuthStrategyProvider implements Provider<Strategy | undefined> {
    constructor(
        @inject(AuthenticationBindings.METADATA) private metadata: AuthenticationMetadata,
        @inject('repositories.UserRepository') private userRepository: UserRepository,
    ) { }

    value(): ValueOrPromise<Strategy | undefined> {
        // The function was not decorated, so we shouldn't attempt authentication
        if (!this.metadata) {
            return undefined;
        }

        const name = this.metadata.strategy;
        if (name === 'TwitchStrategy') {
            console.log('TwitchStrategy');
            return new TwitchStrategy({
                    clientID: clientID,
                    clientSecret: clientSecret,
                    callbackURL: "http://127.0.0.1:3000/auth/twitch/callback",
                    scope: "user_read"
                },
                this.verify.bind(this)
            );
        } else {
            return Promise.reject(`The strategy ${name} is not available.`);
        }
    }

    async verify(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        cb: (err: Error | null, user?: User | false) => void,
    ) {
        console.log('verify');
        
        cb(null, new User({
            id: "test",
            username: "test",
            email: "test",
            password: "test",
            active: true
        }));
    }
}

const ctx = new Context();
ctx.bind('repositories.UserRepository').toClass(UserRepository);