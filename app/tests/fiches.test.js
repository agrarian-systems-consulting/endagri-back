const request = require('supertest');
const assert = require('assert');
const app = require('../../server');

test('Doit retourner toutes les fiches techniques', (done) => {
  request(app)
    .get('/fiches')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      // console.log('response.body =', res.body);
      if (err) return done(err);
      expect(
        res.body.length,
        'Il y au moins 4 fiches techniques dans la base de données'
      ).toBeGreaterThan(3);
      done();
    });
});

test("Doit retourner toutes les fiches techniques d'un seul auteur", (done) => {
  request(app)
    .get('/fiches/?id_utilisateur=1')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if (err) return done(err);

      // console.log('response.body =', res.body);
      expect(
        res.body.length,
        'Il y au moins 3 fiches techniques dans la base de données pour cet utilisateur'
      ).toBe(3);
      done();
    });
});

test('Doit créer une fiche technique sans activités ni ventes', (done) => {
  request(app)
    .post('/fiche')
    .send({
      libelle_fiche: 'Pomme de terres en agriculture biologique',
      id_utilisateur: 45,
      id_production: 3,
      ini_debut: 1,
      ini_fin: 3,
    })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(201)
    .end(function (err, res) {
      if (err) return done(err);
      console.log('response.body =', res.body);
      done();
    });
});

// test('Doit créer une fiche technique sans activités ni ventes', (done) => {
//   request(app)
//     .post('/fiche')

//     .send({
//       libelle_fiche: 'Tomates hors-sol en agriculture biologique',
//       id_utilisateur: 62,
//       id_production: 5,
//       ini_debut: 3,
//       ini_fin: 5,
//     })
//     .set('Accept', 'application/json')
//     .expect('Content-Type', /json/)
//     .expect(201)
//     .end(function (err, res) {
//       if (err) return done(err);
//     });
// });

// test("Doit récupérer le contenu d'une fiche technique", () => {
//   request(app)
//     .get('/fiche/24')
//     .set('Accept', 'application/json')
//     .expect('Content-Type', /json/)
//     .expect(200)
//     .then((response) => {
//       expect(response.body.length).toBeGreaterThan(0);
//     });
// });
