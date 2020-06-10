import request from 'supertest';
import assert from 'assert';
import app from '../../server';
import dbConn from '../db/pool';
import chalk from 'chalk';
import regeneratorRuntime from 'regenerator-runtime';

test('Doit récupérer la liste de tous les marchés', async () => {
  const res = await request(app).get(`/marches`).expect(200);
  expect(res.body[0].id).toBeDefined();
  expect(res.body[0].id_produit).toBeDefined();
  expect(res.body[0].id_production).toBeDefined();
  expect(res.body[0].libelle_produit).toBeDefined();
  expect(res.body[0].unite).toBeDefined();
});
