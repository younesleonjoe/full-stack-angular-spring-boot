import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrl: './login-status.component.css',
})
export class LoginStatusComponent implements OnInit {
  protected isAuthenticated: boolean;
  protected userName: string;
  private storage: Storage;

  constructor(
    private oktaAuthService: OktaAuthStateService,
    private userService: UserService,
    @Inject(OKTA_AUTH) private oktaAuth: OktaAuth,
  ) {
    this.isAuthenticated = false;
    this.userName = '';
    this.storage = sessionStorage;
  }

  ngOnInit(): void {
    // Subscribe to the authentication state changes
    this.oktaAuthService.authState$.subscribe((authState) => {
      this.isAuthenticated = authState.isAuthenticated!;
      this.getUserDetails();
    });
  }

  private getUserDetails(): void {
    if (!this.isAuthenticated) return;
    // Fetch the logged-in user details (user's claims)
    //
    // user full name is exposed as a property name
    this.oktaAuth.getUser().then((res) => {
      this.userName = res.name as string;
      // Retrieve the user's email from authentication response
      const email: string = res.email as string;
      // store email in browser storage
      this.userService.persistUserEmail(email);
    });
  }

  protected logout(): void {
    // Terminates the session with Okta and removes current tokens.
    this.oktaAuth.signOut();
  }
}
