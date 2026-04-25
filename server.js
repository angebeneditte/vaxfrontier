require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Connexion à MongoDB (utilise la variable d'environnement sur Render)
const MONGO_URI = process.env.MONGO_URI || "ton_lien_mongodb_de_test_si_besoin";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connecté à MongoDB Atlas'))
  .catch(err => console.error('❌ Erreur de connexion:', err));

// Schéma des données
const vaccinationSchema = new mongoose.Schema({
    nomEnfant: String,
    age: Number,
    vaccin: String,
    region: String,
    ville: String,
    contexte: String, // ROUTINE ou CAMPAGNE
    hopital: String,
    date: { type: Date, default: Date.now }
});

const Vaccination = mongoose.model('Vaccination', vaccinationSchema);

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GESTION DES FICHIERS STATIQUES (Dossier public)
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ROUTE API : Enregistrer une vaccination
app.post('/api/vacciner', async (req, res) => {
    try {
        const nouvelleVaccination = new Vaccination(req.body);
        await nouvelleVaccination.save();
        res.status(201).send('<h1>Succès !</h1><p>La vaccination a été enregistrée.</p><a href="/">Retour</a>');
    } catch (error) {
        res.status(400).send("Erreur lors de l'enregistrement : " + error.message);
    }
});

// ROUTE API : Récupérer les statistiques pour le dashboard
app.get('/api/statistiques', async (req, res) => {
    try {
        const donnees = await Vaccination.find();
        res.json(donnees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DÉMARRAGE DU SERVEUR
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
