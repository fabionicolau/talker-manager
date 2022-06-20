const fs = require('fs').promises;

const readFile = async () => {
  const response = await fs.readFile('./talker.json', 'utf8');
  const data = JSON.parse(response);
  return data;
};

const writeFile = async (data) => {
  await fs.writeFile('./talker.json', JSON.stringify(data));
};

module.exports = { readFile, writeFile };