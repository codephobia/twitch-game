import { DefaultCrudRepository } from '@loopback/repository';
import { User } from '../models';
import { MongoDBDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class UserRepository extends DefaultCrudRepository<
    User,
    typeof User.prototype.id
    > {
    constructor(
        @inject('datasources.MongoDB') dataSource: MongoDBDataSource,
    ) {
        super(User, dataSource);
    }
}
