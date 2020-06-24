"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pool = _interopRequireDefault(require("../../db/pool"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const postVente = (request, response) => {
  const id_fiche_technique = request.params.id;
  const {
    id_marche,
    mois,
    mois_relatif,
    rendement_min,
    rendement,
    rendement_max
  } = request.body;

  _pool.default.pool.query(`INSERT INTO fiche.vente(id, id_fiche_technique, id_marche, mois, mois_relatif, rendement_min, rendement, rendement_max) 
  VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7) RETURNING id, id_marche, mois, mois_relatif, rendement_min::integer, rendement::integer, rendement_max::integer`, [id_fiche_technique, id_marche, mois, mois_relatif, rendement_min, rendement, rendement_max], (err, res) => {
    if (err) {
      throw err;
    }

    response.status(201).send(res.rows[0]);
  });
};

const putVente = (request, response) => {
  const id_fiche_technique = request.params.id;
  const id_vente = request.params.id_vente;
  const {
    id_marche,
    mois,
    mois_relatif,
    rendement_min,
    rendement,
    rendement_max
  } = request.body;
  const putVenteQuery = `UPDATE fiche.vente SET id_marche=$1, mois=$2, mois_relatif=$3, rendement_min=$4, rendement=$5, rendement_max=$6 WHERE id=$7 RETURNING id, id_marche, mois, mois_relatif, rendement_min::integer, rendement::integer, rendement_max::integer`;

  _pool.default.pool.query(putVenteQuery, [id_marche, mois, mois_relatif, rendement_min, rendement, rendement_max, id_vente], (error, results) => {
    if (error) {
      throw error;
    }

    response.status(200).send(results.rows[0]);
  });
};

const deleteVente = (request, response) => {
  const id_fiche_technique = request.params.id;
  const id_vente = request.params.id_vente;
  const deleteVenteQuery = 'DELETE FROM fiche.vente WHERE id=$1 RETURNING *';

  _pool.default.pool.query(deleteVenteQuery, [id_vente], (error, results) => {
    if (error) {
      throw error;
    }

    if (results.rows[0] !== undefined) {
      response.sendStatus(204);
    } else {
      response.sendStatus(404);
    }
  });
};

var _default = {
  postVente,
  putVente,
  deleteVente
};
exports.default = _default;