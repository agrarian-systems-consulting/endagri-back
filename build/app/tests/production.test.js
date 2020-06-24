"use strict";

var _supertest = _interopRequireDefault(require("supertest"));

var _server = _interopRequireDefault(require("../../server"));

var _pool = _interopRequireDefault(require("../db/pool"));

require("regenerator-runtime/runtime");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const id_production = 3680;
const produits = [{
  id_produit: 98455,
  libelle: 'Produit 1',
  unite: 'tonnes'
}, {
  id_produit: 98456,
  libelle: 'Produit 2',
  unite: 'tonnes'
}];
test('Doit récupérer la liste de toutes les productions', async () => {
  const res = await (0, _supertest.default)(_server.default).get(`/productions`).expect(200);
  expect(res.body[0].id).toBe(1);
  expect(res.body[0].libelle).toBe('Ail');
  expect(res.body[0].type_production).toBe('Culture annuelle');
});
test("Doit récupérer la liste de toutes les productions d'un seul type de production", async () => {
  const res = await (0, _supertest.default)(_server.default).get(`/productions?type_production=Culture%20annuelle`).expect(200);
  res.body.forEach(({
    type_production
  }) => {
    expect(type_production).toBe('Culture annuelle');
  });
});
test('Doit créer une nouvelle production avec des produits associés', async () => {
  const res = await (0, _supertest.default)(_server.default).post(`/production`).send({
    libelle_production: 'Un essai de production',
    type_production: 'Culture annuelle',
    produits: [{
      libelle_produit: 'Paille de chose',
      unite: 'tonne de matière sèche'
    }, {
      libelle_produit: 'Grains de chose',
      unite: 'quintal'
    }]
  }).expect(200);
  expect(res.body.id).toBeDefined();
  expect(res.body.produits).toBeDefined();
  expect(res.body.produits.length).toBe(2);
});
test('Doit créer une nouvelle production sans produits associés', async () => {
  const res = await (0, _supertest.default)(_server.default).post(`/production`).send({
    libelle_production: 'Un essai de production',
    type_production: 'Culture annuelle'
  }).expect(200);
  expect(res.body.id).toBeDefined();
  expect(res.body.produits.length).toBe(0);
});
test('Doit récupérer une production existante avec ses produits associés', async () => {
  const res = await (0, _supertest.default)(_server.default).get(`/production/${id_production}`).expect(200);
  expect(res.body.id).toBe(id_production);
  expect(res.body.produits).toBeDefined();
  expect(res.body.produits.length).toBe(2);
});
test('Doit modifier une production existante avec ses produits associés', async () => {
  const res = await (0, _supertest.default)(_server.default).put(`/production/${id_production}`).send({
    libelle_production: 'Libelle mis à jour',
    type_production: 'Culture annuelle',
    produits: [{
      libelle_produit: 'Paille de mise à jour',
      unite: 'tonne de matière sèche'
    }, {
      libelle_produit: 'Egalement mis à jour',
      unite: 'quintal'
    }, {
      libelle_produit: 'Un troisième produit créé',
      unite: 'quintal'
    }]
  }).expect(200);
  expect(res.body.id).toBeDefined();
  expect(res.body.produits).toBeDefined();
  expect(res.body.produits.length).toBe(3);
});
test('Doit supprimer une production et ses produits associés', async () => {
  const res = await (0, _supertest.default)(_server.default).delete(`/production/${id_production}`).expect(204);
});
test("Doit renvoyer 404 lors de la suppression d'une production inexistante", async () => {
  const res = await (0, _supertest.default)(_server.default).delete(`/production/567098356`).expect(404);
});
beforeAll(done => {
  _pool.default.pool.query('INSERT INTO fiche.production(id,libelle,type_production) VALUES ($1,$2,$3) RETURNING *', [id_production, 'Une production de test', 'Culture annuelle'], (err, res) => {
    if (err) {
      throw done(err);
    }

    produits.forEach(({
      id_produit,
      libelle,
      unite
    }) => {
      _pool.default.pool.query('INSERT INTO fiche.produit(id,id_production, libelle,unite) VALUES ($1,$2,$3,$4) RETURNING *', [id_produit, id_production, libelle, unite], (err, res) => {
        if (err) {
          throw done(err);
        }
      });
    });
    setTimeout(() => {
      done();
    }, 2000);
  });
});
afterAll(done => {
  _pool.default.pool.query(`DELETE FROM fiche.production WHERE id=$1`, [id_production]).then(() => {
    _pool.default.pool.query(`DELETE FROM fiche.produit WHERE id_production=$1`, [id_production]).then(() => done());
  });
});