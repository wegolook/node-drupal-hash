var crypto = require('crypto');

var HASH_COUNT = 15;
var MIN_HASH_COUNT = 7;
var MAX_HASH_COUNT = 30;
var HASH_LENGTH = 55;

function hash(algo, password) {
  return crypto.createHash(algo).update(password).digest();
}

function _password_itoa64() {
  return './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
}

function ord(str) {
  if (typeof str === 'number') {
    return str;
  }
  return str.charCodeAt(0);
}

function _password_base64_encode(input, count) {
  var output = '';
  var i = 0;
  var itoa64 = _password_itoa64();
  var value;
  do {
    value = ord(input[i++]);
    output += itoa64[value & 0x3f];
    if (i < count) {
      value |= ord(input[i]) << 8;
    }
    output += itoa64[(value >> 6) & 0x3f];
    if (i++ >= count) {
      break;
    }
    if (i < count) {
      value |= ord(input[i]) << 16;
    }
    output += itoa64[(value >> 12) & 0x3f];
    if (i++ >= count) {
      break;
    }
    output += itoa64[(value >> 18) & 0x3f];
  } while (i < count);

  return output;
}

function _password_generate_salt(count_log2) {
  var output = '$S$';
  // Ensure that count_log2 is within set bounds.
  count_log2 = _password_enforce_log2_boundaries(count_log2);
  // We encode the final log2 iteration count in base 64.
  var itoa64 = _password_itoa64();
  output += itoa64[count_log2];
  // 6 bytes is the standard salt for a portable phpass hash.
  output += _password_base64_encode(crypto.randomBytes(6), 6);
  return output;
}

function _password_enforce_log2_boundaries(count_log2) {
  if (count_log2 < MIN_HASH_COUNT) {
    return MIN_HASH_COUNT;
  }
  else if (count_log2 > MAX_HASH_COUNT) {
    return MAX_HASH_COUNT;
  }

  return parseInt(count_log2);
}

function _password_crypt(algo, password, setting) {
  // The first 12 characters of an existing hash are its setting string.
  setting = setting.substr(0, 12);

  if (setting[0] != '$' || setting[2] != '$') {
    return false;
  }
  var count_log2 = _password_get_count_log2(setting);
  // Hashes may be imported from elsewhere, so we allow != HASH_COUNT
  if (count_log2 < MIN_HASH_COUNT || count_log2 > MAX_HASH_COUNT) {
    return false;
  }
  var salt = setting.substr(4, 8);
  // Hashes must have an 8 character salt.
  if (salt.length != 8) {
    return false;
  }

  // Convert the base 2 logarithm into an integer.
  var count = 1 << count_log2;

  password = new Buffer(password);
  salt = new Buffer(salt);

  // We rely on the hash() function being available in PHP 5.2+.
  var hashed = hash(algo, Buffer.concat([salt, password]));
  do {
    hashed = hash(algo, Buffer.concat([hashed, password]));
  } while (--count);

  var len = hashed.length;
  var output =  setting + _password_base64_encode(hashed, len);
  // _password_base64_encode() of a 16 byte MD5 will always be 22 characters.
  // _password_base64_encode() of a 64 byte sha512 will always be 86 characters.
  var expected = 12 + Math.ceil((8 * len) / 6);
  return (output.length == expected) ? output.substr(0, HASH_LENGTH) : false;
}

function _password_get_count_log2(setting) {
  var itoa64 = _password_itoa64();
  return itoa64.indexOf(setting[3]);
}

function user_hash_password(password, count_log2) {
  count_log2 = count_log2 || 0;
  if (!count_log2) {
    // Use the standard iteration count.
    count_log2 = HASH_COUNT;
  }
  var thing = _password_crypt('sha512', password, _password_generate_salt(count_log2));
  return thing;
}

function user_check_password(password, hashedPassword) {
  var stored_hash;
  if (hashedPassword.substr(0, 2) == 'U$') {
    // This may be an updated password from user_update_7000(). Such hashes
    // have 'U' added as the first character and need an extra md5().
    stored_hash = hashedPassword.substr(1);
    password = crypto.hash('md5').update(password).digest('hex');
  }
  else {
    stored_hash = hashedPassword;
  }

  var type = stored_hash.substr(0, 3);
  var hashed;
  switch (type) {
    case '$S$':
      // A normal Drupal 7 password using sha512.
      hashed = _password_crypt('sha512', password, stored_hash);
      break;
    case '$H$':
      // phpBB3 uses "$H$" for the same thing as "$P$".
    case '$P$':
      // A phpass password generated using md5.  This is an
      // imported password or from an earlier Drupal version.
      hashed = _password_crypt('md5', password, stored_hash);
      break;
    default:
      return false;
  }

  // Use a constant time comparison to prevent timing attacks.
  if (hashed) {
    var mismatch = hashed.length === stored_hash.length ? 0 : 1;
    for (var i = 0, l = hashed.length; i < l; ++i) {
      mismatch |= (hashed.charCodeAt(i) ^ stored_hash.charCodeAt(i));
    }
    return mismatch === 0;
  }
  else {
    return false;
  }
}

function user_needs_new_hash(hashedPassword) {
  // Check whether this was an updated password.
  if ((hashedPassword.substr(0, 3) != '$S$') || (hashedPassword.length != HASH_LENGTH)) {
    return true;
  }
  // Ensure that $count_log2 is within set bounds.
  var count_log2 = _password_enforce_log2_boundaries(HASH_COUNT);
  // Check whether the iteration count used differs from the standard number.
  return (_password_get_count_log2(hashedPassword) !== count_log2);
}

module.exports = {
  hashPassword: user_hash_password,
  checkPassword: user_check_password,
  needsNewHash: user_needs_new_hash
};
