import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import {MySequence} from './sequence';
import { AuthenticationComponent, AuthenticationBindings } from '@loopback/authentication';

import { BasicAuthStrategyProvider, TwitchOAuthStrategyProvider } from './providers';

export class WebApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.projectRoot = __dirname;
    
    this.component(AuthenticationComponent);
    // TODO: Figure out if we can have multiple strategy providers
    // this.bind(AuthenticationBindings.STRATEGY).toProvider(
    //     BasicAuthStrategyProvider,
    // );
    this.bind(AuthenticationBindings.STRATEGY).toProvider(
        TwitchOAuthStrategyProvider,
    );

    // Set up the custom sequence
    this.sequence(MySequence);
    
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
