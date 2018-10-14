import {WebApplication} from './application';
import {ApplicationConfig} from '@loopback/core';

export {WebApplication};

export async function main(options: ApplicationConfig = {}) {
  const app = new WebApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);

  return app;
}
