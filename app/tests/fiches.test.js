const request = require('supertest');
const assert = require('assert');
const app = require('../../server');

test('Doit retourner toutes les fiches techniques', async () => {
  await request(app)
    .get('/fiches')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200);
});

test("Doit retourner les fiches techniques d'un auteur", async () => {
  await request(app)
    .get('/fiches/?id_utilisateur=1')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .then((response) => {
      expect(
        response.body.length,
        "L'auteur 1 doit avoir 4 fiches techniques"
      ).toBe(4);
    });
});
