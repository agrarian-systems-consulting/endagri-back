const dbConn = require('../../db/pool')

// 
const getAnalyses = (request, response) => {
    const getAnalysesQuery = `SELECT * FROM analyse_fiche.analyse ORDER BY id ASC`;
    dbConn.pool.query(getAnalysesQuery, (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(results.rows)
    })
}

const getAnalyseById = (request, response) => {

  const id_analyse = request.params.id;

  const getAnalyseByIdQuery = `SELECT a.id,a.created,a.modified,a.nom_utilisateur,a.nom_client,a.montant_tresorerie_initiale,a.date_debut_analyse,a.date_fin_analyse,
  json_agg(json_build_object('id_fiche_technique',ftl.id,'id_fiche_technique',ftl.id_fiche_technique,'date_ini',ftl.date_ini,'coeff_surface_ou_nombre_animaux',ftl.coeff_surface_ou_nombre_animaux,
							 'coeff_main_oeuvre_familiale',ftl.coeff_main_oeuvre_familiale,
  'coeff_ventes',(SELECT json_agg(json_build_object('libelle_categorie',cfv.libelle_categorie,'coeff_autoconsommation',cfv.coeff_autoconsommation,
	'coeff_intraconsommation',cfv.coeff_intraconsommation,'coeff_rendement',cfv.coeff_rendement)) FROM analyse_fiche.coeff_vente cfv 
   WHERE cfv.id_fiche_technique_libre = ftl.id),
  'coeff_depenses',(SELECT json_agg(json_build_object('libelle_categorie',cfd.libelle_categorie,'coeff_intraconsommation',cfd.coeff_intraconsommation)) FROM analyse_fiche.coeff_vente cfd 
   WHERE cfd.id_fiche_technique_libre = ftl.id))) fiches_techniques_libres,
   json_agg(json_build_object('libelle',libelle,'mois_reel',mois_reel,'montant',montant)) depenses_libres
  FROM analyse_fiche.analyse a JOIN analyse_fiche.depense_libre dl ON a.id=dl.id_analyse
  JOIN analyse_fiche.fiche_technique_libre ftl ON a.id=ftl.id_analyse WHERE a.id=$1
  GROUP BY a.id,a.created,a.modified,a.nom_utilisateur,a.nom_client,a.montant_tresorerie_initiale,a.date_debut_analyse,a.date_fin_analyse`;
  dbConn.pool.query(getAnalyseByIdQuery, [id_analyse], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(results.rows)
  })
}

module.exports = {
    getAnalyses,
    getAnalyseById,
}
