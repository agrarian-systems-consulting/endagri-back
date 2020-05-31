const dbConn = require('../../db/pool')

// CREER JOINTURE
const getFluxBrutsById = (request, response) => {

  const id_fiche = request.params.id;

  const getFluxBrutsByIdQuery = `WITH subquery AS(
    SELECT act.mois_relatif,act.mois,act.id_fiche_technique,d.libelle libelle_depense,d.montant,f.libelle libelle_production,f.ini_debut,f.ini_fin,
   (SELECT type_production FROM fiche.production WHERE id=f.id_production) type_production
   FROM fiche.activite act LEFT JOIN fiche.depense d ON act.id=d.id_activite 
     JOIN fiche.fiche_technique f ON act.id_fiche_technique=f.id WHERE f.id=$1
   )
   SELECT libelle_production,ini_debut,ini_fin,type_production,JSON_AGG(JSON_BUILD_OBJECT('libelle_depense',libelle_depense,'mois',mois,'mois relatif',mois_relatif,'montant',montant)) depenses
   FROM subquery GROUP BY libelle_production,ini_debut,ini_fin,type_production`;
  dbConn.pool.query(getFluxBrutsByIdQuery,[id_fiche] (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(results.rows)
  })
}

module.exports = {
  getFluxBrutsById,
}