import dbConn from '../../db/pool';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// ---- REGISTER ---- //
const register = (request, response) => {
  // Read matricule et mot de passe
  const { matricule, password, role } = request.body;

  // Chiffrer le mot de passe avec bcrypt
  const saltRounds = 10;

  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hashedPassword) {
      if (err) {
        console.log(err);
        return response.status(404).json({ err });
      }

      // Sauvegarder l'utilisateur en base de données avec le mot de passe chiffré
      dbConn.pool.query(
        `INSERT INTO
        utilisateurs.utilisateurs(matricule, password, role)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [matricule, hashedPassword, role],
        (err, res) => {
          if (err) {
            console.log(err);
            return response.status(404).json({ err });
          }

          const { password, ...userWithoutPassword } = res.rows[0]; // Retire le mot de passe

          return response.status(200).json(userWithoutPassword);
        }
      );
    });
  });
};
export default {
  register,
};
