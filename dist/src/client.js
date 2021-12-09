'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
/**
 * Module dependencies.
 */

var _validator = require('./validator');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _debugnyan = require('debugnyan');

var _debugnyan2 = _interopRequireDefault(_debugnyan);

var _urlEscapeTag = require('url-escape-tag');

var _urlEscapeTag2 = _interopRequireDefault(_urlEscapeTag);

var _package = require('../package');

var _package2 = _interopRequireDefault(_package);

var _phoneParser = require('./parsers/phone-parser');

var _phoneParser2 = _interopRequireDefault(_phoneParser);

var _responseParser = require('./parsers/response-parser');

var _responseParser2 = _interopRequireDefault(_responseParser);

var _request = require('./logging/request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Instances.
 */

const log = (0, _debugnyan2.default)('authy:client');

/**
 * Sources arguments due to optional callback function.
 */

function source() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  const last = _lodash2.default.last(args);

  let callback;

  if (_lodash2.default.isFunction(last)) {
    callback = last;
    args = _lodash2.default.dropRight(args);
  }

  return [args, callback];
}

/**
 * Client.
 */

class Client {
  constructor() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    let key = _ref.key;

    var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref2$host = _ref2.host;

    let host = _ref2$host === undefined ? 'https://api.authy.com' : _ref2$host;
    var _ref2$timeout = _ref2.timeout;
    let timeout = _ref2$timeout === undefined ? 5000 : _ref2$timeout;

    (0, _validator.validate)({ host: host, key: key, timeout: timeout }, {
      host: _validator.Assert.string(),
      key: [_validator.Assert.required(), _validator.Assert.notBlank()],
      timeout: [_validator.Assert.integer(), _validator.Assert.greaterThanOrEqual(0)]
    });

    this.key = key;
    this.host = host;
    this.timeout = timeout;

    // Request default options.
    this.defaults = {
      headers: {
        'User-Agent': `${_package2.default.name}/${_package2.default.version} (${_package2.default.homepage})`,
        'X-Authy-API-Key': this.key
      },
      json: true,
      strictSSL: true,
      timeout: this.timeout
    };

    this.rpc = _bluebird2.default.promisifyAll(_request2.default.defaults(_lodash2.default.defaultsDeep({
      baseUrl: `${this.host}/protected/json/`
    }, this.defaults)), { multiArgs: true });

    this.onetouch = _bluebird2.default.promisifyAll(_request2.default.defaults(_lodash2.default.defaultsDeep({
      baseUrl: `${this.host}/onetouch/json/`
    }, this.defaults)), { multiArgs: true });

    log.debug({ host: host }, `Host set to ${host}`);
  }

  /**
   * Create approval request.
   */

  createApprovalRequest() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return _bluebird2.default.try(() => {
      var _source = source.apply(undefined, args),
          _source2 = _slicedToArray(_source, 2),
          _source2$ = _slicedToArray(_source2[0], 2),
          _source2$$ = _source2$[0];

      _source2$$ = _source2$$ === undefined ? {} : _source2$$;
      const authyId = _source2$$.authyId;
      var _source2$$$details = _source2$$.details;
      const details = _source2$$$details === undefined ? {} : _source2$$$details,
            logos = _source2$$.logos,
            message = _source2$$.message;
      var _source2$$2 = _source2$[1];
      _source2$$2 = _source2$$2 === undefined ? {} : _source2$$2;
      const ttl = _source2$$2.ttl,
            callback = _source2[1];


      (0, _validator.validate)({ authyId: authyId, details: details, logos: logos, message: message, ttl: ttl }, {
        authyId: [_validator.Assert.required(), _validator.Assert.authyId()],
        details: {
          hidden: _validator.Assert.plainObject(),
          visible: _validator.Assert.plainObject()
        },
        logos: [_validator.Assert.collection(_validator.Assert.Logo()), _validator.Assert.ofLength({ min: 1 })],
        message: [_validator.Assert.required(), _validator.Assert.string(), _validator.Assert.ofLength({ max: 144 })],
        ttl: _validator.Assert.integer()
      });

      return this.onetouch.postAsync({
        body: {
          details: details.visible,
          hidden_details: details.hidden,
          logos: logos,
          message: message,
          seconds_to_expire: ttl
        },
        uri: _urlEscapeTag2.default`users/${authyId}/approval_requests`
      }).bind(this).then(_responseParser2.default).tap(response => {
        (0, _validator.assert)(response, {
          approval_request: {
            uuid: [_validator.Assert.required(), _validator.Assert.string()]
          }
        });
      }).asCallback(callback);
    });
  }

  /**
   * Delete a user from the application.
   */

  deleteUser() {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return _bluebird2.default.try(() => {
      var _source3 = source.apply(undefined, args),
          _source4 = _slicedToArray(_source3, 2),
          _source4$ = _slicedToArray(_source4[0], 2),
          _source4$$ = _source4$[0];

      _source4$$ = _source4$$ === undefined ? {} : _source4$$;
      const authyId = _source4$$.authyId;
      var _source4$$2 = _source4$[1];
      _source4$$2 = _source4$$2 === undefined ? {} : _source4$$2;
      const ip = _source4$$2.ip,
            callback = _source4[1];


      log.debug({ authyId: authyId }, `Deleting user ${authyId}`);

      (0, _validator.validate)({ authyId: authyId, ip: ip }, {
        authyId: [_validator.Assert.required(), _validator.Assert.authyId()],
        ip: _validator.Assert.Ip()
      });

      return this.rpc.postAsync({
        body: _lodash2.default.pickBy({
          user_ip: ip
        }, _lodash2.default.identity),
        uri: _urlEscapeTag2.default`users/${authyId}/remove`
      }).bind(this).then(_responseParser2.default).asCallback(callback);
    });
  }

  /**
   * Retrieve application details.
   */

  getApplicationDetails() {
    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    return _bluebird2.default.try(() => {
      var _source5 = source.apply(undefined, args),
          _source6 = _slicedToArray(_source5, 2),
          _source6$ = _slicedToArray(_source6[0], 1),
          _source6$$ = _source6$[0];

      _source6$$ = _source6$$ === undefined ? {} : _source6$$;
      const ip = _source6$$.ip,
            callback = _source6[1];


      log.debug('Retrieving application details');

      (0, _validator.validate)({ ip: ip }, { ip: _validator.Assert.Ip() });

      return this.rpc.getAsync({
        qs: _lodash2.default.pickBy({
          user_ip: ip
        }, _lodash2.default.identity),
        uri: _urlEscapeTag2.default`app/details`
      }).bind(this).then(_responseParser2.default).tap(response => {
        (0, _validator.assert)(response, {
          app: {
            app_id: [_validator.Assert.required(), _validator.Assert.integer()],
            name: [_validator.Assert.required(), _validator.Assert.string()],
            plan: [_validator.Assert.required(), _validator.Assert.string()],
            sms_enabled: [_validator.Assert.required(), _validator.Assert.boolean()]
          },
          message: [_validator.Assert.required(), _validator.Assert.equalTo('Application information.')]
        });
      }).asCallback(callback);
    });
  }

  /**
   * Retrieve approval request information.
   */

  getApprovalRequest() {
    for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    return _bluebird2.default.try(() => {
      var _source7 = source.apply(undefined, args),
          _source8 = _slicedToArray(_source7, 2),
          _source8$ = _slicedToArray(_source8[0], 1),
          _source8$$ = _source8$[0];

      _source8$$ = _source8$$ === undefined ? {} : _source8$$;
      const id = _source8$$.id,
            callback = _source8[1];


      (0, _validator.validate)({ id: id }, {
        id: [_validator.Assert.required(), _validator.Assert.string()]
      });

      return this.onetouch.getAsync({ uri: _urlEscapeTag2.default`approval_requests/${id}` }).bind(this).then(_responseParser2.default).tap(response => {
        (0, _validator.assert)(response, {
          approval_request: {
            _app_name: [_validator.Assert.required(), _validator.Assert.string()],
            _app_serial_id: [_validator.Assert.required(), _validator.Assert.integer()],
            _authy_id: [_validator.Assert.required(), _validator.Assert.authyId()],
            _id: [_validator.Assert.required(), _validator.Assert.string()],
            _user_email: [_validator.Assert.required(), _validator.Assert.email()],
            app_id: [_validator.Assert.required(), _validator.Assert.string()],
            created_at: [_validator.Assert.required(), _validator.Assert.date()],
            notified: [_validator.Assert.required(), _validator.Assert.boolean()],
            processed_at: _validator.Assert.callback(value => _validator.Assert.null().check(value) === true || _validator.Assert.date().check(value) === true, 'Callback'),
            status: [_validator.Assert.required(), _validator.Assert.choice(['approved', 'denied', 'expired', 'pending'])],
            updated_at: [_validator.Assert.required(), _validator.Assert.date()],
            user_id: [_validator.Assert.required(), _validator.Assert.string()],
            uuid: [_validator.Assert.required(), _validator.Assert.string()]
          }
        });
      }).asCallback(callback);
    });
  }

  /**
   * Retrieve application statistics.
   */

  getApplicationStatistics() {
    for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      args[_key6] = arguments[_key6];
    }

    return _bluebird2.default.try(() => {
      var _source9 = source.apply(undefined, args),
          _source10 = _slicedToArray(_source9, 2),
          _source10$ = _slicedToArray(_source10[0], 1),
          _source10$$ = _source10$[0];

      _source10$$ = _source10$$ === undefined ? {} : _source10$$;
      const ip = _source10$$.ip,
            callback = _source10[1];


      log.debug('Retrieving application statistics');

      (0, _validator.validate)({ ip: ip }, { ip: _validator.Assert.Ip() });

      return this.rpc.getAsync({
        qs: _lodash2.default.pickBy({
          user_ip: ip
        }, _lodash2.default.identity),
        uri: _urlEscapeTag2.default`app/stats`
      }).bind(this).then(_responseParser2.default).tap(response => {
        (0, _validator.assert)(response, {
          app_id: [_validator.Assert.required(), _validator.Assert.integer()],
          count: [_validator.Assert.required(), _validator.Assert.integer()],
          message: [_validator.Assert.required(), _validator.Assert.equalTo('Monthly statistics.')],
          stats: [_validator.Assert.required(), _validator.Assert.collection(_validator.Assert.equalKeys(['api_calls_count', 'auths_count', 'calls_count', 'month', 'sms_count', 'users_count', 'year']))],
          total_users: [_validator.Assert.required(), _validator.Assert.integer()]
        });
      }).asCallback(callback);
    });
  }

  getPhoneInformation() {
    for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
      args[_key7] = arguments[_key7];
    }

    return _bluebird2.default.try(() => {
      var _source11 = source.apply(undefined, args),
          _source12 = _slicedToArray(_source11, 2),
          _source12$ = _slicedToArray(_source12[0], 2),
          _source12$$ = _source12$[0];

      _source12$$ = _source12$$ === undefined ? {} : _source12$$;
      const countryOrCallingCode = _source12$$.countryCode,
            phone = _source12$$.phone;
      var _source12$$2 = _source12$[1];
      _source12$$2 = _source12$$2 === undefined ? {} : _source12$$2;
      const ip = _source12$$2.ip,
            callback = _source12[1];


      (0, _validator.validate)({ countryCode: countryOrCallingCode, ip: ip, phone: phone }, {
        countryCode: [_validator.Assert.required(), _validator.Assert.countryOrCallingCode()],
        ip: _validator.Assert.Ip(),
        phone: [_validator.Assert.required(), _validator.Assert.phone(countryOrCallingCode)]
      });

      const parsed = (0, _phoneParser2.default)({ countryOrCallingCode: countryOrCallingCode, phone: phone });

      return this.rpc.getAsync({
        qs: {
          country_code: parsed.countryCallingCode,
          phone_number: parsed.phone,
          user_ip: ip
        },
        uri: _urlEscapeTag2.default`phones/info`
      }).bind(this).then(_responseParser2.default).tap(response => {
        (0, _validator.assert)(response, {
          message: [_validator.Assert.required(), _validator.Assert.regexp('Phone number information as of \\d+-\\d+-\\d+ \\d+:\\d+:\\d+ UTC')],
          ported: [_validator.Assert.required(), _validator.Assert.boolean()],
          provider: [_validator.Assert.required(), _validator.Assert.string()],
          type: [_validator.Assert.required(), _validator.Assert.string()]
        });
      }).asCallback(callback);
    });
  }

  /**
   * Retrieve a user's status.
   */

  getUserStatus() {
    for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
      args[_key8] = arguments[_key8];
    }

    return _bluebird2.default.try(() => {
      var _source13 = source.apply(undefined, args),
          _source14 = _slicedToArray(_source13, 2),
          _source14$ = _slicedToArray(_source14[0], 2),
          _source14$$ = _source14$[0];

      _source14$$ = _source14$$ === undefined ? {} : _source14$$;
      const authyId = _source14$$.authyId;
      var _source14$$2 = _source14$[1];
      _source14$$2 = _source14$$2 === undefined ? {} : _source14$$2;
      const ip = _source14$$2.ip,
            callback = _source14[1];


      log.debug({ authyId: authyId }, `Retrieving user ${authyId} status`);

      (0, _validator.validate)({ authyId: authyId, ip: ip }, {
        authyId: [_validator.Assert.required(), _validator.Assert.authyId()],
        ip: _validator.Assert.Ip()
      });

      return this.rpc.getAsync({
        body: _lodash2.default.pickBy({
          user_ip: ip
        }, _lodash2.default.identity),
        uri: _urlEscapeTag2.default`users/${authyId}/status`
      }).bind(this).then(_responseParser2.default).tap(response => {
        (0, _validator.assert)(response, {
          message: [_validator.Assert.required(), _validator.Assert.equalTo('User status.')],
          status: {
            authy_id: [_validator.Assert.required(), _validator.Assert.authyId()],
            confirmed: [_validator.Assert.required(), _validator.Assert.boolean()],
            country_code: [_validator.Assert.required(), _validator.Assert.countryOrCallingCode()],
            devices: _validator.Assert.required(),
            has_hard_token: [_validator.Assert.required(), _validator.Assert.boolean()],
            phone_number: [_validator.Assert.required(), _validator.Assert.string()],
            registered: [_validator.Assert.required(), _validator.Assert.boolean()]
          }
        });
      }).asCallback(callback);
    });
  }

  /**
   * Register a user activity.
   */

  registerActivity() {
    for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
      args[_key9] = arguments[_key9];
    }

    return _bluebird2.default.try(() => {
      var _source15 = source.apply(undefined, args),
          _source16 = _slicedToArray(_source15, 2),
          _source16$ = _slicedToArray(_source16[0], 2),
          _source16$$ = _source16$[0];

      _source16$$ = _source16$$ === undefined ? {} : _source16$$;
      const authyId = _source16$$.authyId,
            data = _source16$$.data,
            type = _source16$$.type;
      var _source16$$2 = _source16$[1];
      _source16$$2 = _source16$$2 === undefined ? {} : _source16$$2;
      const ip = _source16$$2.ip,
            callback = _source16[1];


      log.debug(`Registering activity for user ${authyId}`);

      (0, _validator.validate)({ authyId: authyId, data: data, ip: ip, type: type }, {
        authyId: [_validator.Assert.required(), _validator.Assert.authyId()],
        data: _validator.Assert.plainObject(),
        ip: _validator.Assert.ip(),
        type: [_validator.Assert.required(), _validator.Assert.activity()]
      });

      return this.rpc.postAsync({
        body: {
          data: data,
          type: type,
          user_ip: ip
        },
        uri: _urlEscapeTag2.default`users/${authyId}/register_activity`
      }).bind(this).then(_responseParser2.default).tap(response => {
        (0, _validator.assert)(response, {
          message: [_validator.Assert.required(), _validator.Assert.equalTo('Activity was created.')]
        });
      }).asCallback(callback);
    });
  }

  /**
   * Request a call with a token for users that don't own a smartphone or are
   * having trouble with SMS. If the Authy app is in use by the user, this
   * request is ignored. Pass `force` to call the user regardless of this.
   */

  requestCall() {
    for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
      args[_key10] = arguments[_key10];
    }

    return _bluebird2.default.try(() => {
      var _source17 = source.apply(undefined, args),
          _source18 = _slicedToArray(_source17, 2),
          _source18$ = _slicedToArray(_source18[0], 2),
          _source18$$ = _source18$[0];

      _source18$$ = _source18$$ === undefined ? {} : _source18$$;
      const authyId = _source18$$.authyId;
      var _source18$$2 = _source18$[1];
      _source18$$2 = _source18$$2 === undefined ? {} : _source18$$2;
      const action = _source18$$2.action,
            message = _source18$$2.message;
      var _source18$$2$force = _source18$$2.force;
      const force = _source18$$2$force === undefined ? false : _source18$$2$force,
            callback = _source18[1];


      log.debug(`Requesting call for user ${authyId}`);

      (0, _validator.validate)({ action: action, authyId: authyId, force: force, message: message }, {
        action: [_validator.Assert.string(), _validator.Assert.ofLength({ max: 255, min: 1 })],
        authyId: [_validator.Assert.required(), _validator.Assert.authyId()],
        force: _validator.Assert.boolean(),
        message: [_validator.Assert.string(), _validator.Assert.ofLength({ max: 255, min: 1 })]
      });

      return this.rpc.getAsync({
        qs: _lodash2.default.pickBy({
          action: action,
          action_message: message,
          force: force
        }),
        uri: _urlEscapeTag2.default`call/${authyId}`
      }).bind(this).then(_responseParser2.default).tap(response => {
        (0, _validator.assert)(response, {
          cellphone: [_validator.Assert.required(), _validator.Assert.string()],
          device: _validator.Assert.nullOrString(),
          ignored: _validator.Assert.boolean(),
          message: [_validator.Assert.required(), _validator.Assert.string()]
        });
      }).asCallback(callback);
    });
  }

  /**
   * Request an sms with a token for users that don't own a smartphone. If the
   * Authy app is in use by the user, this request is ignored. Pass `force` to
   * send an sms regardless of this.
   */

  requestSms() {
    for (var _len11 = arguments.length, args = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
      args[_key11] = arguments[_key11];
    }

    return _bluebird2.default.try(() => {
      var _source19 = source.apply(undefined, args),
          _source20 = _slicedToArray(_source19, 2),
          _source20$ = _slicedToArray(_source20[0], 2),
          _source20$$ = _source20$[0];

      _source20$$ = _source20$$ === undefined ? {} : _source20$$;
      const authyId = _source20$$.authyId;
      var _source20$$2 = _source20$[1];
      _source20$$2 = _source20$$2 === undefined ? {} : _source20$$2;
      const action = _source20$$2.action;
      var _source20$$2$force = _source20$$2.force;
      const force = _source20$$2$force === undefined ? false : _source20$$2$force,
            message = _source20$$2.message,
            callback = _source20[1];


      log.debug(`Requesting sms for user ${authyId}`);

      (0, _validator.validate)({ action: action, authyId: authyId, force: force, message: message }, {
        action: [_validator.Assert.string(), _validator.Assert.ofLength({ max: 255, min: 1 })],
        authyId: [_validator.Assert.required(), _validator.Assert.authyId()],
        force: _validator.Assert.boolean(),
        message: [_validator.Assert.string(), _validator.Assert.ofLength({ max: 255, min: 1 })]
      });

      return this.rpc.getAsync({
        qs: _lodash2.default.pickBy({
          action: action,
          action_message: message,
          force: force
        }),
        uri: _urlEscapeTag2.default`sms/${authyId}`
      }).bind(this).then(_responseParser2.default).tap(response => {
        (0, _validator.assert)(response, {
          cellphone: [_validator.Assert.required(), _validator.Assert.string()],
          device: _validator.Assert.nullOrString(),
          ignored: _validator.Assert.boolean(),
          message: [_validator.Assert.required(), _validator.Assert.string()]
        });
      }).asCallback(callback);
    });
  }

  /**
   * Enable two-factor authentication on a user. The returned `authyId` field should be stored for
   * subsequent calls.
   */

  registerUser() {
    for (var _len12 = arguments.length, args = Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
      args[_key12] = arguments[_key12];
    }

    return _bluebird2.default.try(() => {
      var _source21 = source.apply(undefined, args),
          _source22 = _slicedToArray(_source21, 2),
          _source22$ = _slicedToArray(_source22[0], 1),
          _source22$$ = _source22$[0];

      _source22$$ = _source22$$ === undefined ? {} : _source22$$;
      const countryOrCallingCode = _source22$$.countryCode,
            email = _source22$$.email,
            phone = _source22$$.phone,
            callback = _source22[1];


      log.debug(`Registering user with email ${email} and phone ${phone} (${countryOrCallingCode})`);

      (0, _validator.validate)({ countryCode: countryOrCallingCode, email: email, phone: phone }, {
        countryCode: [_validator.Assert.required(), _validator.Assert.countryOrCallingCode()],
        email: [_validator.Assert.required(), _validator.Assert.email()],
        phone: [_validator.Assert.required(), _validator.Assert.phone(countryOrCallingCode)]
      });

      const parsed = (0, _phoneParser2.default)({ countryOrCallingCode: countryOrCallingCode, phone: phone });

      return this.rpc.postAsync({
        body: {
          user: {
            cellphone: parsed.phone,
            country_code: parsed.countryCallingCode,
            email: email
          }
        },
        uri: _urlEscapeTag2.default`users/new`
      }).bind(this).then(_responseParser2.default).tap(response => {
        (0, _validator.assert)(response, {
          message: [_validator.Assert.required(), _validator.Assert.equalTo('User created successfully.')],
          user: {
            id: [_validator.Assert.required(), _validator.Assert.authyId()]
          }
        });
      }).asCallback(callback);
    });
  }

  /**
   * Verify a token submitted by a user.
   */

  verifyToken() {
    for (var _len13 = arguments.length, args = Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
      args[_key13] = arguments[_key13];
    }

    return _bluebird2.default.try(() => {
      var _source23 = source.apply(undefined, args),
          _source24 = _slicedToArray(_source23, 2),
          _source24$ = _slicedToArray(_source24[0], 2),
          _source24$$ = _source24$[0];

      _source24$$ = _source24$$ === undefined ? {} : _source24$$;
      const authyId = _source24$$.authyId,
            token = _source24$$.token;
      var _source24$$2 = _source24$[1];
      _source24$$2 = _source24$$2 === undefined ? {} : _source24$$2;
      var _source24$$2$force = _source24$$2.force;
      const force = _source24$$2$force === undefined ? false : _source24$$2$force,
            callback = _source24[1];


      log.debug(`Verifying token ${token} for user ${authyId}`);

      (0, _validator.validate)({ authyId: authyId, force: force, token: token }, {
        authyId: [_validator.Assert.required(), _validator.Assert.authyId()],
        force: _validator.Assert.boolean(),
        token: [_validator.Assert.required(), _validator.Assert.totpToken()]
      });

      return this.rpc.getAsync({
        qs: _lodash2.default.pickBy({
          force: force
        }),
        uri: _urlEscapeTag2.default`verify/${token}/${authyId}`
      }).bind(this).then(_responseParser2.default).tap(response => {
        (0, _validator.assert)(response, {
          message: [_validator.Assert.required(), _validator.Assert.equalTo('Token is valid.')],
          token: [_validator.Assert.required(), _validator.Assert.equalTo('is valid')]
        });
      }).asCallback(callback);
    });
  }

  /**
   * Start a phone verification using the Phone Verification API.
   */

  startPhoneVerification() {
    for (var _len14 = arguments.length, args = Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {
      args[_key14] = arguments[_key14];
    }

    return _bluebird2.default.try(() => {
      var _source25 = source.apply(undefined, args),
          _source26 = _slicedToArray(_source25, 2),
          _source26$ = _slicedToArray(_source26[0], 2),
          _source26$$ = _source26$[0];

      _source26$$ = _source26$$ === undefined ? {} : _source26$$;
      const countryOrCallingCode = _source26$$.countryCode,
            phone = _source26$$.phone,
            via = _source26$$.via;
      var _source26$$2 = _source26$[1];
      _source26$$2 = _source26$$2 === undefined ? {} : _source26$$2;
      const codeLength = _source26$$2.codeLength,
            locale = _source26$$2.locale,
            callback = _source26[1];


      (0, _validator.validate)({ codeLength: codeLength, countryCode: countryOrCallingCode, phone: phone, via: via }, {
        codeLength: [_validator.Assert.range(4, 10)],
        countryCode: [_validator.Assert.required(), _validator.Assert.countryOrCallingCode()],
        locale: _validator.Assert.locale(),
        phone: [_validator.Assert.required(), _validator.Assert.phone(countryOrCallingCode)],
        via: [_validator.Assert.required(), _validator.Assert.verificationVia()]
      });

      const parsed = (0, _phoneParser2.default)({ countryOrCallingCode: countryOrCallingCode, phone: phone });

      return this.rpc.postAsync({
        body: _lodash2.default.pickBy({
          country_code: parsed.countryCallingCode,
          locale: locale,
          phone_number: parsed.phone,
          via: via
        }, _lodash2.default.identity),
        uri: _urlEscapeTag2.default`phones/verification/start`
      }).bind(this).then(_responseParser2.default).tap(response => {
        (0, _validator.assert)(response, {
          carrier: _validator.Assert.nullOrString(),
          is_cellphone: _validator.Assert.boolean(),
          is_ported: _validator.Assert.boolean(),
          message: [_validator.Assert.required(), _validator.Assert.string()]
        });
      }).asCallback(callback);
    });
  }

  /**
   * Verify a callback from Authy.
   *
   * Currently only the verification of authenticity of approval requests (Authy OneTouch) is supported.
   */

  verifyCallback() {
    var _source27 = source.apply(undefined, arguments),
        _source28 = _slicedToArray(_source27, 2),
        _source28$ = _slicedToArray(_source28[0], 1),
        _source28$$ = _source28$[0];

    const request = _source28$$ === undefined ? {} : _source28$$,
          callback = _source28[1];


    return _bluebird2.default.try(() => {
      (0, _validator.validate)(request, {
        body: {
          approval_request: [_validator.Assert.required(), _validator.Assert.callback(value => {
            return _validator.Assert.string().check(value) === true || _validator.Assert.plainObject().check(value) === true;
          }, 'Callback')],
          authy_id: [_validator.Assert.required(), _validator.Assert.authyId()],
          callback_action: [_validator.Assert.required(), _validator.Assert.choice(['approval_request_status'])],
          device_uuid: [_validator.Assert.required(), _validator.Assert.string()],
          signature: [_validator.Assert.required(), _validator.Assert.string()],
          status: [_validator.Assert.required(), _validator.Assert.choice(['approved', 'denied'])],
          uuid: [_validator.Assert.required(), _validator.Assert.string()]
        },
        headers: {
          'x-authy-signature': [_validator.Assert.string(), _validator.Assert.Signature({ key: this.key, request: request })],
          'x-authy-signature-nonce': [_validator.Assert.callback(value => _validator.Assert.integer().check(value) === true || _validator.Assert.string().check(value) === true, 'Callback')]
        },
        method: [_validator.Assert.required(), _validator.Assert.choice(['GET', 'POST'])],
        protocol: [_validator.Assert.required(), _validator.Assert.choice(['http', 'https'])],
        url: [_validator.Assert.required(), _validator.Assert.string()]
      });

      return _bluebird2.default.resolve(request).asCallback(callback);
    });
  }

  /**
   * Verify a phone using the Phone Verification API.
   */

  verifyPhone() {
    for (var _len15 = arguments.length, args = Array(_len15), _key15 = 0; _key15 < _len15; _key15++) {
      args[_key15] = arguments[_key15];
    }

    return _bluebird2.default.try(() => {
      var _source29 = source.apply(undefined, args),
          _source30 = _slicedToArray(_source29, 2),
          _source30$ = _slicedToArray(_source30[0], 1),
          _source30$$ = _source30$[0];

      _source30$$ = _source30$$ === undefined ? {} : _source30$$;
      const countryOrCallingCode = _source30$$.countryCode,
            phone = _source30$$.phone,
            token = _source30$$.token,
            callback = _source30[1];


      (0, _validator.validate)({ countryCode: countryOrCallingCode, phone: phone, token: token }, {
        countryCode: [_validator.Assert.required(), _validator.Assert.countryOrCallingCode()],
        phone: [_validator.Assert.required(), _validator.Assert.phone(countryOrCallingCode)],
        token: [_validator.Assert.required(), _validator.Assert.phoneVerificationToken()]
      });

      const parsed = (0, _phoneParser2.default)({ countryOrCallingCode: countryOrCallingCode, phone: phone });

      return this.rpc.getAsync({
        qs: {
          country_code: parsed.countryCallingCode,
          phone_number: parsed.phone,
          verification_code: token
        },
        uri: _urlEscapeTag2.default`phones/verification/check`
      }).bind(this).then(_responseParser2.default).tap(response => {
        (0, _validator.assert)(response, {
          message: [_validator.Assert.required(), _validator.Assert.equalTo('Verification code is correct.')]
        });
      }).asCallback(callback);
    });
  }
}
exports.default = Client;
module.exports = exports['default'];