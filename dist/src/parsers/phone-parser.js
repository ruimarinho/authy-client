'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
/**
 * Module dependencies.
 */

exports.default = parse;

var _googleLibphonenumber = require('google-libphonenumber');

var _debugnyan = require('debugnyan');

var _debugnyan2 = _interopRequireDefault(_debugnyan);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Instances.
 */

const log = (0, _debugnyan2.default)('authy:phone-parser');
const phoneUtil = _googleLibphonenumber.PhoneNumberUtil.getInstance();
const expressions = {
  numeric: /\d+/,
  plusSign: /\+/
};

/**
 * Export `parse` function to parse a phone and code input.
 */

function parse() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  let phone = _ref.phone,
      countryOrCallingCode = _ref.countryOrCallingCode;

  let countryCode;

  log.debug({ countryOrCallingCode: countryOrCallingCode, phone: phone }, `Parsing phone (${countryOrCallingCode}) ${phone}`);

  // Attempt to get the country calling code (e.g. `351`) from a country code (e.g. `PT`).
  let countryCallingCode = phoneUtil.getCountryCodeForRegion(countryOrCallingCode);

  // Unless the return value is `0`, a valid country calling code (e.g. +351) was found,
  // which in turn means that `countryOrCallingCode` was a valid `countryCode`.
  if (countryCallingCode !== 0) {
    log.debug({ countryCallingCode: countryCallingCode, countryCode: countryOrCallingCode }, `Matched ${countryOrCallingCode} to ${countryCallingCode}`);

    countryCode = countryOrCallingCode;
  }

  // If `countryCode` is not yet defined, `countryOrCallingCode` is either an invalid
  // `countryCode` (e.g. `XY`) or a `countryCallingCode` instead (e.g. `351`).
  if (!countryCode) {
    countryCode = phoneUtil.getRegionCodesForCountryCode(countryOrCallingCode);
  }

  if (!countryCode.length || countryCode.length === 1 && countryCode[0] === _googleLibphonenumber.PhoneNumberUtil.REGION_CODE_FOR_NON_GEO_ENTITY || countryCode.length > 1 && expressions.plusSign.test(phone)) {
    log.debug(`Unable to parse country or calling code ${countryOrCallingCode} so falling back to extraction from phone ${phone}`);

    if (expressions.plusSign.test(phone)) {
      try {
        const parsed = phoneUtil.parse(phone);
        const result = { countryCallingCode: parsed.getCountryCode(), phone: phoneUtil.format(parsed, _googleLibphonenumber.PhoneNumberFormat.E164).replace(`+${parsed.getCountryCode()}`, '') };

        log.debug(result, `Parsed phone (${countryOrCallingCode}) ${phone} as +${result.countryCallingCode}${result.phone}`);

        return result;
      } catch (e) {
        const result = { countryCallingCode: countryOrCallingCode, phone: phone };

        log.debug(result, `Unable to parse phone (${countryOrCallingCode}) ${phone}`);

        return result;
      }
    }

    if (!expressions.numeric.test(countryOrCallingCode)) {
      const result = { countryCallingCode: countryOrCallingCode, phone: phone };

      log.debug(result, `Unable to parse ${phone} due to unsupported country code ${countryOrCallingCode}`);

      // No country codes available for the country calling code given, so return
      // whatever we can from the original request.
      return result;
    }

    // At this point, `countryOrCallingCode` is likely a badly formatted country calling code which may have an area code included.
    // This is common for NANPA countries such as Dominican Republic where users tend to consider the area code (708) as part of the
    // country calling code (1), resulting on an unexpected 1708 country calling code.
    const parsed = phoneUtil.parse(`+${countryOrCallingCode}${phone}`);
    const result = { countryCallingCode: parsed.getCountryCode(), phone: phoneUtil.format(parsed, _googleLibphonenumber.PhoneNumberFormat.E164).replace(`+${parsed.getCountryCode()}`, '') };

    log.debug(result, `Parsed phone (${countryOrCallingCode}) ${phone} as +${result.countryCallingCode}${result.phone} so country calling code likely includes an area code`);

    return result;
  }

  if (Array.isArray(countryCode)) {
    if (countryCode.length === 1) {
      log.debug({ countryCode: countryCode[0] }, `Matched ${countryOrCallingCode} to ${countryCode[0]}`);
    } else {
      log.debug({ countryCodes: countryCode }, `Matched ${countryOrCallingCode} to multiple countries so choosing ${countryCode[0]}`);
    }

    // `countryOrCallingCode` is for sure a `countryCallingCode` and may have been assigned to multiple
    // countries (e.g. `44`, which is used in "GB", "GG", "IM" and "JE"). If this is observed, ignore
    // the returned list of possible country codes to avoid applying incorrect phone validation rules.
    countryCallingCode = Number(countryOrCallingCode);
    var _countryCode = countryCode;

    var _countryCode2 = _slicedToArray(_countryCode, 1);

    countryCode = _countryCode2[0];
  }

  const result = { countryCallingCode: countryCallingCode, phone: phoneUtil.format(phoneUtil.parse(phone, countryCode), _googleLibphonenumber.PhoneNumberFormat.E164).replace(`+${countryCallingCode}`, '') };

  log.debug(_extends({ countryCode: countryCode }, result), `Parsed phone (${countryCallingCode}) ${phone} as (${countryCode}) +${countryCallingCode}${result.phone}`);

  return result;
}
module.exports = exports.default;