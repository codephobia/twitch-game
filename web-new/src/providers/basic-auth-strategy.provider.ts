import { Provider, inject, ValueOrPromise, Context } from '@loopback/context';
import { Strategy } from 'passport';
import {
    AuthenticationBindings,
    AuthenticationMetadata,
} from '@loopback/authentication';
import { BasicStrategy } from 'passport-http';

import { User } from '../models';
import { UserRepository } from '../repositories';

export class BasicAuthStrategyProvider implements Provider<Strategy | undefined> {
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
        if (name === 'BasicStrategy') {
            return new BasicStrategy(this.verifyBasic.bind(this));
        } else {
            return Promise.reject(`The strategy ${name} is not available.`);
        }
    }

    async verifyBasic(
        username: string,
        password: string,
        cb: (err: Error | null, user?: User | false) => void,
    ) {
        const dbUser = await this.userRepository.findOne({
            where: {
                username: username,
                password: password,
            }
        });

        if (!dbUser) {
            cb(null, false);
        } else {
            cb(null, dbUser);
        }
    }
}

const ctx = new Context();
ctx.bind('repositories.UserRepository').toClass(UserRepository);