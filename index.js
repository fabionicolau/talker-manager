const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();

const { readFile, writeFile } = require('./helpers/readWriteFile');
const {
  validateLogin,
  tokenValidation,
  nameValidation,
  ageValidation,
  talkValidation,
  watchedAtValidation,
  rateValidation } = require('./middlewares/validations');

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
  const data = await readFile();
  if (data.length === 0) return res.status(200).json([]);
  
  res.status(200).json(data);
});

app.get('/talker/search', tokenValidation, async (req, res) => {
  const { q } = req.query;
  const data = await readFile();
  const talkers = data.filter((talker) => talker.name.toLowerCase().includes(q.toLowerCase()));

  if (!q) return res.status(200).json(data);
  if (!talkers) return res.status(200).json([]);

  res.status(200).json(talkers);
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const data = await readFile();
  const talkerById = data.find((talker) => +talker.id === +id);

  if (!talkerById) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });

  res.status(200).json(talkerById);
});

app.post('/login', validateLogin, (_req, res) => {
  const token = crypto.randomBytes(8).toString('hex');

  res.status(200).json({ token });
});

app.post('/talker',
  tokenValidation,
  nameValidation,
  ageValidation,
  talkValidation,
  watchedAtValidation,
  rateValidation,
  async (req, res) => {
  const data = await readFile();
  const { name, age, talk: { watchedAt, rate } } = req.body;
  data.push({ id: data.length + 1, name, age, talk: { watchedAt, rate } });
  await writeFile(data);

  res.status(201).json({
    id: data.length,
    name, 
    age, 
    talk: { 
      watchedAt, 
      rate, 
    },
  });
});

app.put('/talker/:id',
  tokenValidation,
  nameValidation,
  ageValidation,
  talkValidation,
  watchedAtValidation,
  rateValidation,
  async (req, res) => {
  const { id } = req.params;
  const data = await readFile();
  const { name, age, talk: { watchedAt, rate } } = req.body;
  const talkerIndex = data.findIndex((talker) => +talker.id === +id);

  data[talkerIndex] = { name, age, id: +id, talk: { watchedAt, rate } };
  await writeFile(data);

  res.status(200).json({ name, age, id: +id, talk: { watchedAt, rate } });
});

app.delete('/talker/:id', tokenValidation, async (req, res) => {
  const { id } = req.params;
  const data = await readFile();
  const talkerIndex = data.findIndex((talker) => +talker.id === +id);
  data.splice(talkerIndex, 1);
  await writeFile(data);

  res.status(204).end();
});
