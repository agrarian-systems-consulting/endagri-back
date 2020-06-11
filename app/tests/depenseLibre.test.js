import request from 'supertest';
import app from '../../server';
import dbConn from '../db/pool';
import regeneratorRuntime from 'regenerator-runtime';

test("Doit récupérer les dépenses libres d'une analyse existante", async () => {
  const res = await request(app).get(`/analyse/1/depenses_libres`).expect(200);
  expect(res.body[0].id).toBeDefined();
  expect(res.body[0].libelle).toBeDefined();
  expect(res.body[0].mois_reel).toBeDefined();
  expect(res.body[0].montant).toBeDefined();
});
