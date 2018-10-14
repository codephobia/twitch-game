import { Entity, model, property, belongsTo } from '@loopback/repository';

@model()
export class User extends Entity {
    @property({
        type: 'string',
        id: true,
    })
    id: string;

    @property({
        type: 'string',
        required: true,
    })
    username: string;

    @property({
        type: 'string',
        required: true,
    })
    email: string;

    @property({
        type: 'string',
        required: true,
    })
    password: string;

    @property({
        type: 'boolean',
        required: true,
        default: true,
    })
    active: boolean;

    constructor(data?: Partial<User>) {
        super(data);
    }
}
