const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
const loginValidations = require('./loginValidations');

app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

app.get('/talker', async (_req, res) => {
  const response = await fs.readFile('./talker.json', 'utf8');
  const data = JSON.parse(response);
  if (data.length === 0) return res.status(200).json([]);
  
  res.status(200).json(data);
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const response = await fs.readFile('./talker.json', 'utf8');
  const data = JSON.parse(response);
  const talkerById = data.find((talker) => +talker.id === +id);

  if (!talkerById) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });

  res.status(200).json(talkerById);
});

app.post('/login', loginValidations, (_req, res) => {
  const token = crypto.randomBytes(8).toString('hex');

  res.status(200).json({ token });
});