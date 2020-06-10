import request from 'supertest';
import assert from 'assert';
import app from '../../server';
import dbConn from '../db/pool';
import chalk from 'chalk';
import regeneratorRuntime from 'regenerator-runtime';

const id_production = 18;

test('Doit récupérer la liste de tous les marchés', async () => {
  const res = await request(app).get(`/marches`).expect(200);
  expect(res.body[0].id).toBeDefined();
  expect(res.body[0].id_produit).toBeDefined();
  expect(res.body[0].id_production).toBeDefined();
  expect(res.body[0].libelle_produit).toBeDefined();
  expect(res.body[0].libelle_production).toBeDefined();
  expect(res.body[0].unite).toBeDefined();
});

test('Doit récupérer la liste de tous les marchés pour une production définie', async () => {
  const res = await request(app)
    .get(`/marches?id_production=${id_production}`)
    .expect(200);

  expect(res.body[0].id).toBeDefined();
  expect(res.body[0].id_produit).toBeDefined();
  expect(res.body[0].id_production).toBe(id_production.toString()); // L'id revient avec des guillemets
  expect(res.body[0].libelle_produit).toBeDefined();
  expect(res.body[0].libelle_production).toBeDefined();
  expect(res.body[0].unite).toBeDefined();
});
