"use strict";

var _supertest = _interopRequireDefault(require("supertest"));

var _server = _interopRequireDefault(require("../../server"));

var _pool = _interopRequireDefault(require("../db/pool"));

require("regenerator-runtime/runtime");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const id_fiche_technique = 2;
const id_vente = 345564;
const ventes = [{
  id: 3468020,
  id_marche: 3,
  rendement_min: 10,
  rendement: 15,
  rendement_max: 20,
  mois_relatif: null,
  mois: 8
}, {
  id: 3468021,
  id_marche: 3,
  rendement_min: 12,
  rendement: 16,
  rendement_max: 22,
  mois_relatif: null,
  mois: 9
}];
test('Doit ajouter une vente à une fiche technique existante', async () => {
  const res = await (0, _supertest.default)(_server.default).post(`/fiche/${id_fiche_technique}/vente`).send({
    id_marche: 3,
    rendement_min: 10,
    rendement: 15,
    rendement_max: 20,
    mois_relatif: null,
    mois: 8
  }).expect(201);
  expect(res.body.id).toBeDefined();
  expect(res.body.id_marche).toBe('3');
  expect(res.body.rendement_min).toBe(10);
  expect(res.body.mois_relatif).toBe(null);
});
test('Doit modifier une vente existante', async () => {
  const res = await (0, _supertest.default)(_server.default).put(`/fiche/${id_fiche_technique}/vente/${id_vente}`).send({
    id_marche: 3,
    rendement_min: 10,
    rendement: 15,
    rendement_max: 20,
    mois_relatif: null,
    mois: 8
  }).expect(200);
  expect(res.body.id).toBeDefined();
  expect(res.body.id_marche).toBe('3');
  expect(res.body.rendement_min).toBe(10);
  expect(res.body.mois_relatif).toBe(null);
});
test('Doit supprimer une vente', async () => {
  const res = await (0, _supertest.default)(_server.default).delete(`/fiche/${id_fiche_technique}/vente/${id_vente}`).expect(204);
});
test("Doit renvoyer 404 lors de la suppression d'une vente inexistante", async () => {
  const res = await (0, _supertest.default)(_server.default).delete(`/fiche/${id_fiche_technique}/vente/567098356`).expect(404);
});
beforeAll(done => {
  _pool.default.pool.query(`INSERT INTO fiche.vente(id, id_fiche_technique, id_marche, mois, mois_relatif, rendement_min, rendement, rendement_max) 
      VALUES ($1, $2, $3, $4, $5, $6, $7,$8) RETURNING *`, [id_vente, id_fiche_technique, 3, null, 6, 50, 60, 70], (err, res) => {
    if (err) {
      throw done(err);
    }

    done();
  });
});
afterAll(done => {
  _pool.default.pool.query(`DELETE FROM fiche.vente WHERE id=$1`, [id_vente]).then(() => {
    done();
  });
});