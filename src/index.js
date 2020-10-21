import app from './server';

// Défini le port de l'application
const PORT = process.env.PORT || 3333;

// Lance l'application
app.listen(PORT, () =>
  console.log(`🚀 L'application Endagri tourne sur le port ${PORT}...`)
);
