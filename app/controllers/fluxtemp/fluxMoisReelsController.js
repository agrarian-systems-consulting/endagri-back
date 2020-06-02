const dbConn = require('../../db/pool')

// Modif Swagger
// ajouter param date_ini (Format à définir : 2020-06-03 par exemple) dans le GET?
const getFluxMoisReelsById = (request, response) => {

  const id_fiche = request.params.id;
  const date_ini = request.params.date_ini;

  const getFluxBrutsByIdQuery = `WITH subquery AS(
    SELECT act.mois_relatif,act.mois,act.id_fiche_technique,$2::timestamp + interval '1 month' * act.mois_relatif::integer as mois_reel,
	d.libelle libelle_depense,d.montant,
	f.libelle libelle_production,f.ini_debut,f.ini_fin,
   (SELECT type_production FROM fiche.production WHERE id=f.id_production) type_production, $2::timestamp as date_ini
   FROM fiche.activite act LEFT JOIN fiche.depense d ON act.id=d.id_activite 
     JOIN fiche.fiche_technique f ON act.id_fiche_technique=f.id WHERE f.id=$1
   )
   SELECT libelle_production,ini_debut,ini_fin,date_ini,type_production,JSON_AGG(JSON_BUILD_OBJECT('libelle_depense',libelle_depense,'mois reel',mois_reel,'mois relatif',mois_relatif,'montant',montant)) depenses
   FROM subquery GROUP BY libelle_production,ini_debut,ini_fin,type_production,date_ini`;
  dbConn.pool.query(getFluxBrutsByIdQuery, [id_fiche,date_ini], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(results.rows)
  });
}

module.exports = {
  getFluxMoisReelsById,
}