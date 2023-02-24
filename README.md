[![npm](https://img.shields.io/npm/v/drupal-hash-v2)](https://www.npmjs.com/package/drupal-hash-v2)

# Drupal Hash v2

This is a port of the [Drupal 7 password hashing algorithms](https://github.com/drupal/drupal/blob/7.x/includes/password.inc)

## Usage

```sh
npm install drupal-hash-v2
```

```sh
yarn add drupal-hash-v2
```

### Check existing password

```javascript
const drupalHash = require('drupal-hash-v2');

const clearPassword = 'superpassword';
const passwordHash = '$S$DODRFsy.GX2iSkl2zJ4fsrGRt2S0FOWu0JSA3BqAmSayESbcY3w9';
const isValid = drupalHash.checkPassword(clearPassword, passwordHash);
// returns true or false
```

### Hash new password

```javascript
const drupalHash = require('drupal-hash-v2');

const newPassword = 'superpassword';
const passwordHash = drupalHash.hashPassword(newPassword);
// returns something like '$S$DODRFsy.GX2iSkl2zJ4fsrGRt2S0FOWu0JSA3BqAmSayESbcY3w9'
```

### Check if an old password needs updated

```javascript
const drupalHash = require('drupal-hash-v2');

const passwordHash = '$P$DxTIL/YfZCdJtFYNh1Ef9ERbMBkuQ91';
const needsHash = drupalHash.needsNewHash(passwordHash);
// return true or false
```

## Testing

```sh
yarn install
yarn test
```

## Credits

This package is an updated version of [drupal-hash](https://github.com/wegolook/node-drupal-hash) originally created by [wegolook](https://www.wegolook.com/)
