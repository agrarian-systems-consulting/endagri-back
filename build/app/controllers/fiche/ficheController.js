"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pool = _interopRequireDefault(require("../../db/pool"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getFiches = (request, response) => {
  const id_utilisateur = request.query.id_utilisateur;

  if (id_utilisateur !== undefined) {
    const getFichesQuery = 'SELECT f.id, f.id_production, f.id_utilisateur, f.libelle, p.libelle as libelle_production FROM fiche.fiche_technique f LEFT JOIN fiche.production p ON f.id_production = p.id  WHERE f.id_utilisateur=$1 ORDER BY f.id ASC';

    _pool.default.pool.query(getFichesQuery, [id_utilisateur], (error, results) => {
      if (error) {
        throw error;
      }

      response.status(200).send(results.rows);
    });
  } else {
    const getFichesQuery = `SELECT f.id, f.id_production, f.id_utilisateur, f.libelle, p.libelle as libelle_production FROM fiche.fiche_technique f 
    JOIN fiche.production p ON f.id_production = p.id ORDER BY f.id ASC`;

    _pool.default.pool.query(getFichesQuery, (error, results) => {
      if (error) {
        throw error;
      }

      response.status(200).send(results.rows);
    });
  }
};

const postFiche = (request, response) => {
  const {
    libelle,
    id_production,
    id_utilisateur,
    ini_debut,
    ini_fin,
    ventes,
    activites
  } = request.body;

  _pool.default.pool.query(`INSERT INTO fiche.fiche_technique(id, id_utilisateur, libelle, id_production, ini_debut, ini_fin) VALUES (DEFAULT, $1, $2, $3, $4, $5) RETURNING id`, [id_utilisateur, libelle, id_production, ini_debut, ini_fin], (err, res) => {
    if (err) {
      throw err;
    }

    const id_fiche_technique = res.rows[0].id;
    response.set('Content-Type', 'application/json').status(201).json({
      id: id_fiche_technique
    });
  });
};

const getFicheById = (request, response) => {
  const id_fiche = request.params.id;

  _pool.default.pool.query(`
    SELECT 
    p.libelle AS libelle_production,
    p.type_production AS type_production,
    f.*, 
    json_agg(
      CASE a.id WHEN NULL 
        THEN NULL ELSE json_build_object('id',a.id,'libelle',a.libelle,'mois_relatif', a.mois_relatif,'mois',a.mois,'commentaire',a.commentaire) END) activites,
    json_agg(
      CASE v.id WHEN NULL 
        THEN NULL ELSE json_build_object('id',v.id,'id_marche',v.id_marche,'mois_relatif', v.mois_relatif,'mois',v.mois,'rendement_min',v.rendement_min,'rendement',v.rendement,'rendement_max',v.rendement_max) END) ventes 

    FROM fiche.fiche_technique f 
      LEFT JOIN fiche.activite a ON a.id_fiche_technique = f.id 
      LEFT JOIN fiche.vente v ON v.id_fiche_technique = f.id
      LEFT JOIN fiche.production p ON f.id_production = p.id 
    WHERE f.id = $1 GROUP BY f.id, p.libelle, p.type_production
    `, [id_fiche], (error, results) => {
    if (error) {
      throw error;
    }

    response.status(200).send(results.rows[0]);
  });
};

const putFicheById = (request, response) => {
  const id_fiche = request.params.id;
  const {
    libelle_fiche,
    ini_debut,
    ini_fin,
    commentaire
  } = request.body;
  const putFicheByIdQuery = `UPDATE fiche.fiche_technique SET libelle=$1, ini_debut=$2, ini_fin=$3, commentaire=$4 WHERE id=$5 RETURNING *`;

  _pool.default.pool.query(putFicheByIdQuery, [libelle_fiche, ini_debut, ini_fin, commentaire, id_fiche], (err, res) => {
    if (err) {
      throw err;
    }

    if (res.rows[0] !== undefined) {
      response.status(200).send(res.rows[0]);
    } else {
      response.sendStatus(404);
    }
  });
};

const deleteFicheById = (request, response) => {
  const id_fiche = request.params.id;

  _pool.default.pool.query(`DELETE FROM fiche.fiche_technique WHERE id=$1 RETURNING *`, [id_fiche], (err, res) => {
    if (err) {
      throw err;
    }

    if (res.rows[0] !== undefined) {
      response.status(200).send(res.rows[0]);
    } else {
      response.sendStatus(404);
    }
  });
};

var _default = {
  getFiches,
  postFiche,
  getFicheById,
  putFicheById,
  deleteFicheById
};
exports.default = _default;