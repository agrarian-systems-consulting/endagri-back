"use strict";

var _supertest = _interopRequireDefault(require("supertest"));

var _server = _interopRequireDefault(require("../../server"));

var _pool = _interopRequireDefault(require("../db/pool"));

require("regenerator-runtime/runtime");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const id_analyse = 346742;
const id_depense_libre = 234565;
test("Doit récupérer les dépenses libres d'une analyse existante", async () => {
  const res = await (0, _supertest.default)(_server.default).get(`/analyse/${id_analyse}/depenses_libres`).expect(200);
  expect(res.body[0].id).toBeDefined();
  expect(res.body[0].libelle).toBeDefined();
  expect(res.body[0].mois_reel).toBeDefined();
  expect(res.body[0].montant).toBeDefined();
});
test('Doit créer une dépense libre dans une analyse existante', async () => {
  const res = await (0, _supertest.default)(_server.default).post(`/analyse/${id_analyse}/depense_libre`).send({
    id: 7,
    libelle: 'Ma dépense de test',
    mois_reel: '2020-05-06',
    montant: 1234
  }).expect(200);
  expect(res.body.id).toBeDefined();
  expect(res.body.id_analyse).toBe(id_analyse);
  expect(res.body.libelle).toBe('Ma dépense de test');
  expect(res.body.mois_reel).toBeDefined();
  expect(res.body.montant).toBe(1234);
});
test("Doit récupérer une dépense libre d'une analyse existante", async () => {
  const res = await (0, _supertest.default)(_server.default).get(`/analyse/${id_analyse}/depense_libre/${id_depense_libre}`).expect(200);
  expect(res.body.id).toBe(id_depense_libre);
  expect(res.body.id_analyse).toBe(id_analyse);
  expect(res.body.libelle).toBe('Dépense libre de test');
  expect(res.body.mois_reel).toBeDefined();
  expect(res.body.montant).toBe(2000);
});
beforeAll(done => {
  _pool.default.pool.query(`INSERT INTO analyse_fiche.analyse(
          id,
          nom_utilisateur,
          nom_client,
          montant_tresorerie_initiale,
          date_debut_analyse,
          date_fin_analyse) 
          VALUES ($1, $2, $3, $4, $5,$6)`, [id_analyse, 'Auteur de test Dépense libre', 'Client de test Dépense libre', 3480, '2020-05-05', '2021-05-05'], (err, res) => {
    if (err) {
      throw done(err);
    }

    _pool.default.pool.query(`INSERT INTO analyse_fiche.depense_libre(id, id_analyse, libelle, mois_reel, montant) 
                VALUES ($1, $2, $3, $4, $5)`, [id_depense_libre, id_analyse, 'Dépense libre de test', '2020-07-10', 2000], (err, res) => {
      if (err) {
        throw done(err);
      }

      done();
    });
  });
});
afterAll(done => {
  _pool.default.pool.query(`DELETE FROM analyse_fiche.depense_libre WHERE id=$1`, [id_depense_libre]).then(() => {
    _pool.default.pool.query(`DELETE FROM analyse_fiche.analyse WHERE id=$1`, [id_analyse]).then(() => {
      done();
    });
  });
});