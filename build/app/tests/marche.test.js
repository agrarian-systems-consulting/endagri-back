"use strict";

var _supertest = _interopRequireDefault(require("supertest"));

var _server = _interopRequireDefault(require("../../server"));

var _pool = _interopRequireDefault(require("../db/pool"));

require("regenerator-runtime/runtime");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const id_production = 18;
const id_marche = 4574;
const id_produit = 14;
test('Doit récupérer la liste de tous les marchés', async () => {
  const res = await (0, _supertest.default)(_server.default).get(`/marches`).expect(200);
  expect(res.body[0].id).toBeDefined();
  expect(res.body[0].id_produit).toBeDefined();
  expect(res.body[0].id_production).toBeDefined();
  expect(res.body[0].libelle_produit).toBeDefined();
  expect(res.body[0].libelle_production).toBeDefined();
  expect(res.body[0].unite).toBeDefined();
});
test('Doit récupérer la liste de tous les marchés pour une production définie', async () => {
  const res = await (0, _supertest.default)(_server.default).get(`/marches?id_production=${id_production}`).expect(200);
  expect(res.body[0].id).toBeDefined();
  expect(res.body[0].id_produit).toBeDefined();
  expect(res.body[0].id_production).toBe(id_production.toString());
  expect(res.body[0].libelle_produit).toBeDefined();
  expect(res.body[0].libelle_production).toBeDefined();
  expect(res.body[0].unite).toBeDefined();
});
test('Doit créer un nouveau marché', async () => {
  const res = await (0, _supertest.default)(_server.default).post(`/marche`).send({
    id_produit: id_produit,
    localisation: 'Bizerte',
    type_marche: 'Vente au champs',
    prix_january: 10,
    prix_february: 10,
    prix_march: 20,
    prix_april: 30,
    prix_may: 40,
    prix_june: 50,
    prix_july: 60,
    prix_august: 40,
    prix_september: 20,
    prix_october: 10,
    prix_november: 10,
    prix_december: 10,
    commentaire: 'Sans commentaire ;)'
  }).expect(201);
  expect(res.body.id).toBeDefined();
  expect(res.body.id_produit).toBe(id_produit);
  expect(res.body.prix_july).toBe(60);
});
test("Doit récupérer les données d'un marché existant", async () => {
  const res = await (0, _supertest.default)(_server.default).get(`/marche/${id_marche}`).expect(200);
  expect(res.body.id).toBeDefined();
  expect(res.body.id_produit).toBe(id_produit);
  expect(res.body.prix_july).toBe(364);
});
test('Doit modifier un marché existant', async () => {
  const res = await (0, _supertest.default)(_server.default).put(`/marche/${id_marche}`).send({
    localisation: 'Beja',
    type_marche: 'Vente au champs',
    prix_january: 10,
    prix_february: 10,
    prix_march: 20,
    prix_april: 30,
    prix_may: 40,
    prix_june: 50,
    prix_july: 80,
    prix_august: 40,
    prix_september: 20,
    prix_october: 10,
    prix_november: 10,
    prix_december: 10,
    commentaire: 'Commentaire modifié'
  }).expect(200);
  expect(res.body.id).toBeDefined();
  expect(res.body.id_produit).toBe(id_produit);
  expect(res.body.prix_july).toBe(80);
  expect(res.body.commentaire).toBe('Commentaire modifié');
});
test('Doit supprimer un marché existant', async () => {
  const res = await (0, _supertest.default)(_server.default).delete(`/marche/${id_marche}`).expect(200);
  expect(res.body.id).toBeDefined();
});
test("Doit renvoyer un 404 lors de la suppression d'un marché inexistant", async () => {
  const res = await (0, _supertest.default)(_server.default).delete(`/marche/3456893`).expect(404);
});
beforeAll(done => {
  const postMarcheQuery = `INSERT INTO fiche.marche(id,id_produit, localisation, type_marche, prix_january, prix_february, prix_march, prix_april, prix_may, prix_june, prix_july, prix_august, prix_september, prix_october, prix_november, prix_december,commentaire) 
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`;

  _pool.default.pool.query(postMarcheQuery, [id_marche, id_produit, 'Bizerte', 'Vente au champs', 100, 234, 5367, 234, 345, 654, 364, 835, 756, 856, 876, 346, 'Commentaire de test']).then(() => done());
});
afterAll(done => {
  const deleteMarcheQuery = `DELETE FROM fiche.marche WHERE id=$1`;

  _pool.default.pool.query(deleteMarcheQuery, [id_marche]).then(() => done());
});