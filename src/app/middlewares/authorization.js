import chalk from 'chalk';

// Middleware pour des permissions liées au rôle de l'utilisateur
export default function permit(...permittedRoles) {
  // Création du middleware
  return (request, response, next) => {
    // Récupère l'utilisateur dans la requête
    const { user } = request;

    // Vérifier qu'il y a un utilisateur et qu'il dispose bien d'un des rôles permis pour la route en question
    if (user && permittedRoles.includes(user.role)) {
      {
        console.log(
          chalk.green(
            `Autorisation accordée pour la requête en tant que ${user.role}.`
          ),
          `\nRôles permis : ${permittedRoles}`
        );
      }
      next(); // S'il a le rôle correspondant, on passe au middleware suivant
    } else {
      console.log(
        chalk.red(`Autorisation refusée pour la requête.`),
        `\nRôles permis : ${permittedRoles}`
      );
      response.status(403).json({ message: 'Forbidden' }); // Sinon, l'utilisateur n'est pas autorisé à utiliser cette route
    }
  };
}
