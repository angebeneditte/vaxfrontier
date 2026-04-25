require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// --- 1. CONFIGURATION DU SERVEUR ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Rendre le dossier public accessible

// --- 2. CONNEXION À LA BASE DE DONNÉES ---
// ⚠️ ATTENTION : Remplace <TON_MOT_DE_PASSE> par le vrai mot de passe de ton utilisateur MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Kenmogne_Ange:Angieluz2007@tp-inf232.us83osh.mongodb.net/?appName=TP-INF232";

mongoose.connect(MONGO_URI)
    .then(() => console.log("Connecté à MongoDB Atlas ! ✅"))
    .catch(err => console.error("Erreur de connexion ❌", err));

// --- 3. MODÈLE DE DONNÉES (Ce qu'on enregistre) ---
const Vaccination = mongoose.model('Vaccination', {
    nomEnfant: String,
    dateNaissance: Date,
    region: String,
    ville: String,
    quartier: String,
    typeVaccin: String,
    contexte: String,
    hopital: String, // Ce champ sera rempli uniquement si c'est "ROUTINE"
    dateEnregistrement: { type: Date, default: Date.now }
});

// --- 4. ROUTES (Le trafic web) ---

// Quand on tape l'adresse de base, on affiche l'accueil
app.get('/api/statistiques', async (req, res) => {
    try {
        const donnees = await Vaccination.find(); // On récupère TOUT
        res.json(donnees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Quand le formulaire est envoyé
app.post('/ajouter-vaccin', async (req, res) => {
    try {
        // On crée une nouvelle entrée avec les données reçues
        const nouvelleVax = new Vaccination(req.body);
        
        // On sauvegarde dans MongoDB
        await nouvelleVax.save();
        
        // On affiche la belle page de succès
        res.send(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Succès</title>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; background: #f4f7f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                    .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; max-width: 450px; }
                    .icon { font-size: 70px; margin-bottom: 15px; }
                    h1 { color: #27ae60; margin-top: 0; }
                    p { color: #555; font-size: 16px; line-height: 1.5; }
                    .btn-group { margin-top: 25px; }
                    a { display: inline-block; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 5px; transition: 0.3s; }
                    .btn-home { background: #2c3e50; color: white; border: 2px solid #2c3e50; }
                    .btn-home:hover { background: white; color: #2c3e50; }
                    .btn-new { background: #27ae60; color: white; border: 2px solid #27ae60; }
                    .btn-new:hover { background: white; color: #27ae60; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="icon">✅</div>
                    <h1>Vaccination Enregistrée !</h1>
                    <p>Les données de <strong>${req.body.nomEnfant}</strong> ont été sécurisées dans la base de données centrale pour la région <strong>${req.body.region}</strong>.</p>
                    <div class="btn-group">
                        <a href="/" class="btn-home">🏠 Menu Principal</a>
                        <a href="/collecte.html" class="btn-new">💉 Autre Saisie</a>
                    </div>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        // En cas d'erreur (ex: perte de connexion)
        res.status(500).send("Erreur lors de l'enregistrement : " + error.message);
    }
});

// --- 5. LANCEMENT DU SERVEUR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur VaxFrontier actif sur http://localhost:${PORT}`);
});
