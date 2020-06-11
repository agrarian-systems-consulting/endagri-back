import request from 'supertest';
import app from '../../server';
import dbConn from '../db/pool';
import regeneratorRuntime from 'regenerator-runtime';

const id_analyse = 238453;

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
});

// A adapter à une analyse de test spécifique
test('Doit récupérer une analyse qui a des fiches techniques libres et dépenses libres associées', async () => {
  const res = await request(app).get(`/analyse/1`).expect(200);

  expect(res.body.id).toBe(1);
  expect(res.body.nom_utilisateur).toBeDefined();
  expect(res.body.nom_client).toBeDefined();
  expect(res.body.montant_tresorerie_initiale).toBeDefined();
  expect(res.body.fiches_techniques_libres).toBeDefined();
  expect(res.body.depenses_libres).toBeDefined();
});

test("Doit récupérer une analyse qui n'a pas de fiches techniques libres", async () => {
  const res = await request(app).get(`/analyse/${id_analyse}`).expect(200);

  expect(res.body.id).toBe(id_analyse);
  expect(res.body.nom_utilisateur).toBeDefined();
  expect(res.body.nom_client).toBeDefined();
  expect(res.body.montant_tresorerie_initiale).toBeDefined();
  expect(res.body.fiches_techniques_libres).toBeDefined();
  expect(res.body.depenses_libres).toBeDefined();
});

test("Doit récupérer une analyse qui n'a pas de dépenses libres", async () => {
  const res = await request(app).get(`/analyse/${id_analyse}`).expect(200);

  expect(res.body.id).toBe(id_analyse);
  expect(res.body.nom_utilisateur).toBeDefined();
  expect(res.body.nom_client).toBeDefined();
  expect(res.body.montant_tresorerie_initiale).toBeDefined();
  expect(res.body.fiches_techniques_libres).toBeDefined();
  expect(res.body.depenses_libres).toBeDefined();
});

// A adapter à une analyse de test spécifique
test('Doit modifier une analyse existante', async () => {
  const res = await request(app)
    .put(`/analyse/${id_analyse}`)
    .send({
      nom_utilisateur: 'Auteur modifié',
      nom_client: 'Client modifié',
      montant_tresorerie_initiale: 1234,
      date_debut_analyse: '2020-05-06',
      date_fin_analyse: '2021-05-06',
    })
    .expect(200);

  expect(res.body.id).toBe(id_analyse);
  expect(res.body.nom_utilisateur).toBe('Auteur modifié');
  expect(res.body.nom_client).toBe('Client modifié');
  expect(res.body.montant_tresorerie_initiale).toBe(1234);
  expect(res.body.date_debut_analyse).toBeDefined();
  expect(res.body.date_fin_analyse).toBeDefined();
});

test('Doit supprimer une analyse existante', async () => {
  const res = await request(app).delete(`/analyse/${id_analyse}`).expect(200);
  expect(res.body.id).toBeDefined();
});

test('Doit renvoyer 404 en supprimant une analyse inexistante', async () => {
  const res = await request(app).delete(`/analyse/3460934`).expect(404);
});

beforeAll((done) => {
  dbConn.pool.query(
    `INSERT INTO analyse_fiche.analyse(
      id,
      nom_utilisateur,
      nom_client,
      montant_tresorerie_initiale,
      date_debut_analyse,
      date_fin_analyse) 
      VALUES ($1, $2, $3, $4, $5,$6)`,
    [
      id_analyse,
      'Auteur de test',
      'Client de test',
      3480,
      '2020-05-05',
      '2021-05-05',
    ],
    (err, res) => {
      if (err) {
        throw done(err);
      }
      done();
    }
  );
});

afterAll((done) => {
  dbConn.pool
    .query(`DELETE FROM analyse_fiche.analyse WHERE id=$1`, [id_analyse])
    .then(() => {
      done();
    });
});
