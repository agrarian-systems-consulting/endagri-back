import request from 'supertest';
import assert from 'assert';
import app from '../../server';
import dbConn from '../db/pool';
import chalk from 'chalk';
import regeneratorRuntime from 'regenerator-runtime';

const id_fiche_technique = 1001;

test('Doit retourner toutes les fiches techniques', async () => {
  const res = await request(app).get('/fiches').expect(200);

  expect(res.body.length).toBeGreaterThan(3);
  expect(res.body[0].libelle_production).toBeDefined();
});

test("Doit retourner toutes les fiches techniques d'un seul auteur", async () => {
  const res = await request(app).get('/fiches/?id_utilisateur=1').expect(200);

  expect(res.body.length).toBe(3);
});

test("Doit retourner le contenu d'une fiche technique", async () => {
  const res = await request(app)
    .get(`/fiche/${id_fiche_technique}`)
    .expect(200);

  expect(res.body.id).toBe(id_fiche_technique);
  expect(res.body.libelle).toBe('Carottes en sol argileux');
  expect(res.body.activites).toBeDefined();
  expect(res.body.ventes).toBeDefined();
  expect(res.body.type_production).toBeDefined();
  expect(res.body.id_production).toBeDefined();
});

test('Doit créer une fiche technique sans activités ni ventes', async () => {
  const res = await request(app)
    .post('/fiche')
    .send({
      libelle_fiche: 'Pomme de terres en agriculture biologique',
      id_utilisateur: 45,
      id_production: 3,
      ini_debut: 1,
      ini_fin: 3,
    })
    .expect(201);

  expect(res.body.id).toBeDefined();
});

test('Doit créer une fiche technique avec des ventes, des activités et des dépenses associées', (done) => {
  request(app)
    .post('/fiche')
    .send({
      libelle_fiche: 'Bananes en agriculture biologique',
      id_utilisateur: 86,
      id_production: 17,
      ini_debut: null,
      ini_fin: null,
      ventes: [
        {
          id_marche: 24,
          rendement_min: 400,
          rendement: 500,
          rendement_max: 600,
          mois_relatif: 5,
        },
        {
          id_marche: 24,
          rendement_min: 250,
          rendement: 360,
          rendement_max: 470,
          mois_relatif: 6,
        },
      ],
      activites: [
        {
          libelle_activite: 'Labour',
          mois_relatif: -1,
          depenses: [
            {
              libelle_depense: 'Tracteur',
              montant: 1500,
            },
            {
              libelle_depense: "Main d'oeuvre",
              montant: 500,
            },
          ],
        },
        {
          libelle_activite: 'Semis',
          mois_relatif: 0,
          depenses: [
            {
              libelle_depense: 'Tracteur',
              montant: 500,
            },
            {
              libelle_depense: "Main d'oeuvre",
              montant: 500,
            },
          ],
        },
        {
          libelle_activite: 'Récolte',
          mois_relatif: 5,
          depenses: [
            {
              libelle_depense: "Main d'oeuvre",
              montant: 200,
            },
          ],
        },
      ],
    })
    .expect(201)
    .end(function (err, res) {
      if (err) return done(err);
      // console.log('res.body =', res.body);
      expect(res.body.id).toBeDefined();

      done();
    });
});

test("Doit modifier les informations principales d'une fiche technique", async () => {
  const res = await request(app)
    .put(`/fiche/${id_fiche_technique}`)
    .send({
      libelle_fiche: 'Un titre modifié',
      ini_debut: 1,
      ini_fin: 3,
      commentaire: 'Un commentaire sur une fiche modifiée',
    })
    .expect(200);

  expect(res.body.libelle).toBe('Un titre modifié');
  expect(res.body.commentaire).toBe('Un commentaire sur une fiche modifiée');
});

test("Doit refuser la modification d'une fiche technique inexistante", async () => {
  const res = await request(app)
    .put(`/fiche/983409834`)
    .send({
      libelle_fiche: 'Un titre modifié',
      ini_debut: 1,
      ini_fin: 3,
      commentaire: 'Un commentaire sur une fiche modifiée',
    })
    .expect(404);
});

test('Doit supprimer une fiche technique', async () => {
  const res = request(app).delete(`/fiche/${id_fiche_technique}`).expect(204);
});

test("Doit refuser la suppression d'une fiche technique inexistante", async () => {
  const res = request(app).delete(`/fiche/98345098343346`).expect(404);
});

// Créé une fiche à supprimer dans un test
beforeAll((done) => {
  const postFicheQuery =
    'INSERT INTO fiche.fiche_technique(id, id_utilisateur, libelle, id_production, ini_debut, ini_fin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';

  dbConn.pool
    .query(postFicheQuery, [
      id_fiche_technique,
      65,
      'Carottes en sol argileux',
      65,
      2,
      6,
    ])
    .then(() => done());
});

// Créé une fiche à supprimer dans un test
afterAll((done) => {
  const deleteQuery = 'DELETE FROM fiche.fiche_technique WHERE id=$1';

  dbConn.pool.query(deleteQuery, [id_fiche_technique]).then(() => done());
});
