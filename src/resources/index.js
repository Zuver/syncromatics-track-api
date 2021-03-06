import 'isomorphic-fetch';
import JWT from 'jwt-client';
import Resource from './Resource';
import Customer from './Customer';
import Client from '../Client';
import { ForbiddenResponse } from '../responses';

/**
 * Root of the Track API resources
 */
class Track extends Resource {
  /**
   * @callback onAutoRenew
   * @param {Object} user the claim of the JWT payload (user object)
   */

  /**
   * Creates a new Track resource
   * @param {Object} [options] Options for the Track API
   * @param {Boolean} [options.autoRenew=true] Determines whether to automatically renew a token
   *  when it nears its expiration
   * @param {Number} [options.autoRenewMinutesBeforeExpiration=5] Minutes before the expiration of
   *  a token when automatic renewal will take place
   * @param {onAutoRenew} [options.onAutoRenew] Callback called when auto-renew takes place
   */
  constructor(options) {
    super(new Client(options));
    this.options = {
      autoRenew: true,
      autoRenewMinutesBeforeExpiration: 5,
      onAutoRenew: () => {},
      ...options,
      ...{
        token: undefined,
        apiKey: undefined,
        username: undefined,
        password: undefined,
      },
    };
  }

  /**
   * Halts the automatic renewal of a token
   * @returns {void}
   */
  stopAutoRenew() {
    if (this.autoRenewTimeout) {
      clearTimeout(this.autoRenewTimeout);
      this.autoRenewTimeout = null;
    }
  }

  /**
   * Authenticates and validates a token
   * @param {string} token JSON Web Token to authenticate and validate
   * @returns {Promise} If successful, the claim of the JWT payload (user object).
   *  Otherwise an error.
   */
  authenticateToken(token) {
    return Promise.resolve(token)
      .then(JWT.read)
      .then((payload) => {
        if (JWT.validate(payload)) {
          JWT.keep(token);
          this.stopAutoRenew();

          if (this.options.autoRenew) {
            const msBeforeExp = this.options.autoRenewMinutesBeforeExpiration * 60 * 1000;
            const ms = Math.max(payload.claim.exp - msBeforeExp - new Date().getTime(), 0);
            const onAutoRenew = this.options.onAutoRenew || (() => {});
            this.autoRenewTimeout = setTimeout(() =>
              this.renewAuthentication().then(onAutoRenew), ms);
          }

          this.client.setAuthenticated(payload.claim);

          return payload.claim;
        }

        JWT.forget();
        this.client.unsetAuthenticated();
        return Promise.reject(new Error('Invalid token or payload'));
      });
  }

  /**
   * Logs in and maintains the authentication state for the lifetime of this instance.
   *
   * This can be used to log in by token (JWT), API key, or username and password.
   * @example <caption>Token authentication/renewal</caption>
   * const api = new Track();
   * api.logIn({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' });
   * @example <caption>API key authentication</caption>
   * const api = new Track();
   * api.logIn({ apiKey: '00000000-0000-0000-0000-000000000000' });
   * @example <caption>Username and password authentication</caption>
   * const api = new Track();
   * api.logIn({ username: 'csingh@example.com', password: 'securepassword' });
   * @param {Object} options Options for logging in
   * @param {string} [options.token] Token (JWT) to use directly in authentication
   * @param {string} [options.apiKey] API key to use for authentication
   * @param {string} [options.username] Username to use for authentication
   * @param {string} [options.password] Password to use for authentication
   * @returns {Promise} If successful, result of authenticateToken. Otherwise, an ErrorResponse
   * @see authenticateToken
   * @see ErrorResponse
   */
  logIn(options) {
    let uri;
    let headers = {
      Accept: 'application/json',
    };

    if (options.token) {
      uri = '/1/login/renew';
      headers = {
        ...headers,
        Authorization: `Bearer ${options.token.replace(/^Bearer /i, '')}`,
      };
    } else if (options.apiKey) {
      uri = '/1/login';
      headers = {
        ...headers,
        'Api-Key': options.apiKey,
      };
    } else if (options.username && options.password) {
      uri = '/1/login';
      headers = {
        ...headers,
        Authorization: `Basic ${btoa(`${options.username}:${options.password}`)}`,
      };
    }

    return this.client.post(uri, { headers })
      .then(response => response.text())
      .then(token => this.authenticateToken(token))
      .catch((errorResponse) => {
        if (errorResponse instanceof ForbiddenResponse) {
          return this.logOut()
            .then(() => Promise.reject(new ForbiddenResponse(errorResponse.response, 'Invalid credentials')));
        }

        return Promise.reject(errorResponse);
      });
  }

  /**
   * Clears the authentication state internally, effectively "logging out"
   * @returns {Promise} Immediately-resolved promise
   */
  logOut() {
    this.stopAutoRenew();
    JWT.forget();
    this.client.unsetAuthenticated();
    return Promise.resolve();
  }

  /**
   * Triggers the renewal of the token.
   *
   * This will return a rejected Promise if not logged in.
   * @returns {Promise} If successful, result of logIn. Otherwise, an error.
   * @see logIn
   */
  renewAuthentication() {
    if (JWT.get()) return this.logIn({ token: JWT.get() });

    return Promise.reject(new Error('Not logged in. Call logIn() first.'));
  }

  /**
   * Gets a list of customers.
   *
   * This will only resolve after the client is authenticated.
   * @returns {Promise} List of customers contained within the token
   */
  customers() {
    return this.client.authenticated
      .then(user => Object.keys(user.cust)
        .map(code => ({
          code,
          name: user.cust[code],
        })));
  }

  /**
   * Gets a customer resource.
   * @param {string} code Customer code
   * @returns {Customer} Customer resource
   */
  customer(code) {
    return this.resource(Customer, code);
  }
}

export default Track;
