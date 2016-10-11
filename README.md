# Drupal Hash

This is a port of the [Drupal 7 password hashing algorithms](https://github.com/drupal/drupal/blob/7.x/includes/password.inc) developed by [WeGoLook](https://www.wegolook.com).

For Node 6 support, use version 1.0.3 or higher.

## Usage

### Check existing password

```javascript
var drupalHash = require('drupal-hash');

var clearPassword = 'superpassword';
var passwordHash = '$S$DODRFsy.GX2iSkl2zJ4fsrGRt2S0FOWu0JSA3BqAmSayESbcY3w9';
var isValid = drupalHash.checkPassword(clearPassword, passwordHash);
// returns true or false
```

### Hash new password

```javascript
var drupalHash = require('drupal-hash');

var newPassword = 'superpassword';
var passwordHash = drupalHash.hashPassword(newPassword);
// returns something like '$S$DODRFsy.GX2iSkl2zJ4fsrGRt2S0FOWu0JSA3BqAmSayESbcY3w9'
```

### Check if an old password needs updated

```javascript
var drupalHash = require('drupal-hash');

var passwordHash = '$P$DxTIL/YfZCdJtFYNh1Ef9ERbMBkuQ91';
var needsHash = drupalHash.needsNewHash(passwordHash);
// return true or false
```

## Testing

```sh
npm install
npm test
```
