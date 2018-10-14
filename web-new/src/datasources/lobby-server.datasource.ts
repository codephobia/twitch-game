import { inject } from '@loopback/core';
import { juggler } from '@loopback/repository';
import * as config from './lobby-server.datasource.json';

export class LobbyServerDataSource extends juggler.DataSource {
    static dataSourceName = 'LobbyServer';

    constructor(
        @inject('datasources.config.LobbyServer', { optional: true })
        dsConfig: object = config,
    ) {
        super(dsConfig);
    }
}
