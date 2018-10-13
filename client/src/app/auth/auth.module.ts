import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { LoginComponent } from './containers/login/login.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { LoginService } from './services/login.service';

export const COMPONENTS = [LoginComponent, LoginPageComponent];

@NgModule({
    imports: [CommonModule, RouterModule, SharedModule],
    declarations: COMPONENTS,
    exports: COMPONENTS,
})
export class AuthModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: RootAuthModule,
            providers: [LoginService],
        };
    }
}

@NgModule({
    imports: [
        AuthModule,
        RouterModule.forChild([{ path: 'login', component: LoginComponent }]),
    ],
})
export class RootAuthModule { }
