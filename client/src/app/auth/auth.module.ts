import { NgModule, ModuleWithProviders } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

import { LoginPageComponent } from "./components/login-page/login-page.component";

export const COMPONENTS = [LoginPageComponent];

@NgModule({
  imports: [CommonModule],
  declarations: COMPONENTS,
  exports: COMPONENTS,
})
export class AuthModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: RootAuthModule,
      providers: [],
    };
  }
}

@NgModule({
  imports: [
    AuthModule,
    RouterModule.forChild([{ path: 'login', component: LoginPageComponent }]),
  ],
})
export class RootAuthModule {}
