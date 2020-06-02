DROP DATABASE IF EXISTS endagri;

CREATE DATABASE endagri OWNER adminendagri;

------------------------------------------------------------------

-- Schéma Fiche

CREATE SCHEMA IF NOT EXISTS fiche AUTHORIZATION adminendagri;

-- Table: fiche.fiche_technique

-- DROP TABLE fiche.fiche_technique;

CREATE TABLE fiche.fiche_technique -- Table des fiches techniques
(
  id serial unique NOT NULL, -- Identifiant unique
  id_production bigint NOT NULL, -- 
  id_utilisateur bigint NOT NULL, -- 
  libelle character varying(255) NOT NULL, -- 
  ini_debut integer, -- 
  ini_fin integer, -- 
  commentaire character varying DEFAULT NULL, -- 
  CONSTRAINT fiche_technique_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE fiche.fiche_technique OWNER TO adminendagri;

CREATE INDEX fiche_technique_id_idx ON fiche.fiche_technique(id);

-- Table: fiche.activite

-- DROP TABLE fiche.activite;

CREATE TABLE fiche.activite -- Table des Activités
(
  id serial unique NOT NULL, -- Identifiant unique
  id_fiche_technique bigint NOT NULL, -- 
  libelle character varying(500), -- 
  mois integer, -- 
  mois_relatif integer, -- 
  commentaire character varying, -- 
  CONSTRAINT activite_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE fiche.activite OWNER TO adminendagri;

CREATE INDEX activite_id_idx ON fiche.activite(id);

-- Table: fiche.depense

-- DROP TABLE fiche.depense;

CREATE TABLE fiche.depense -- Table des Dépenses
(
  id serial unique NOT NULL, -- Identifiant unique
  id_activite bigint NOT NULL, -- 
  libelle character varying(500), -- 
  Montant integer, -- 
  CONSTRAINT depense_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE fiche.depense OWNER TO adminendagri;

CREATE INDEX depense_id_idx ON fiche.depense(id);

-- Table: fiche.vente

-- DROP TABLE fiche.vente;

CREATE TABLE fiche.vente -- Table des Ventes
(
  id serial unique NOT NULL, -- Identifiant unique
  id_fiche_technique bigint NOT NULL, -- 
  id_marche bigint NOT NULL, -- 
  rendement numeric(15,6) NOT NULL, -- 
  rendement_min numeric(15,6) DEFAULT NULL, -- 
  rendement_max numeric(15,6) DEFAULT NULL, -- 
  mois integer, -- 
  mois_relatif integer, -- 
  CONSTRAINT vente_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE fiche.vente OWNER TO adminendagri;

CREATE INDEX vente_id_idx ON fiche.vente(id);

-- Table: fiche.produit

-- DROP TABLE fiche.produit;

CREATE TABLE fiche.produit -- Table des produits
(
  id serial unique NOT NULL, -- Identifiant unique
  id_production bigint NOT NULL, -- 
  libelle character varying(255), -- 
  unite character varying(50), -- 
  CONSTRAINT produit_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE fiche.produit OWNER TO adminendagri;

CREATE INDEX produit_id_idx ON fiche.produit(id);

-- Table: fiche.production

-- DROP TABLE fiche.production;

CREATE TABLE fiche.production -- Table des productions
(
  id serial unique NOT NULL, -- Identifiant unique
  libelle character varying(500), -- 
  type_production character varying(255), -- 
  CONSTRAINT production_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE fiche.production OWNER TO adminendagri;

CREATE INDEX production_id_idx ON fiche.production(id);

-- Table: fiche.marche

-- DROP TABLE fiche.marche;

CREATE TABLE fiche.marche -- Table des marches
(
  id serial unique NOT NULL, -- Identifiant unique
  id_produit bigint NOT NULL, --
  type_marche character varying(255), -- 
  localisation character varying(500), -- 
  prix_january numeric(15,6), --  
  prix_february numeric(15,6), --  
  prix_march numeric(15,6), --  
  prix_abril numeric(15,6), --  
  prix_may numeric(15,6), --  
  prix_june numeric(15,6), --  
  prix_july numeric(15,6), --  
  prix_august numeric(15,6), --  
  prix_september numeric(15,6), --  
  prix_october numeric(15,6), --  
  prix_november numeric(15,6), --  
  prix_december numeric(15,6), --  
  commentaire character varying DEFAULT NULL, --  
  CONSTRAINT marche_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE fiche.marche OWNER TO adminendagri;

CREATE INDEX marche_id_idx ON fiche.marche(id);

------------------------------------------------------------------

-- Schéma analyse_fiche

CREATE SCHEMA IF NOT EXISTS analyse_fiche AUTHORIZATION adminendagri;

-- Table: analyse_fiche.fiche_technique_libre

-- DROP TABLE analyse_fiche.fiche_technique_libre;

CREATE TABLE analyse_fiche.fiche_technique_libre -- Table des fiche_technique_libres
(
  id serial unique NOT NULL, -- Identifiant unique
  id_fiche_technique bigint NOT NULL, --
  id_parcelle bigint NOT NULL, --
  id_analyse_tresorie bigint NOT NULL, -- 
  rendement_culture numeric(15,6), -- 
  part_familiale numeric(15,6), -- 
  autoconsommation numeric(15,6), -- 
  nombre_meres_reproductrices integer, -- 
  nombre_animaux_engraisses integer, -- 
  mois_debut timestamp without time zone, --  
  CONSTRAINT fiche_technique_libre_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE analyse_fiche.fiche_technique_libre OWNER TO adminendagri;

CREATE INDEX fiche_technique_libre_id_idx ON analyse_fiche.fiche_technique_libre(id);

-- Table: analyse_fiche.depense_exploitation

-- DROP TABLE analyse_fiche.depense_exploitation;

CREATE TABLE analyse_fiche.depense_exploitation -- Table des depense_exploitations
(
  id serial unique NOT NULL, -- Identifiant unique
  id_analyse_tresorie bigint NOT NULL, --
  libelle character varying(500), -- 
  montant numeric(15,6), -- 
  mois timestamp without time zone, --  
  CONSTRAINT depense_exploitation_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE analyse_fiche.depense_exploitation OWNER TO adminendagri;

CREATE INDEX depense_exploitation_id_idx ON analyse_fiche.depense_exploitation(id);

-- Table: analyse_fiche.intraconsommation

-- DROP TABLE analyse_fiche.intraconsommation;

CREATE TABLE analyse_fiche.intraconsommation -- Table des intraconsommations
(
  id serial unique NOT NULL, -- Identifiant unique
  id_fiche_technique_libre bigint NOT NULL, --
  id_vente bigint NOT NULL, --
  id_depense bigint NOT NULL, --
  libelle character varying(500), -- 
  part numeric(15,6), -- 
  CONSTRAINT intraconsommation_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE analyse_fiche.intraconsommation OWNER TO adminendagri;

CREATE INDEX intraconsommation_id_idx ON analyse_fiche.intraconsommation(id);

-- Table: analyse_fiche.client

-- DROP TABLE analyse_fiche.client;

CREATE TABLE analyse_fiche.client -- Table des clients
(
  id serial unique NOT NULL, -- Identifiant unique
  id_utilisateur bigint NOT NULL, --
  nom character varying(255), -- 
  prenom character varying(255), -- 
  CONSTRAINT client_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE analyse_fiche.client OWNER TO adminendagri;

CREATE INDEX client_id_idx ON analyse_fiche.client(id);

-- Table: analyse_fiche.analyse_tresorie

-- DROP TABLE analyse_fiche.analyse_tresorie;

CREATE TABLE analyse_fiche.analyse_tresorie -- Table des analyse_tresories
(
  id serial unique NOT NULL, -- Identifiant unique
  id_client bigint NOT NULL, --
  id_utilisateur bigint NOT NULL, --
  date_creation timestamp without time zone, --  
  CONSTRAINT analyse_tresorie_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE analyse_fiche.analyse_tresorie OWNER TO adminendagri;

CREATE INDEX analyse_tresorie_id_idx ON analyse_fiche.analyse_tresorie(id);

----------------------------------------------------------

-- INSERT fiche.vente

INSERT INTO fiche.vente(id,id_fiche_technique,id_marche,rendement,rendement_max,mois_relatif) VALUES(DEFAULT,1,1,80,100,5);
INSERT INTO fiche.vente(id,id_fiche_technique,id_marche,rendement,rendement_max,mois_relatif) VALUES(DEFAULT,2,2,19,22,3);
INSERT INTO fiche.vente(id,id_fiche_technique,id_marche,rendement,rendement_max,mois) VALUES(DEFAULT,3,3,9.6,12,10);

-- INSERT fiche.marche

INSERT INTO fiche.marche(id,id_produit,type_marche,localisation,prix_juillet,prix_aout) VALUES(DEFAULT,24,'Vente usine','Mjez',170,170);
INSERT INTO fiche.marche(id,id_produit,type_marche,localisation,prix_juin,prix_juillet,prix_aout) VALUES(DEFAULT,22,'Vente au centre urbain','Mjez',1000,1100,1300);

-- INSERT fiche.fiche_technique

INSERT INTO fiche.fiche_technique(id,id_utilisateur,id_production,libelle,ini_debut,ini_fin) VALUES(DEFAULT,1,24,'Tomate de saison (Mgez)',3,4);
INSERT INTO fiche.fiche_technique(id,id_utilisateur,id_production,libelle,ini_debut,ini_fin) VALUES(DEFAULT,1,22,'Pomme de terre de saison été (Mgez)',1,2);
INSERT INTO fiche.fiche_technique(id,id_utilisateur,id_production,libelle) VALUES(DEFAULT,1,33,'Grenadiers moyenne production (Mjez)');
INSERT INTO fiche.fiche_technique(id,id_utilisateur,id_production,libelle) VALUES(DEFAULT,1,33,'Grenadiers phase immature (Mjez)');

-- INSERT fiche.depense

INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,1,'Tracteur',120);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,2,'Tracteur',60);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,3,'Tracteur',30);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,4,'Main d''œuvre',45);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,4,'Fumier',100);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,5,'Main d''œuvre',45);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,5,'Engrais',156);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,6,'Main d''œuvre',45);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,6,'Engrais',62);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,7,'Main d''œuvre',300);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,7,'Semences et Plants',1125);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,8,'Main d''œuvre',300);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,9,'Engrais',124);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,10,'Engrais',50);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,11,'Main d''œuvre',100);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,11,'Traitement phytosanitaire',540);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,12,'Engrais',50);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,13,'Engrais',85);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,14,'Engrais',63);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,15,'Engrais',40);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,16,'Main d''œuvre',100);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,16,'Traitement phytosanitaire',750);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,17,'Engrais',125);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,18,'Engrais',25);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,19,'Main d''œuvre',100);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,19,'Traitement phytosanitaire',480);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,20,'Main d''œuvre',45);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,20,'Main d''œuvre',210);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,22,'Main d''œuvre',750);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,23,'Divers',96);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,24,'Tracteur',120);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,25,'Tracteur',60);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,26,'Tracteur',30);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,27,'Main d''œuvre',30);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,28,'Main d''œuvre',30);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,29,'Main d''œuvre',30);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,30,'Main d''œuvre',150);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,31,'Main d''œuvre',300);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,34,'Main d''œuvre',30);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,35,'Tracteur',40);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,37,'Main d''œuvre',30);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,40,'Main d''œuvre',300);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,41,'Main d''œuvre',375);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,42,'Tracteur',60);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,27,'Fumier',125);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,28,'Engrais',78);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,29,'Engrais',93);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,30,'Semences et Plants',10500);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,32,'Engrais',85);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,33,'Engrais',50);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,34,'Traitement phytosanitaire',250);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,36,'Engrais',50);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,37,'Traitement phytosanitaire',500);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,38,'Engrais',100);
INSERT INTO fiche.depense(id,id_activite,libelle,montant) VALUES(DEFAULT,39,'Engrais',250);

-- INSERT fiche.activite

INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Labour','tracteur par sok',-5);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Labour','tracteur refsette',-2);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Labour','tracteur kindielle',-1);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Fertilisation','fumee',0);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Fertilisation','fasfate super 45',0);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Fertilisation','dap',0);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Semis','plantation',0);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Labour','binage',1);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Fertilisation','dap',1);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Fertilisation','amoniter',1);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Traitement phytosanitaire','pelicar (insecte)',2);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Fertilisation','13-40-13',2);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Fertilisation','acid amenique',3);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Fertilisation','maniziome',3);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Fertilisation','kalsiome',3);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Traitement phytosanitaire','traitement de fleur',3);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Fertilisation','potase',4);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Fertilisation','amoniter',4);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Traitement phytosanitaire','massi (hsida)',4);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Traitement phytosanitaire','bakhara',4);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Irrigation','bakhara',5);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Récolte','',5);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,1,'Transport','',5);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,2,'Labour','tracteur sok',-4);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,2,'Labour','tracteur offcette',-3);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,2,'','tracteur kindielle',-2);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,2,'Fertilisation','fume',-1);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,2,'Fertilisation','fasfate sup45',-1);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,2,'Fertilisation','dap',-1);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,2,'Semis','POMME DE TERRE',0);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,2,'Labour','tahmir',1);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,2,'Fertilisation','acid amenique',1);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,2,'Fertilisation','maniziome',1);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,2,'Traitement phytosanitaire','meldio',1);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,2,'Labour','tahmir',1);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,2,'Fertilisation','kalsiome',1);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,2,'Traitement phytosanitaire','meldio',2);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,2,'Fertilisation','amonitre',2);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,2,'Fertilisation','potas',3);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,2,'Labour','tahmir',3);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,2,'Récolte','recolte/mo',3);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,2,'Récolte','recolte/tracteur',3);
INSERT INTO fiche.activite(id,id_fiche_technique,libelle,commentaire,mois_relatif) VALUES(DEFAULT,2,'Irrigation','irregation',4);


-- INSERT fiche.produit

INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'1','Ail','kg');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'2','Grains d''avoine','quintal');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'2','Paille d''avoine','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'3','Grains de blé dur','quintal');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'3','Paille de blé dur','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'4','Grains de blé tendre','quintal');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'4','Paille de blé tendre','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'5','Blettes','kg');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'6','Graines de colza','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'7','Epices','kg');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'8','Epinards','kg');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'9','Fenouil','kg');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'10','Féverolles','kg');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'11','Fèves','kg');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'12','Gombo','kg');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'13','Melon','kg');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'14','Mloukhia','kg');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'15','Oignons','kg');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'16','Grains d''orge','quintal');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'16','Paille d''orge','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'17','Pastèques','kg');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'18','Persil','kg');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'19','Petits pois','kg');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'20','Piments','kg');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'21','Pois chiche','kg');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'22','Pommes de terres','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'23','Radis','kg');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'24','Tomate','kg');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'25','Graines de tournesol','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'26','Grains de triticale','quintal');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'6','Paille de triticale','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'27','Abricots','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'28','Amandes','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'29','Artichaut','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'30','Citrons','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'31','Figues','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'32','Fraises','kg');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'33','Grenades','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'34','Mandarines','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'35','Olives','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'36','Oranges maltaises','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'37','Oranges Thomson','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'38','Pêches','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'39','Poires','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'40','Pommes','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'41','Prunes','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'42','Raisins de table','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'43','Raisins pour vin','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'44','Lait','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'44','Fumier','tonne');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'44','Veaux','unité');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'44','Génisses','unité');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'44','Vaches de réforme','unité');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'44','Femelles adultes','unité');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'44','Mâles adultes','unité');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'45','Agneaux','unité');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'45','Agnelles','unité');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'45','Brebis','unité');
INSERT INTO fiche.produit(id,id_production,libelle,unite) VALUES(DEFAULT,'45','Mouton','unité');

-- INSERT fiche.production

INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Ail','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Avoine','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Blé dur','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Blé tendre','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Blette','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Colza','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Epices','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Epinard','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Fenouil','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Feverolles','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Feves','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Gombo','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Melon','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Mloukhia','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Oignon','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Orge','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Pastèque','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Persil','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Petit pois','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Piment','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Pois chiche','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Pomme de terre','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Radis','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Tomate','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Tournesol','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Triticale','Culture annuelle');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Abricots','Culture pérenne');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Amandes','Culture pérenne');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Artichaut','Culture pérenne');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Citrons','Culture pérenne');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Figues','Culture pérenne');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Fraises','Culture pérenne');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Grenades','Culture pérenne');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Mandarines','Culture pérenne');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Olives','Culture pérenne');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Oranges Maltaise','Culture pérenne');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Oranges thomson','Culture pérenne');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Pêches','Culture pérenne');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Poires','Culture pérenne');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Pommes','Culture pérenne');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Prunes','Culture pérenne');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Raisins de table','Culture pérenne');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Raisins pour vin','Culture pérenne');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Bovin laitier','Elevage naisseur laitier');
INSERT INTO fiche.production(id,libelle,type_production) VALUES(DEFAULT,'Ovins viande','Elevage naisseur viande');