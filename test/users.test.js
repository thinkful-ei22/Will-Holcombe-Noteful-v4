'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const {User} = require('../models/user');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Noteful API - Users', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const fullName = 'Example User';

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return User.createIndexes();
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });
  
  describe('/api/users', function () {
    describe('POST', function () {
      it('Should create a new user', function () {
        const testUser = { username, password, fullName };
        

        let res;
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(_res => {
            res = _res;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('id', 'username', 'fullName');

            expect(res.body.id).to.exist;
            expect(res.body.username).to.equal(testUser.username);
            expect(res.body.fullName).to.equal(testUser.fullName);

            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.exist;
            expect(user.id).to.equal(res.body.id);
            expect(user.fullName).to.equal(testUser.fullName);
            return user.validatePassword(password);
          })
          .then(isValid => {
            expect(isValid).to.be.true;
          });
      });
      it('Should reject users with missing username', function () {
        const testUser = { password, fullName };
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
          
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Missing \'username\' in request body');
        

          });
      });

      /**
       * COMPLETE ALL THE FOLLOWING TESTS
       */
      it('Should reject users with missing password', function () {
        const testUser = { fullName, username };
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
          
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Missing \'password\' in request body');
        

          });
      });


      it('Should reject users with non-string username', function () {
        const testUser = { password, fullName, username: 5 };
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'username\' must be type String'
            );
          });
      });
      it('Should reject users with non-string password', function() {
        const testUser = { username, fullName, password: 88};
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'password\' must be type String');
          });
      });
      it('Should reject users with non-trimmed username', function() {
        const testUser = { username: 'crocodil ', fullName, password};
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'username\' cannot start or end with whitespace');
          });
      });
      it('Should reject users with non-trimmed password', function() {
        const testUser = { username, fullName, password: ' camelot'};
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'password\' cannot start or end with whitespace');
          });
      });
      it('Should reject users with empty username', function() {
        const testUser = { username: ' ', fullName, password};
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'username\' cannot start or end with whitespace');
          });
      });
      it('Should reject users with password less than 8 characters',function() {
        const testUser = { username, fullName, password: 'amsterd'};
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'password\' must be at least 8 characters long');
          });
      });
      it('Should reject users with password greater than 72 characters', function() {
        const testUser = { username, fullName, password: 'seifbojuhjlampbrboyxfvertfxhtdykbmoaqjfvhncpgdvrptxtxuasxxkllrqdjuhbcvgre'};
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'password\' must be at most 72 characters long');
          });
      });
      it('Should reject users with duplicate username', function () {
        return User
          .create({
            username,
            password,
            fullName
          })
          .then(() => {
            return chai
              .request(app)
              .post('/api/users')
              .send({ username, password, fullName });
          })

          .then(res => {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('The username already exists');
          });
      });
      it('Should trim fullname', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({ username, password, fullName: ` ${fullName} ` })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('id', 'username', 'fullName');
            expect(res.body.fullName).to.equal(fullName);
            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.fullName).to.equal(fullName);
          });
      });
    });
  });
});