// backendserver.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'https://localhost:8080'
}));

mongoose.connect('mongodb://localhost:27017/myapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Błąd połączenia z MongoDB:'));
db.once('open', () => {
    console.log('Połączono z bazą danych MongoDB.');
});

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
const User = mongoose.model('User', userSchema);

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Błąd pobierania użytkowników:', error);
    res.status(500).json({ message: 'Błąd serwera.' });
  }
});


app.use(bodyParser.json());

app.post('/api/users', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Użytkownik już istnieje.' });
        }

        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: 'Użytkownik utworzony pomyślnie.' });
    
    } catch (error) {
        console.error('Błąd podczas tworzenia użytkownika:', error);
        res.status(500).json({ message: 'Wystąpił błąd podczas tworzenia użytkownika.' });
    }
});


app.listen(PORT, () => {
    console.log(`Serwer nasłuchuje na porcie ${PORT}.`);
});
