const request = require('supertest');
const assert = require('assert');
const app = require('../../server');
const dbConn = require('../db/pool');

test("Doit supprimer une activité d'une fiche techniques", (done) => {
  request(app)
    .delete('/fiche/8888/activite/7777')
    .expect(204)
    .end(function (err, res) {
      if (err) return done(err);
      done();
    });
});

beforeAll((done) => {
  // Créé une fiche et une activité attachée pour le test
  const postFicheQuery =
    'INSERT INTO fiche.fiche_technique(id, id_utilisateur, libelle, id_production, ini_debut, ini_fin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';

  dbConn.pool.query(
    postFicheQuery,
    [8888, 65, 'Fiche de test', 65, 2, 6],
    (err, res) => {
      if (err) return done(err);
      const postActiviteQuery =
        'INSERT INTO fiche.activite(id, id_fiche_technique, mois_relatif, mois, libelle) VALUES ($1, $2, $3, $4, $5) RETURNING id';
      dbConn.pool.query(
        postActiviteQuery,
        [7777, 8888, 4, 5, 'Activite de test'],
        (err, res) => {
          if (err) return done(err);

          done();
        }
      );
    }
  );
});

afterAll((done) => {
  // Supprime la fiche technique créée pour le test
  const deleteFicheByIdQuery = 'DELETE FROM fiche.fiche_technique WHERE id=$1';
  dbConn.pool.query(deleteFicheByIdQuery, [8888], (error, results) => {
    if (error) {
      throw error;
    }
    done();
  });
});
