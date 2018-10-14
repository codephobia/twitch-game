import {inject} from '@loopback/context';
import {
    Count,
    CountSchema,
    Filter,
    repository,
    Where,
} from '@loopback/repository';
import {
    post,
    param,
    get,
    getFilterSchemaFor,
    getWhereSchemaFor,
    patch,
    del,
    requestBody,
} from '@loopback/rest';
import {
    AuthenticationBindings,
    authenticate,
} from '@loopback/authentication';

import { User } from '../models';
import { UserRepository } from '../repositories';

export class UserController {
    constructor(
        @inject(AuthenticationBindings.CURRENT_USER, {optional: true}) private user: User,
        @repository(UserRepository) public userRepository: UserRepository,
    ) { }

    @authenticate('TwitchStrategy')
    @get('/auth/twitch', {
        responses: {
            '200': {
                description: 'User model login',
                content: { 'application/json': { 'x-ts-type': User } },
            },
        },
    })
    async login(): Promise<User | null> {
        return await this.userRepository.findOne();
    }

    @post('/users', {
        responses: {
            '200': {
                description: 'User model instance',
                content: { 'application/json': { 'x-ts-type': User } },
            },
        },
    })
    async create(@requestBody() user: User): Promise<User> {
        return await this.userRepository.create(user);
    }

    @authenticate('TwitchStrategy')
    @get('/users/count', {
        responses: {
            '200': {
                description: 'User model count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    async count(
        @param.query.object('where', getWhereSchemaFor(User)) where?: Where,
    ): Promise<Count> {
        return await this.userRepository.count(where);
    }

    @authenticate('BasicStrategy')
    @get('/users', {
        responses: {
            '200': {
                description: 'Array of User model instances',
                content: {
                    'application/json': {
                        schema: { type: 'array', items: { 'x-ts-type': User } },
                    },
                },
            },
        },
    })
    async find(
        @param.query.object('filter', getFilterSchemaFor(User)) filter?: Filter,
    ): Promise<User[]> {
        return await this.userRepository.find(filter);
    }

    @patch('/users', {
        responses: {
            '200': {
                description: 'User PATCH success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    async updateAll(
        @requestBody() user: User,
        @param.query.object('where', getWhereSchemaFor(User)) where?: Where,
    ): Promise<Count> {
        return await this.userRepository.updateAll(user, where);
    }

    @get('/users/{id}', {
        responses: {
            '200': {
                description: 'User model instance',
                content: { 'application/json': { 'x-ts-type': User } },
            },
        },
    })
    async findById(@param.path.string('id') id: string): Promise<User> {
        return await this.userRepository.findById(id);
    }

    @patch('/users/{id}', {
        responses: {
            '204': {
                description: 'User PATCH success',
            },
        },
    })
    async updateById(
        @param.path.string('id') id: string,
        @requestBody() user: User,
    ): Promise<void> {
        await this.userRepository.updateById(id, user);
    }

    @del('/users/{id}', {
        responses: {
            '204': {
                description: 'User DELETE success',
            },
        },
    })
    async deleteById(@param.path.string('id') id: string): Promise<void> {
        await this.userRepository.deleteById(id);
    }
}
