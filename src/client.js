
/**
 * Module dependencies.
 */

import { assert, Assert as is, validate } from './validator';
import Promise from 'bluebird';
import _ from 'lodash';
import debugnyan from 'debugnyan';
import esc from 'url-escape-tag';
import manifest from '../package';
import parsePhone from './parsers/phone-parser';
import parseResponse from './parsers/response-parser';
import request from './logging/request';

/**
 * Instances.
 */

const log = debugnyan('authy:client');

/**
 * Sources arguments due to optional callback function.
 */

function source(...args) {
  const last = _.last(args);

  let callback;

  if (_.isFunction(last)) {
    callback = last;
    args = _.dropRight(args);
  }

  return [args, callback];
}

/**
 * Client.
 */

export default class Client {
  constructor({ key } = {}, { host = 'https://api.authy.com', timeout = 5000 } = {}) {
    validate({ host, key, timeout }, {
      host: is.string(),
      key: [is.required(), is.notBlank()],
      timeout: [is.integer(), is.greaterThanOrEqual(0)]
    });

    this.key = key;
    this.host = host;
    this.timeout = timeout;

    // Request default options.
    this.defaults = {
      headers: {
        'User-Agent': `${manifest.name}/${manifest.version} (${manifest.homepage})`,
        'X-Authy-API-Key': this.key
      },
      json: true,
      strictSSL: true,
      timeout: this.timeout
    };

    this.rpc = Promise.promisifyAll(request.defaults(_.defaultsDeep({
      baseUrl: `${this.host}/protected/json/`
    }, this.defaults)), { multiArgs: true });

    this.onetouch = Promise.promisifyAll(request.defaults(_.defaultsDeep({
      baseUrl: `${this.host}/onetouch/json/`
    }, this.defaults)), { multiArgs: true });

    log.debug({ host }, `Host set to ${host}`);
  }

  /**
   * Create approval request.
   */

  createApprovalRequest(...args) {
    return Promise.try(() => {
      const [[{ authyId, details = {}, logos, message } = {}, { ttl } = {}], callback] = source(...args);

      validate({ authyId, details, logos, message, ttl }, {
        authyId: [is.required(), is.authyId()],
        details: {
          hidden: is.plainObject(),
          visible: is.plainObject()
        },
        logos: [is.collection(is.Logo()), is.ofLength({ min: 1 })],
        message: [is.required(), is.string(), is.ofLength({ max: 144 })],
        ttl: is.integer()
      });

      return this.onetouch.postAsync({
        body: {
          details: details.visible,
          hidden_details: details.hidden,
          logos,
          message,
          seconds_to_expire: ttl
        },
        uri: esc`users/${authyId}/approval_requests`
      })
        .bind(this)
        .then(parseResponse)
        .tap(response => {
          assert(response, {
            approval_request: {
              uuid: [is.required(), is.string()]
            }
          });
        })
        .asCallback(callback);
    });
  }

  /**
   * Delete a user from the application.
   */

  deleteUser(...args) {
    return Promise.try(() => {
      const [[{ authyId } = {}, { ip } = {}], callback] = source(...args);

      log.debug({ authyId }, `Deleting user ${authyId}`);

      validate({ authyId, ip }, {
        authyId: [is.required(), is.authyId()],
        ip: is.Ip()
      });

      return this.rpc.postAsync({
        body: _.pickBy({
          user_ip: ip
        }, _.identity),
        uri: esc`users/${authyId}/remove`
      })
        .bind(this)
        .then(parseResponse)
        .asCallback(callback);
    });
  }

  /**
   * Retrieve application details.
   */

  getApplicationDetails(...args) {
    return Promise.try(() => {
      const [[{ ip } = {}], callback] = source(...args);

      log.debug('Retrieving application details');

      validate({ ip }, { ip: is.Ip() });

      return this.rpc.getAsync({
        qs: _.pickBy({
          user_ip: ip
        }, _.identity),
        uri: esc`app/details`
      })
        .bind(this)
        .then(parseResponse)
        .tap(response => {
          assert(response, {
            app: {
              app_id: [is.required(), is.integer()],
              name: [is.required(), is.string()],
              plan: [is.required(), is.string()],
              sms_enabled: [is.required(), is.boolean()]
            },
            message: [is.required(), is.equalTo('Application information.')]
          });
        })
        .asCallback(callback);
    });
  }

  /**
   * Retrieve approval request information.
   */

  getApprovalRequest(...args) {
    return Promise.try(() => {
      const [[{ id } = {}], callback] = source(...args);

      validate({ id }, {
        id: [is.required(), is.string()]
      });

      return this.onetouch.getAsync({ uri: esc`approval_requests/${id}` })
        .bind(this)
        .then(parseResponse)
        .tap(response => {
          assert(response, {
            approval_request: {
              _app_name: [is.required(), is.string()],
              _app_serial_id: [is.required(), is.integer()],
              _authy_id: [is.required(), is.authyId()],
              _id: [is.required(), is.string()],
              _user_email: [is.required(), is.email()],
              app_id: [is.required(), is.string()],
              created_at: [is.required(), is.date()],
              notified: [is.required(), is.boolean()],
              processed_at: is.callback(value => is.null().check(value) === true || is.date().check(value) === true, 'Callback'),
              status: [is.required(), is.choice(['approved', 'denied', 'expired', 'pending'])],
              updated_at: [is.required(), is.date()],
              user_id: [is.required(), is.string()],
              uuid: [is.required(), is.string()]
            }
          });
        })
        .asCallback(callback);
    });
  }

  /**
   * Retrieve application statistics.
   */

  getApplicationStatistics(...args) {
    return Promise.try(() => {
      const [[{ ip } = {}], callback] = source(...args);

      log.debug('Retrieving application statistics');

      validate({ ip }, { ip: is.Ip() });

      return this.rpc.getAsync({
        qs: _.pickBy({
          user_ip: ip
        }, _.identity),
        uri: esc`app/stats`
      })
        .bind(this)
        .then(parseResponse)
        .tap(response => {
          assert(response, {
            app_id: [is.required(), is.integer()],
            count: [is.required(), is.integer()],
            message: [is.required(), is.equalTo('Monthly statistics.')],
            stats: [is.required(), is.collection(is.equalKeys(['api_calls_count', 'auths_count', 'calls_count', 'month', 'sms_count', 'users_count', 'year']))],
            total_users: [is.required(), is.integer()]
          });
        })
        .asCallback(callback);
    });
  }

  getPhoneInformation(...args) {
    return Promise.try(() => {
      const [[{ countryCode: countryOrCallingCode, phone } = {}, { ip } = {}], callback] = source(...args);

      validate({ countryCode: countryOrCallingCode, ip, phone }, {
        countryCode: [is.required(), is.countryOrCallingCode()],
        ip: is.Ip(),
        phone: [is.required(), is.phone(countryOrCallingCode)]
      });

      const parsed = parsePhone({ countryOrCallingCode, phone });

      return this.rpc.getAsync({
        qs: {
          country_code: parsed.countryCallingCode,
          phone_number: parsed.phone,
          user_ip: ip
        },
        uri: esc`phones/info`
      })
        .bind(this)
        .then(parseResponse)
        .tap(response => {
          assert(response, {
            message: [is.required(), is.regexp('Phone number information as of \\d+-\\d+-\\d+ \\d+:\\d+:\\d+ UTC')],
            ported: [is.required(), is.boolean()],
            provider: [is.required(), is.string()],
            type: [is.required(), is.string()]
          });
        })
        .asCallback(callback);
    });
  }

  /**
   * Retrieve a user's status.
   */

  getUserStatus(...args) {
    return Promise.try(() => {
      const [[{ authyId } = {}, { ip } = {}], callback] = source(...args);

      log.debug({ authyId }, `Retrieving user ${authyId} status`);

      validate({ authyId, ip }, {
        authyId: [is.required(), is.authyId()],
        ip: is.Ip()
      });

      return this.rpc.getAsync({
        body: _.pickBy({
          user_ip: ip
        }, _.identity),
        uri: esc`users/${authyId}/status`
      })
        .bind(this)
        .then(parseResponse)
        .tap(response => {
          assert(response, {
            message: [is.required(), is.equalTo('User status.')],
            status: {
              authy_id: [is.required(), is.authyId()],
              confirmed: [is.required(), is.boolean()],
              country_code: [is.required(), is.countryOrCallingCode()],
              devices: is.required(),
              has_hard_token: [is.required(), is.boolean()],
              phone_number: [is.required(), is.string()],
              registered: [is.required(), is.boolean()]
            }
          });
        })
        .asCallback(callback);
    });
  }

  /**
   * Register a user activity.
   */

  registerActivity(...args) {
    return Promise.try(() => {
      const [[{ authyId, data, type } = {}, { ip } = {}], callback] = source(...args);

      log.debug(`Registering activity for user ${authyId}`);

      validate({ authyId, data, ip, type }, {
        authyId: [is.required(), is.authyId()],
        data: is.plainObject(),
        ip: is.ip(),
        type: [is.required(), is.activity()]
      });

      return this.rpc.postAsync({
        body: {
          data,
          type,
          user_ip: ip
        },
        uri: esc`users/${authyId}/register_activity`
      })
        .bind(this)
        .then(parseResponse)
        .tap(response => {
          assert(response, {
            message: [is.required(), is.equalTo('Activity was created.')]
          });
        })
        .asCallback(callback);
    });
  }

  /**
   * Request a call with a token for users that don't own a smartphone or are
   * having trouble with SMS. If the Authy app is in use by the user, this
   * request is ignored. Pass `force` to call the user regardless of this.
   */

  requestCall(...args) {
    return Promise.try(() => {
      const [[{ authyId } = {}, { action, message, force = false } = {}], callback] = source(...args);

      log.debug(`Requesting call for user ${authyId}`);

      validate({ action, authyId, force, message }, {
        action: [is.string(), is.ofLength({ max: 255, min: 1 })],
        authyId: [is.required(), is.authyId()],
        force: is.boolean(),
        message: [is.string(), is.ofLength({ max: 255, min: 1 })]
      });

      return this.rpc.getAsync({
        qs: _.pickBy({
          action,
          action_message: message,
          force
        }),
        uri: esc`call/${authyId}`
      })
        .bind(this)
        .then(parseResponse)
        .tap(response => {
          assert(response, {
            cellphone: [is.required(), is.string()],
            device: is.nullOrString(),
            ignored: is.boolean(),
            message: [is.required(), is.string()]
          });
        })
        .asCallback(callback);
    });
  }

  /**
   * Request an sms with a token for users that don't own a smartphone. If the
   * Authy app is in use by the user, this request is ignored. Pass `force` to
   * send an sms regardless of this.
   */

  requestSms(...args) {
    return Promise.try(() => {
      const [[{ authyId } = {}, { action, force = false, message } = {}], callback] = source(...args);

      log.debug(`Requesting sms for user ${authyId}`);

      validate({ action, authyId, force, message }, {
        action: [is.string(), is.ofLength({ max: 255, min: 1 })],
        authyId: [is.required(), is.authyId()],
        force: is.boolean(),
        message: [is.string(), is.ofLength({ max: 255, min: 1 })]
      });

      return this.rpc.getAsync({
        qs: _.pickBy({
          action,
          action_message: message,
          force
        }),
        uri: esc`sms/${authyId}`
      })
        .bind(this)
        .then(parseResponse)
        .tap(response => {
          assert(response, {
            cellphone: [is.required(), is.string()],
            device: is.nullOrString(),
            ignored: is.boolean(),
            message: [is.required(), is.string()]
          });
        })
        .asCallback(callback);
    });
  }

  /**
   * Enable two-factor authentication on a user. The returned `authyId` field should be stored for
   * subsequent calls.
   */

  registerUser(...args) {
    return Promise.try(() => {
      const [[{ countryCode: countryOrCallingCode, email, phone } = {}], callback] = source(...args);

      log.debug(`Registering user with email ${email} and phone ${phone} (${countryOrCallingCode})`);

      validate({ countryCode: countryOrCallingCode, email, phone }, {
        countryCode: [is.required(), is.countryOrCallingCode()],
        email: [is.required(), is.email()],
        phone: [is.required(), is.phone(countryOrCallingCode)]
      });

      const parsed = parsePhone({ countryOrCallingCode, phone });

      return this.rpc.postAsync({
        body: {
          user: {
            cellphone: parsed.phone,
            country_code: parsed.countryCallingCode,
            email
          }
        },
        uri: esc`users/new`
      })
        .bind(this)
        .then(parseResponse)
        .tap(response => {
          assert(response, {
            message: [is.required(), is.equalTo('User created successfully.')],
            user: {
              id: [is.required(), is.authyId()]
            }
          });
        })
        .asCallback(callback);
    });
  }

  /**
   * Verify a token submitted by a user.
   */

  verifyToken(...args) {
    return Promise.try(() => {
      const [[{ authyId, token } = {}, { force = false } = {}], callback] = source(...args);

      log.debug(`Verifying token ${token} for user ${authyId}`);

      validate({ authyId, force, token }, {
        authyId: [is.required(), is.authyId()],
        force: is.boolean(),
        token: [is.required(), is.totpToken()]
      });

      return this.rpc.getAsync({
        qs: _.pickBy({
          force
        }),
        uri: esc`verify/${token}/${authyId}`
      })
        .bind(this)
        .then(parseResponse)
        .tap(response => {
          assert(response, {
            message: [is.required(), is.equalTo('Token is valid.')],
            token: [is.required(), is.equalTo('is valid')]
          });
        })
        .asCallback(callback);
    });
  }

  /**
   * Start a phone verification using the Phone Verification API.
   */

  startPhoneVerification(...args) {
    return Promise.try(() => {
      const [[{ countryCode: countryOrCallingCode, phone, via } = {}, { codeLength, locale } = {}], callback] = source(...args);

      validate({ codeLength, countryCode: countryOrCallingCode, phone, via }, {
        codeLength: [is.range(4, 10)],
        countryCode: [is.required(), is.countryOrCallingCode()],
        locale: is.locale(),
        phone: [is.required(), is.phone(countryOrCallingCode)],
        via: [is.required(), is.verificationVia()]
      });

      const parsed = parsePhone({ countryOrCallingCode, phone });

      return this.rpc.postAsync({
        body: _.pickBy({
          country_code: parsed.countryCallingCode,
          locale,
          phone_number: parsed.phone,
          via
        }, _.identity),
        uri: esc`phones/verification/start`
      })
        .bind(this)
        .then(parseResponse)
        .tap(response => {
          assert(response, {
            carrier: is.nullOrString(),
            is_cellphone: is.boolean(),
            is_ported: is.boolean(),
            message: [is.required(), is.string()]
          });
        })
        .asCallback(callback);
    });
  }

  /**
   * Verify a callback from Authy.
   *
   * Currently only the verification of authenticity of approval requests (Authy OneTouch) is supported.
   */

  verifyCallback(...args) {
    const [[request = {}], callback] = source(...args);

    return Promise.try(() => {
      validate(request, {
        body: {
          approval_request: [is.required(), is.callback(value => {
            return is.string().check(value) === true || is.plainObject().check(value) === true;
          }, 'Callback')],
          authy_id: [is.required(), is.authyId()],
          callback_action: [is.required(), is.choice(['approval_request_status'])],
          device_uuid: [is.required(), is.string()],
          signature: [is.required(), is.string()],
          status: [is.required(), is.choice(['approved', 'denied'])],
          uuid: [is.required(), is.string()]
        },
        headers: {
          'x-authy-signature': [is.string(), is.Signature({ key: this.key, request })],
          'x-authy-signature-nonce': [is.callback(value => is.integer().check(value) === true || is.string().check(value) === true, 'Callback')]
        },
        method: [is.required(), is.choice(['GET', 'POST'])],
        protocol: [is.required(), is.choice(['http', 'https'])],
        url: [is.required(), is.string()]
      });

      return Promise.resolve(request).asCallback(callback);
    });
  }

  /**
   * Verify a phone using the Phone Verification API.
   */

  verifyPhone(...args) {
    return Promise.try(() => {
      const [[{ countryCode: countryOrCallingCode, phone, token } = {}], callback] = source(...args);

      validate({ countryCode: countryOrCallingCode, phone, token }, {
        countryCode: [is.required(), is.countryOrCallingCode()],
        phone: [is.required(), is.phone(countryOrCallingCode)],
        token: [is.required(), is.phoneVerificationToken()]
      });

      const parsed = parsePhone({ countryOrCallingCode, phone });

      return this.rpc.getAsync({
        qs: {
          country_code: parsed.countryCallingCode,
          phone_number: parsed.phone,
          verification_code: token
        },
        uri: esc`phones/verification/check`
      })
        .bind(this)
        .then(parseResponse)
        .tap(response => {
          assert(response, {
            message: [is.required(), is.equalTo('Verification code is correct.')]
          });
        })
        .asCallback(callback);
    });
  }
}
