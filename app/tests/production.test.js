import request from 'supertest';
import app from '../../server';
import dbConn from '../db/pool';
import chalk from 'chalk';
import regeneratorRuntime from 'regenerator-runtime';

test('Doit récupérer la liste de toutes les productions', async () => {
  const res = await request(app).get(`/productions`).expect(200);
  expect(res.body[0].id).toBe(1);
  expect(res.body[0].libelle).toBe('Ail');
  expect(res.body[0].type_production).toBe('Culture annuelle');
});

test("Doit récupérer la liste de toutes les productions d'un seul type de production", async () => {
  const res = await request(app)
    .get(`/productions?type_production=Culture%20annuelle`)
    .expect(200);

  res.body.forEach(({ type_production }) => {
    expect(type_production).toBe('Culture annuelle');
  });
});

test('Doit créer une nouvelle production', async () => {
  const res = await request(app)
    .post(`/production`)
    .send({
      libelle_production: 'Un essai de production',
      type_production: 'Culture annuelle',
      produits: [
        {
          libelle_produit: 'Paille de chose',
          unite: 'tonne de matière sèche',
        },
        {
          libelle_produit: 'Grains de chose',
          unite: 'quintal',
        },
      ],
    })
    .expect(200);
});
