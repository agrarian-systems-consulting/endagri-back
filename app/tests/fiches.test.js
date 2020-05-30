const request = require('supertest');
const assert = require('assert');
const app = require('../../server');

test('Doit retourner toutes les fiches techniques', async () => {
  await request(app)
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

test("Doit retourner les fiches techniques d'un seul utilisateur", async () => {
  await request(app)
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

test('Doit créer une fiche technique sans activités ni ventes', async () => {
  const response = await request(app)
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
    .expect(201);

  console.log(response);
});

// test('Doit créer une fiche technique avec des activités', async () => {
//   await request(app)
//     .post('/fiche')
//     .send({
//       libelle_fiche: 'Tomates hors-sol en agriculture biologique',
//       id_utilisateur: 62,
//       id_production: 5,
//       ini_debut: 3,
//       ini_fin: 5,
//       activites: [
//         {
//           libelle_activite: 'Labour',
//           mois_relatif: -1,
//         },
//         {
//           libelle_activite: 'Semis',
//           mois_relatif: 0,
//         },
//         {
//           libelle_activite: 'Récolte',
//           mois_relatif: 5,
//         },
//       ],
//     })
//     .set('Accept', 'application/json')
//     .expect('Content-Type', /json/)
//     .expect(201)
//     .then((response) => {
//       //TODO : Tester le retour  d'un integer = id nouvelle fiche technique
//       done();
//     });
// });
