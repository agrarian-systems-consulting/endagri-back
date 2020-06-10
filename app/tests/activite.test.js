import request from 'supertest';
import assert from 'assert';
import app from '../../server';
import dbConn from '../db/pool';
import chalk from 'chalk';
import _ from 'lodash';
import regeneratorRuntime from 'regenerator-runtime';

// Paramètres pour la mise en place d'une fiche technique, des activités et des dépenses nécessaires pour les tests
const id_fiche_technique = '136789';
const id_activite = '145678';
const depenses = [
  { id: 3468020, libelle_depense: 'Dépense de test 5', montant: 246 },
  { id: 7680240, libelle_depense: 'Dépense de test 6', montant: 468 },
];

test('Doit créer une activité sans dépenses associées dans une fiche existante', async () => {
  const res = await request(app)
    .post(`/fiche/${id_fiche_technique}/activite`)
    .send({
      libelle_activite: 'Activité de test 1',
      mois_relatif: 1,
      mois: null,
    })
    .expect(201);

  expect(res.body.id).toBeDefined();
  expect(res.body.id_fiche_technique).toBe(id_fiche_technique);
  expect(res.body.libelle).toBe('Activité de test 1');
  expect(res.body.mois_relatif).toBe(1);
  expect(res.body.mois).toBe(null);
});

test('Doit créer une activité avec des dépenses associées dans une fiche existante', async () => {
  const res = await request(app)
    .post(`/fiche/${id_fiche_technique}/activite`)
    .send({
      libelle_activite: 'Activité de test 2',
      mois_relatif: null,
      mois: 2,
      depenses: [
        {
          libelle_depense: 'Dépense de test 2',
          montant: 470,
        },
        {
          libelle_depense: 'Dépense de test 2',
          montant: 75,
        },
        {
          libelle_depense: 'Dépense de test 2',
          montant: 75,
        },
        {
          libelle_depense: 'Dépense de test 2',
          montant: 75,
        },
        {
          libelle_depense: 'Dépense de test 2',
          montant: 75,
        },
        {
          libelle_depense: 'Dépense de test 2',
          montant: 75,
        },
        {
          libelle_depense: 'Dépense de test 2',
          montant: 75,
        },
      ],
    })
    .expect(201);

  expect(res.body.id).toBeDefined();
  expect(res.body.libelle).toBe('Activité de test 2');
  expect(res.body.mois_relatif).toBe(null);
  expect(res.body.mois).toBe(2);
  expect(res.body.depenses).toBeDefined();
  expect(res.body.depenses.length).toBe(7);
});

test("Doit modifier une activite sans dépenses d'une fiche technique", async () => {
  const res = await request(app)
    .put(`/fiche/${id_fiche_technique}/activite/${id_activite}`)
    .send({
      libelle_activite: "Un titre d'activité modifié par le test 3",
      mois_relatif: 2,
      mois: null,
    })
    .expect(200);

  expect(res.body.id).toBeDefined();
  expect(res.body.libelle).toBe("Un titre d'activité modifié par le test 3");
  // expect(res.body.depenses.length).toBe(0);
});

test("Doit modifier une activite et des dépenses existantes associées d'une fiche technique", async () => {
  const res = await request(app)
    .put(`/fiche/${id_fiche_technique}/activite/${id_activite}`)
    .send({
      libelle_activite: "Un titre d'activité modifié par le test 4",
      mois_relatif: 6,
      mois: null,
      depenses: [
        { id: 2468020, libelle_depense: 'Dépense de test 4:1', montant: 246 },
        { id: 4680240, libelle_depense: 'Dépense de test 4:2', montant: 468 },
      ],
    })
    .expect(200);

  expect(res.body.id).toBeDefined();
  expect(res.body.libelle).toBe("Un titre d'activité modifié par le test 4");
  expect(res.body.depenses).toBeDefined();
  console.log(chalk.inverse(JSON.stringify(res.body.depenses, 2, true)));
  expect(res.body.depenses.length).toBe(2);
});

test("Doit supprimer une activité d'une fiche technique", (done) => {
  request(app)
    .delete(`/fiche/${id_fiche_technique}/activite/${id_activite}`)
    .expect(204)
    .end(function (err, res) {
      if (err) return done(err);
      done();
    });
});

beforeAll((done) => {
  // Création de la requête pour créer une fiche pour le test
  const postFicheQuery =
    'INSERT INTO fiche.fiche_technique(id, id_utilisateur, libelle, id_production, ini_debut, ini_fin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';

  // Envoi de la requête
  dbConn.pool.query(
    postFicheQuery,
    [id_fiche_technique, 65, 'Fiche de test', 65, 2, 6],
    (err, res) => {
      if (err) return done(err);

      // Création de la requête pour créer une activité pour le test
      const postActiviteQuery =
        'INSERT INTO fiche.activite(id, id_fiche_technique, mois_relatif, mois, libelle) VALUES ($1, $2, $3, $4, $5) RETURNING *';

      // Envoi de la requête
      dbConn.pool.query(
        postActiviteQuery,
        [id_activite, id_fiche_technique, 4, 5, 'Activite de test 7'],
        (err, res) => {
          if (err) return done(err);
          // console.log(results);

          // Ajoute les dépenses
          depenses.map(({ id, libelle_depense, montant }) => {
            // Construction de la requête pour créer une dépense
            const postDepenseQuery = `INSERT INTO fiche.depense(id, id_activite, libelle, montant) VALUES ( $1, $2, $3, $4) RETURNING *`;

            // Envoi de la requête
            dbConn.pool.query(
              postDepenseQuery,
              [id, id_activite, libelle_depense, montant],
              (err, res) => {
                if (err) return done(err);

                // console.log(res);
              }
            );
          });

          done();
        }
      );
    }
  );
});

afterAll((done) => {
  // Supprime la fiche technique créée pour le test
  const deleteFicheByIdQuery =
    'DELETE FROM fiche.fiche_technique WHERE id=$1 RETURNING *';
  dbConn.pool.query(
    deleteFicheByIdQuery,
    [id_fiche_technique],
    (error, results) => {
      if (error) {
        throw error;
      }
      // Supprime les activités créées par le test
      const deleteActiviteQuery =
        'DELETE FROM fiche.activite WHERE id=$1 RETURNING *';
      dbConn.pool.query(
        deleteActiviteQuery,
        [id_activite],
        (error, results) => {
          if (error) {
            throw error;
          }
          //Supprimer les dépenses créées par le test
          depenses.map(({ id }) => {
            const deleteDepensesQuery =
              'DELETE FROM fiche.depense WHERE id=$1 RETURNING *';
            dbConn.pool.query(deleteDepensesQuery, [id], (error, results) => {
              if (error) {
                throw error;
              }
              done();
            });
          });
        }
      );
    }
  );
});
