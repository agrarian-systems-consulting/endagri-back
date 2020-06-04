const dbConn = require('../../db/pool')
const _ = require('lodash');

// Modif Swagger
// ajouter param date_ini (Format à définir : 2020-06-03 par exemple) dans le GET?
const getFluxMoisReelsByIdByMois = (request, response) => {

  const id_fiche = request.params.id;
  //const date_ini = request.params.date_ini;
  const date_ini = new Date('2020-06-04');

  const getDepenseMoisReelsByIdQuery = `SELECT 
  CASE
    WHEN act.mois IS NOT NULL THEN $2::timestamp + interval '1 month' * act.mois::integer
    ELSE $2::timestamp + interval '1 month' * act.mois_relatif::integer
  END as mois_reel,SUM(d.montant) total_depense,'...' as total_vente,'...' as solde
 FROM fiche.activite act LEFT JOIN fiche.depense d ON act.id=d.id_activite 
   JOIN fiche.fiche_technique f ON act.id_fiche_technique=f.id WHERE f.id=$1 GROUP BY mois_reel,act.id_fiche_technique ORDER BY mois_reel`;
  dbConn.pool.query(getDepenseMoisReelsByIdQuery, [id_fiche,date_ini], (error, results) => {
    if (error) {
      throw error
    }
    const depenseMois = results.rows;

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


      const getVenteMoisReelsByIdQuery = `SELECT SUM(m.${prix_marche}*v.rendement) total_vente,
      CASE
      WHEN v.mois IS NOT NULL THEN $2::timestamp + interval '1 month' * v.mois::integer
      ELSE $2::timestamp + interval '1 month' * v.mois_relatif::integer
      END mois_reel
      FROM fiche.vente v JOIN fiche.marche m ON v.id_marche = m.id
      WHERE v.id_fiche_technique=$1 GROUP BY mois_reel ORDER BY mois_reel`;
      dbConn.pool.query(getVenteMoisReelsByIdQuery, [id_fiche,date_ini], (error, results) => {
        if (error) {
          throw error
        }
        const venteMois = results.rows;
        let resultjson = _.values(_.merge(_.keyBy(depenseMois, 'mois_reel'), _.keyBy(venteMois, 'mois_reel')));         
        const solde = resultjson.map(key=>{
          key['solde'] = (key['total_vente']-key['total_depense']);
        });
        response.status(200).send(resultjson);
      });
    });
  });

}

module.exports = {
  getFluxMoisReelsByIdByMois
}