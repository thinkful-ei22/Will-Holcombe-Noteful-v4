// 'use strict';

// const chai = require('chai');
// const chaiHttp = require('chai-http');
// const jwt = require('jsonwebtoken');

// const { app, runServer, closeServer } = require('../server');
// const { User } = require('../models/user');
// const { JWT_SECRET, TEST_MONGODB_URI } = require('../config');

// const expect = chai.expect;

// // This let's us make HTTP requests
// // in our tests.
// // see: https://github.com/chaijs/chai-http
// chai.use(chaiHttp);

// describe('Auth endpoints', function () {
//   const username = 'exampleUser';
//   const password = 'examplePass';
//   const fullName = 'examplebossman'

//   before(function () {
//     return runServer(TEST_MONGODB_URI);
//   });

//   after(function () {
//     return closeServer();
//   });

//   beforeEach(function () {
//     return User.hashPassword(password).then(password =>
//       User.create({
//         username,
//         password,
//       fullName
//       })
//     );
//   });

//   afterEach(function () {
//     return User.remove({});
//   });

//   describe('/api/login', function () {
//     it('Should reject requests with no credentials', function () {
//       return chai
//         .request(app)
//         .post('/api/login')
//         .then(() =>
//           expect.fail(null, null, 'Request should not succeed')
//         )
//         .catch(err => {
//           if (err instanceof chai.AssertionError) {
//             throw err;
//           }

//           const res = err.response;
//           expect(res).to.have.status(400);
//         });
//     });
//     it('Should reject requests with incorrect usernames', function () {
//       return chai
//         .request(app)
//         .post('/api/login')
//         .send({ username: 'wrongUsername', password })
//         .then(() =>
//           expect.fail(null, null, 'Request should not succeed')
//         )
//         .catch(err => {
//           if (err instanceof chai.AssertionError) {
//             throw err;
//           }

//           const res = err.response;
//           expect(res).to.have.status(401);
//         });
//     });
//     it('Should reject requests with incorrect passwords', function () {
//       return chai
//         .request(app)
//         .post('/api/login')
//         .send({ username, password: 'wrongPassword' })
//         .then(() =>
//           expect.fail(null, null, 'Request should not succeed')
//         )
//         .catch(err => {
//           if (err instanceof chai.AssertionError) {
//             throw err;
//           }

//           const res = err.response;
//           expect(res).to.have.status(401);
//         });
//     });
//     it('Should return a valid auth token', function () {
//       return chai
//         .request(app)
//         .post('/api/login')
//         .send({ username, password })
//         .then(res => {
//           expect(res).to.have.status(200);
//           expect(res.body).to.be.an('object');
//           const token = res.body.authToken;
//           expect(token).to.be.a('string');
//           const payload = jwt.verify(token, JWT_SECRET, {
//             algorithm: ['HS256']
//           });
//           expect(payload.user).to.deep.equal({
//             username,
//             fullName
//           });
//         });
//     });
//   });

//   describe('/api/refresh', function () {
//     it('Should reject requests with no credentials', function () {
//       return chai
//         .request(app)
//         .post('/api/refresh')
//         .then(() =>
//           expect.fail(null, null, 'Request should not succeed')
//         )
//         .catch(err => {
//           if (err instanceof chai.AssertionError) {
//             throw err;
//           }

//           const res = err.response;
//           expect(res).to.have.status(401);
//         });
//     });
//     it('Should reject requests with an invalid token', function () {
//       const token = jwt.sign(
//         {
//           username,
//           fullName
//         },
//         'wrongSecret',
//         {
//           algorithm: 'HS256',
//           expiresIn: '7d'
//         }
//       );

//       return chai
//         .request(app)
//         .post('/api/refresh')
//         .set('Authorization', `Bearer ${token}`)
//         .then(() =>
//           expect.fail(null, null, 'Request should not succeed')
//         )
//         .catch(err => {
//           if (err instanceof chai.AssertionError) {
//             throw err;
//           }

//           const res = err.response;
//           expect(res).to.have.status(401);
//         });
//     });
//     it('Should reject requests with an expired token', function () {
//       const token = jwt.sign(
//         {
//           user: {
//             username,
//            fullName
//           },
//         },
//         JWT_SECRET,
//         {
//           algorithm: 'HS256',
//           subject: username,
//           expiresIn: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
//         }
//       );

//       return chai
//         .request(app)
//         .post('/api/login/refresh')
//         .set('authorization', `Bearer ${token}`)
//         .then(() =>
//           expect.fail(null, null, 'Request should not succeed')
//         )
//         .catch(err => {
//           if (err instanceof chai.AssertionError) {
//             throw err;
//           }

//           const res = err.response;
//           expect(res).to.have.status(401);
//         });
//     });
//     it('Should return a valid auth token with a newer expiry date', function () {
//       const token = jwt.sign(
//         {
//           user: {
//             username,
//            fullName
//           }
//         },
//         JWT_SECRET,
//         {
//           algorithm: 'HS256',
//           subject: username,
//           expiresIn: '7d'
//         }
//       );
//       const decoded = jwt.decode(token);

//       return chai
//         .request(app)
//         .post('/api/login/refresh')
//         .set('authorization', `Bearer ${token}`)
//         .then(res => {
//           expect(res).to.have.status(200);
//           expect(res.body).to.be.an('object');
//           const token = res.body.authToken;
//           expect(token).to.be.a('string');
//           const payload = jwt.verify(token, JWT_SECRET, {
//             algorithm: ['HS256']
//           });
//           expect(payload.user).to.deep.equal({
//             username,
//             fullName
//           });
//           expect(payload.exp).to.be.at.least(decoded.exp);
//         });
//     });
//   });
// });