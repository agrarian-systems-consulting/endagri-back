const request = require('supertest');
const assert = require('assert');
const app = require('../../server');

test('Doit retourner toutes les fiches techniques', () => {
  request(app)
    .get('/fiches')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .then((response) => {
      expect(
        response.body.length,
        'Il y au moins 4 fiches techniques dans la base de données'
      ).toBeGreaterThan(3);
    });
});

test("Doit retourner les fiches techniques d'un seul utilisateur", () => {
  request(app)
    .get('/fiches/?id_utilisateur=1')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .then((response) => {
      expect(
        response.body.length,
        "L'auteur 1 doit avoir 3 fiches techniques"
      ).toBe(3);
    });
});

test('Doit créer une fiche technique sans activités ni ventes', (done) => {
  request(app)
    .post('/fiche')

    .send({
      libelle_fiche: 'Tomates hors-sol en agriculture biologique',
      id_utilisateur: 62,
      id_production: 5,
      ini_debut: 3,
      ini_fin: 5,
    })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(201)
    .then((response) => done());
});
