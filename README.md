# Endagri - API REST

![BuildStatus](https://img.shields.io/badge/Build-Passing-brightgreen.svg) ![Functions](https://img.shields.io/badge/Coverage-96.99%25-brightgreen.svg 'Make me better!')

Cette application correspond à l'API REST de l'application Endagri

## Pour commencer

Ces instructions vous permettront d'obtenir une copie du projet sur votre machine locale à des fins de développement et de test. Consultez la section "Déploiement" pour obtenir des notes sur la manière de déployer le projet sur un système réel. Cette application nécessite d'avoir installer node et npm dans leur version LTS.

### Installation

Une série d'exemples qui vous expliquent, étape par étape, comment faire fonctionner un environnement de développement

#### Clôner le code

```
git clone https://github.com/agrarian-systems-consulting/endagri-back.git
```

#### Installer les dépendances avec npm

```
cd endagri-back
npm install
```

#### Exécuter en mode développement

Le mode développement exécute le code en temps réel et rafraichit l'application à chaque changement enregistré dans le code. Il dispose également de fonctions de log plus complètes qu'en production.

```
npm run dev
```

#### Exécuter les tests fonctionnels

TODO : Les tests fonctionnels étaient en service jusqu'à la version 1.0. Ils nécessiteraient d'être mis à jour pour tenir compte de l'implémentation de l'authentification des utilisateurs et la gestions des autorisations. Il s'agirait donc d'ajouter une header Authorization dans toutes les requêtes faîtes sur l'API pour que cela fonctionne. Par ailleurs la création d'une base de données dédiées pour les tests serait à créer. Il serait ainsi pertinent d'utiliser le fichier .env pour indiquer l'adresse de cette base de données dédiée.

De nombreux tests fonctionnels ont été créés pour s'assurer du bon fonctionnement l'application. Ils utilisent le syntaxe jest et superdev qui sont les deux frameworks les plus populaires pour la gestion des tests fonctionnels en javascript.

```
npm run test
```

Des fonctionnalités permettent de calculer la couverture de code des tests qui servent à faire le badge en haut de ce texte. Voir le package.json pour en savoir plus.

## Documentation de l'API

Tous les endpoints sont décrits grâce à Swagger. L'API publique est disponible ici : https://app.swaggerhub.com/apis-docs/agrarian-systems/Endagri/1.0.0

## Déploiement

Cette partie n'explique pas le déploiement de la base de données. L'application est écrit en ES6 et doit donc être transpilée en javascript. Ceci est réalisé avec babel. La fonctionnalité de mise en production est très simple.

```
npm run build
```

Ceci a pour effet de créer un dossier build qui contient le code de production a déployer.
Il est ensuite possible de lancer la version prod grâce à la commande suivante.

```
npm run start
```

Si vous souhaitez comprendre exactement ce que font les commande,s il suffit d'ouvrir le package.json

Il est également possible d'utiliser nodem

## Built With

- [Express](https://expressjs.com/fr/) - Le framework utilisé pour construire l'API
