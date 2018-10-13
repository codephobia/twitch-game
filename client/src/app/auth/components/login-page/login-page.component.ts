import { Component } from '@angular/core';
import { faTwitch } from '@fortawesome/fontawesome-free-brands';
import { LoginService } from '../../services/login.service';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
    providers: [LoginService]
})
export class LoginPageComponent {
    faTwitch = faTwitch;

    constructor(private readonly login: LoginService) { }

    loginWnd(): void {
        this.login.loginWnd();
    }
}
