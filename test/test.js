const { expect } = require('chai');
const { describe, it } = require('mocha');
const drupalHash = require('../');

describe('Given a good password', function () {
  const password = 'derpalicious';
  const hashedPassword =
    '$S$D8kwCLZGWoVb9CflvNZFX797Jrhf7RfIrBYmW3tHlYCQ7D.l7mLb';

  describe('When the password is checked', function () {
    const result = drupalHash.checkPassword(password, hashedPassword);

    it('Then the result should be true', function () {
      expect(result).to.be.true;
    });
  });

  describe('When the hashed password is checked for needing an update', function () {
    const result = drupalHash.needsNewHash(hashedPassword);

    it('Then the result should be false', function () {
      expect(result).to.be.false;
    });
  });
});

describe('Given a bad password', function () {
  const password = 'derpaliciousness';
  const hashedPassword =
    '$S$D8kwCLZGWoVb9CflvNZFX797Jrhf7RfIrBYmW3tHlYCQ7D.l7mLb';

  describe('When the password is checked', function () {
    const result = drupalHash.checkPassword(password, hashedPassword);

    it('Then the result should be false', function () {
      expect(result).to.be.false;
    });
  });
});

describe('Given a cleartext password', function () {
  const password = 'derpalicious';

  describe('When the password is hashed', function () {
    const result = drupalHash.hashPassword(password);

    it('Then the result should correctly check', function () {
      const check = drupalHash.checkPassword(password, result);
      expect(check).to.be.true;
    });
  });
});

describe('Given a password hashed with MD5', function () {
  const password = 'derpalicious';
  const passwordHash = '$P$DxTIL/YfZCdJtFYNh1Ef9ERbMBkuQ91';

  describe('When the correct password is checked', function () {
    const result = drupalHash.checkPassword(password, passwordHash);

    it('Then the result should be true', function () {
      expect(result).to.be.true;
    });
  });

  describe('When an incorrect password is checked', function () {
    const result = drupalHash.checkPassword('badpass', passwordHash);

    it('Then the result should be false', function () {
      expect(result).to.be.false;
    });
  });

  describe('When the hashed password is checked for needing an update', function () {
    const result = drupalHash.needsNewHash(passwordHash);

    it('Then the result should be true', function () {
      expect(result).to.be.true;
    });
  });

  describe('When the password hash is longer than the calculated hash', function () {
    const longPasswordHash = passwordHash + 'abcd';
    const result = drupalHash.checkPassword(password, longPasswordHash);

    it('Then the result should be false', function () {
      expect(result).to.be.false;
    });
  });

  describe('When the password hash is shorter than the calculated hash', function () {
    const shortPasswordHash = passwordHash.substring(
      0,
      passwordHash.length - 3,
    );
    const result = drupalHash.checkPassword(password, shortPasswordHash);

    it('Then the result should be false', function () {
      expect(result).to.be.false;
    });
  });
});
