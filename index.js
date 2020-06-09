import app from './server';
import chalk from 'chalk';

// Défini le port de l'application
const PORT = process.env.PORT || 3333;

// Lance l'application
app.listen(PORT, () =>
  console.log(chalk.bold(`🚀 L'application tourne sur le port ${PORT}...`))
);
