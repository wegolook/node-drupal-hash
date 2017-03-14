var expect = require('chai').expect;
var drupalHash = require('../');

describe('Given a good password', function() {
  var password = 'derpalicious';
  var hashedPassword = '$S$D8kwCLZGWoVb9CflvNZFX797Jrhf7RfIrBYmW3tHlYCQ7D.l7mLb';

  describe('When the password is checked', function() {
    var result = drupalHash.checkPassword(password, hashedPassword);

    it('Then the result should be true', function() {
      expect(result).to.be.true;
    });
  });

  describe('When the hashed password is checked for needing an update', function() {
    var result = drupalHash.needsNewHash(hashedPassword);

    it('Then the result should be false', function() {
      expect(result).to.be.false;
    });
  });
});

describe('Given a bad password', function() {
  var password = 'derpaliciousness';
  var hashedPassword = '$S$D8kwCLZGWoVb9CflvNZFX797Jrhf7RfIrBYmW3tHlYCQ7D.l7mLb';

  describe('When the password is checked', function() {
    var result = drupalHash.checkPassword(password, hashedPassword);

    it('Then the result should be false', function() {
      expect(result).to.be.false;
    });
  });
});

describe('Given a cleartext password', function() {
  var password = 'derpalicious';

  describe('When the password is hashed', function() {
    var result = drupalHash.hashPassword(password);

    it('Then the result should correctly check', function() {
      var check = drupalHash.checkPassword(password, result);
      expect(check).to.be.true;
    });
  });
});

describe('Given a password hashed with MD5', function() {
  var password = 'derpalicious';
  var passwordHash = '$P$DxTIL/YfZCdJtFYNh1Ef9ERbMBkuQ91';

  describe('When the correct password is checked', function() {
    var result = drupalHash.checkPassword(password, passwordHash);

    it('Then the result should be true', function() {
      expect(result).to.be.true;
    });
  });

  describe('When an incorrect password is checked', function() {
    var result = drupalHash.checkPassword('badpass', passwordHash);

    it('Then the result should be false', function() {
      expect(result).to.be.false;
    });
  });

  describe('When the hashed password is checked for needing an update', function() {
    var result = drupalHash.needsNewHash(passwordHash);

    it('Then the result should be true', function() {
      expect(result).to.be.true;
    });
  });

  describe('When the password hash is longer than the calculated hash', function() {
    var longPasswordHash = passwordHash + 'abcd';
    var result = drupalHash.checkPassword(password, longPasswordHash);

    it('Then the result should be false', function() {
      expect(result).to.be.false;
    });
  });

  describe('When the password hash is shorter than the calculated hash', function() {
    var shortPasswordHash = passwordHash.substr(0, passwordHash.length - 3);
    var result = drupalHash.checkPassword(password, shortPasswordHash);

    it('Then the result should be false', function() {
      expect(result).to.be.false;
    });
  });
});

