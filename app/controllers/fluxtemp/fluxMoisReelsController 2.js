const dbConn = require('../../db/pool')
const _ = require('lodash');

// Modif Swagger
// ajouter param date_ini (Format à définir : 2020-06-03 par exemple) dans le GET?
const getFluxMoisReelsById = (request, response) => {

  const id_fiche = request.params.id;
  //const date_ini = request.params.date_ini;
  const date_ini = new Date('2020-06-04');

  const getFluxBrutsByIdQuery = `WITH subquery AS(
    SELECT act.mois_relatif,act.mois,act.id_fiche_technique,
    CASE
      WHEN act.mois IS NOT NULL THEN $2::timestamp + interval '1 month' * act.mois::integer
      ELSE $2::timestamp + interval '1 month' * act.mois_relatif::integer
    END as mois_reel,
	d.libelle libelle_depense,d.montant,
	f.libelle libelle_production,f.ini_debut,f.ini_fin,
   (SELECT type_production FROM fiche.production WHERE id=f.id_production) type_production, $2::timestamp as date_ini
   FROM fiche.activite act JOIN fiche.depense d ON act.id=d.id_activite 
     JOIN fiche.fiche_technique f ON act.id_fiche_technique=f.id WHERE f.id=$1
   )
   SELECT id_fiche_technique,libelle_production,ini_debut,ini_fin,date_ini,type_production,JSON_AGG(JSON_BUILD_OBJECT('libelle_depense',libelle_depense,'mois_reel',mois_reel,'mois_relatif',mois_relatif,'montant_depense',montant)) depenses
   FROM subquery GROUP BY id_fiche_technique,libelle_production,ini_debut,ini_fin,type_production,date_ini`;
  dbConn.pool.query(getFluxBrutsByIdQuery, [id_fiche,date_ini], (error, results) => {
    if (error) {
      throw error
    }
    const depense = results.rows;

    const getVenteFicheQuery = `SELECT 
    CASE
      WHEN v.mois IS NOT NULL THEN CONCAT('prix_',TO_CHAR($2::timestamp + interval '1 month' * v.mois::integer,'month'))
      ELSE CONCAT('prix_',TO_CHAR($2::timestamp + interval '1 month' * v.mois_relatif::integer,'month'))
    END as col_prix_marche
    FROM fiche.vente v JOIN fiche.marche m ON v.id_marche = m.id WHERE v.id_fiche_technique=$1`;
    dbConn.pool.query(getVenteFicheQuery, [id_fiche,date_ini], (error, results) => {
      if (error) {
        throw error;
      }
      const prix_marche = results.rows[0].col_prix_marche;
      const getVentePrixByFiche = `SELECT JSON_AGG(JSON_BUILD_OBJECT('prix_marche',m.${prix_marche},
      'id_marche',v.id_marche,'mois_relatif',v.mois_relatif,'rendement',v.rendement, 
      'mois_reel',
      CASE
      WHEN v.mois IS NOT NULL THEN $2::timestamp + interval '1 month' * v.mois::integer
      ELSE $2::timestamp + interval '1 month' * v.mois_relatif::integer
      END,
      'libelle_marche',CONCAT((SELECT p.libelle FROM fiche.produit p WHERE id=m.id_produit ), 
          ' ', m.type_marche, ' ', m.localisation))) ventes
      FROM fiche.vente v JOIN fiche.marche m ON v.id_marche = m.id
      WHERE v.id_fiche_technique=$1`;
      dbConn.pool.query(getVentePrixByFiche, [id_fiche,date_ini], (error, results) => {
        if (error) {
          throw error;
        }
        const vente = results.rows;
        let resultjson = _.merge(depense,vente);
        response.status(200).send(resultjson);
      });
    });
    

  });

}

//Temp
const getVenteByIdFiche = (request, response) => {
  const id_fiche = request.params.id;
  const date_ini = new Date('2020-06-04');

  const getVenteFicheQuery = `SELECT 
  CONCAT('prix_',to_char($2::timestamp + interval '1 month' * v.mois_relatif::integer,'month')) col_prix_marche
  FROM fiche.vente v JOIN fiche.marche m ON v.id_marche = m.id WHERE v.id_fiche_technique=$1`;
  dbConn.pool.query(getVenteFicheQuery, [id_fiche,date_ini], (error, results) => {
    if (error) {
      throw error;
    }
    //const prix_marche = results.rows[0].col_prix_marche;
    const prix_marche = results.rows[0].col_prix_marche;
    const getVentePrixByFiche = `SELECT m.${prix_marche},
    v.id_marche, v.mois_relatif, v.rendement, 
    $2::timestamp + interval '1 month' * v.mois_relatif::integer as mois_reel,
    CONCAT((SELECT p.libelle FROM fiche.produit p WHERE id=m.id_produit ), 
        ' ', m.type_marche, ' ', m.localisation) libelle_marche
    FROM fiche.vente v JOIN fiche.marche m ON v.id_marche = m.id
    WHERE v.id_fiche_technique=$1`;
    dbConn.pool.query(getVentePrixByFiche, [id_fiche,date_ini], (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(results.rows);
    });
  });
};

//Temp
const getVenteById = (request, response) => {
  // Récupère l'id de la vente et de la fiche technique depuis les params de l'URL
  //const id_fiche_technique = request.params.id; // Sera utile pour tester le droit d'accès de l'utilisateur
  const id_vente = request.params.id;

  const getVenteQuery = `SELECT 
  CONCAT('prix_',to_char('2020-03-02'::timestamp + interval '1 month' * v.mois_relatif::integer,'month')) col_prix_marche
  FROM fiche.vente v JOIN fiche.marche m ON v.id_marche = m.id WHERE v.id=$1`;
  dbConn.pool.query(getVenteQuery, [id_vente], (error, results) => {
    if (error) {
      throw error;
    }
    //const prix_marche = results.rows[0].col_prix_marche;
    const prix_marche = results.rows[0].col_prix_marche;
    const getTestPrix = `SELECT m.${prix_marche},
    v.id_marche, v.mois_relatif, v.rendement, 
    '2020-03-02'::timestamp + interval '1 month' * v.mois_relatif::integer as mois_reel,
    CONCAT((SELECT p.libelle FROM fiche.produit p WHERE id=m.id_produit ), 
        ' ', m.type_marche, ' ', m.localisation) libelle_marche
    FROM fiche.vente v JOIN fiche.marche m ON v.id_marche = m.id
    WHERE v.id=$1`;
    dbConn.pool.query(getTestPrix, [id_vente], (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(results.rows);
    });
  });
};

module.exports = {
  getFluxMoisReelsById,
  getVenteByIdFiche,
  getVenteById
}