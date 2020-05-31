const request = require('supertest');
const assert = require('assert');
const app = require('../../server');
const dbConn = require('../db/pool');

// Créé une fiche à supprimer dans un test
beforeAll((done) => {
  const postFicheQuery =
    'INSERT INTO fiche.fiche_technique(id, id_utilisateur, libelle, id_production, ini_debut, ini_fin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';

  dbConn.pool
    .query(postFicheQuery, [999, 65, 'Carottes en sol argileux', 65, 2, 6])
    .then(() => done());
});

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

test("Doit retourner le contenu d'une fiche technique", (done) => {
  request(app)
    .get('/fiche/1')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      // console.log('response.body =', res.body);
      if (err) return done(err);

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
      // console.log('res.body =', res.body);
      expect(res.body.id).toBeDefined();
      done();
    });
});

test('Doit créer une fiche technique avec des ventes, des activités et des dépenses associées', (done) => {
  request(app)
    .post('/fiche')
    .send({
      libelle_fiche: 'Bananes en agriculture biologique',
      id_utilisateur: 86,
      id_production: 17,
      ini_debut: null,
      ini_fin: null,
      ventes: [
        {
          id_marche: 24,
          rendement_min: 400,
          rendement: 500,
          rendement_max: 600,
          mois_relatif: 5,
        },
        {
          id_marche: 24,
          rendement_min: 250,
          rendement: 360,
          rendement_max: 470,
          mois_relatif: 6,
        },
      ],
      activites: [
        {
          libelle_activite: 'Labour',
          mois_relatif: -1,
          depenses: [
            {
              libelle_depense: 'Tracteur',
              montant: 1500,
            },
            {
              libelle_depense: "Main d'oeuvre",
              montant: 500,
            },
          ],
        },
        {
          libelle_activite: 'Semis',
          mois_relatif: 0,
          depenses: [
            {
              libelle_depense: 'Tracteur',
              montant: 500,
            },
            {
              libelle_depense: "Main d'oeuvre",
              montant: 500,
            },
          ],
        },
        {
          libelle_activite: 'Récolte',
          mois_relatif: 5,
          depenses: [
            {
              libelle_depense: "Main d'oeuvre",
              montant: 200,
            },
          ],
        },
      ],
    })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(201)
    .end(function (err, res) {
      if (err) return done(err);
      // console.log('res.body =', res.body);
      expect(res.body.id).toBeDefined();

      done();
    });
});

//TODO :
//@Asc Tester les suppressions en cascade
test('Doit supprimer une fiche technique', (done) => {
  request(app)
    .delete('/fiche/999')
    .expect(204)
    .end(function (err, res) {
      if (err) return done(err);
      done();
    });
});
