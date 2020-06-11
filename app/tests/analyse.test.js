import request from 'supertest';
import app from '../../server';
import dbConn from '../db/pool';
import regeneratorRuntime from 'regenerator-runtime';

test('Doit récupérer la liste de toutes les analyses', async () => {
  const res = await request(app).get(`/analyses`).expect(200);
});

test('Doit créer une nouvelle analyse', async () => {
  const res = await request(app)
    .post(`/analyse`)
    .send({
      nom_utilisateur: 'Auteur test',
      nom_client: 'Client test',
      montant_tresorerie_initiale: 3000,
      date_debut_analyse: '2020-05-05',
      date_fin_analyse: '2021-05-05',
    })
    .expect(200);

  expect(res.body.id).toBeDefined();
  expect(res.body.nom_utilisateur).toBe('Auteur test');
  expect(res.body.nom_client).toBe('Client test');
  expect(res.body.montant_tresorerie_initiale).toBe(3000);
  expect(res.body.date_debut_analyse).toBeDefined();
  expect(res.body.date_fin_analyse).toBeDefined();
  expect(res.body.produits.fiche_techniques_libres).toBeDefined();
  expect(res.body.produits.fiche_techniques_libres.length).toBe(0);
  expect(res.body.produits.depenses_libres).toBeDefined();
  expect(res.body.produits.depenses_libres.length).toBe(0);
});

// A adapter à une analyse de test spécifique
test('Doit récupérer une analyse', async () => {
  const res = await request(app).get(`/analyse/1`).expect(200);

  expect(res.body.id).toBe(1);
  expect(res.body.nom_utilisateur).toBeDefined();
  expect(res.body.nom_client).toBeDefined();
  expect(res.body.montant_tresorerie_initiale).toBeDefined();
  expect(res.body.produits.fiche_techniques_libres).toBeDefined();
  expect(res.body.produits.depenses_libres).toBeDefined();
});

// A adapter à une analyse de test spécifique
test('Doit modifier une analyse existante', async () => {
  const res = await request(app)
    .put(`/analyse/2`)
    .send({
      nom_utilisateur: 'Auteur modifié',
      nom_client: 'Client modifié',
      montant_tresorerie_initiale: 1234,
      date_debut_analyse: '2020-05-06',
      date_fin_analyse: '2021-05-06',
    })
    .expect(200);

  expect(res.body.id).toBe(2);
  expect(res.body.nom_utilisateur).toBe('Auteur modifié');
  expect(res.body.nom_client).toBe('Client modifié');
  expect(res.body.montant_tresorerie_initiale).toBe(1234);
  expect(res.body.date_debut_analyse).toBeDefined();
  expect(res.body.date_fin_analyse).toBeDefined();
});
