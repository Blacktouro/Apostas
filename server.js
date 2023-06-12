const express = require('express');
const fs = require('fs');
const ExcelJS = require('exceljs');
const XlsxPopulate = require('xlsx-populate');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');


// Configuração do Express.js
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página de login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rota para o processamento do formulário de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Verificar as informações de login (você deve substituir esta parte com a lógica do seu banco de dados)
  if (username === 'andre' && password === '1234') {
    const dashboardPath = path.resolve(__dirname, 'Desktop', 'apostas', 'public', 'testapos.html');
    res.sendFile(dashboardPath); // Envia o arquivo HTML do dashboard após o login bem-sucedido
  } else {
    res.send('Credenciais inválidas. Por favor, tente novamente.');
  }
});

app.use(express.static('public')); // Define a pasta 'public' como pasta raiz para servir arquivos estáticos
app.use(express.urlencoded({ extended: true })); // Middleware para processar dados de formulário

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/testapos.html'); // Envia o arquivo HTML para o cliente
});

app.post('/criar-arquivo', async (req, res) => {
  const data = new Date();
  const fileName = 'apostas_' + data.toISOString() + '.xlsx';

  // Obtenha as informações das apostas do banco de dados ou de onde você as armazena
  // Substitua esta parte com o código apropriado para obter as informações das apostas
  const apostas = []; // Supondo que você tenha um array de apostas

  // Capture os dados introduzidos no HTML
  const novaAposta = {
    data: req.body['data-input'],
    liga: req.body['liga-input'],
    equipa: req.body['equipa-input'],
    odd: parseFloat(req.body['odd-input']),
    valorApostado: parseFloat(req.body['porcentagem-input']),
    resultado: req.body['tipo-aposta-select'],
  };

  // Adicione a nova aposta ao array de apostas
  apostas.push(novaAposta);

  // Crie um novo arquivo Excel
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Minhas Apostas');

  // Defina o cabeçalho das colunas
  worksheet.columns = [
    { header: 'Data', key: 'data', width: 12 },
    { header: 'Liga', key: 'liga', width: 20 },
    { header: 'Equipa', key: 'equipa', width: 20 },
    { header: 'Odd', key: 'odd', width: 10 },
    { header: 'Valor Apostado', key: 'valorApostado', width: 16 },
    { header: 'Resultado', key: 'resultado', width: 12 },
  ];

  // Adicione as linhas com os dados das apostas
  for (let i = 0; i < apostas.length; i++) {
    const aposta = apostas[i];

    worksheet.addRow({
      data: aposta.data,
      liga: aposta.liga,
      equipa: aposta.equipa,
      odd: aposta.odd.toFixed(2),
      valorApostado: aposta.valorApostado.toFixed(2),
      resultado: aposta.resultado === null ? '-' : aposta.resultado,
    });
  }

  // Salve o arquivo Excel na pasta 'public'
  const filePath = 'public/' + fileName;
  await workbook.xlsx.writeFile(filePath);

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erro ao criar o arquivo.');
    } else {
      // Exclua o arquivo após o download
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
  });
});


app.use(express.static('public')); // Define a pasta 'public' como pasta raiz para servir arquivos estáticos
app.use(express.urlencoded({ extended: true })); // Middleware para processar dados de formulário

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/testapos.html'); // Envia o arquivo HTML para o cliente
});

app.post('/criar-arquivo', async (req, res) => {
  const data = new Date();
  const fileName = 'apostas_' + data.toISOString() + '.ods';

  // Obtenha as informações das apostas do banco de dados ou de onde você as armazena
  // Substitua esta parte com o código apropriado para obter as informações das apostas
  const apostas = []; // Supondo que você tenha um array de apostas

  // Capture os dados introduzidos no HTML
  const novaAposta = {
    data: req.body['data-input'],
    liga: req.body['liga-input'],
    equipa: req.body['equipa-input'],
    odd: parseFloat(req.body['odd-input']),
    valorApostado: parseFloat(req.body['porcentagem-input']),
    resultado: req.body['tipo-aposta-select'],
  };

  // Adicione a nova aposta ao array de apostas
  apostas.push(novaAposta);

  // Crie um novo arquivo .ods
  const workbook = await XlsxPopulate.fromBlankAsync();
  const worksheet = workbook.sheet(0);
  
  // Defina o cabeçalho das colunas
  worksheet.cell("A1").value("Data");
  worksheet.cell("B1").value("Liga");
  worksheet.cell("C1").value("Equipa");
  worksheet.cell("D1").value("Odd");
  worksheet.cell("E1").value("Valor Apostado");
  worksheet.cell("F1").value("Resultado");

  // Adicione as linhas com os dados das apostas
  for (let i = 0; i < apostas.length; i++) {
    const aposta = apostas[i];
    
    worksheet.cell("A" + (i + 2)).value(aposta.data);
    worksheet.cell("B" + (i + 2)).value(aposta.liga);
    worksheet.cell("C" + (i + 2)).value(aposta.equipa);
    worksheet.cell("D" + (i + 2)).value(aposta.odd.toFixed(2));
    worksheet.cell("E" + (i + 2)).value(aposta.valorApostado.toFixed(2));
    worksheet.cell("F" + (i + 2)).value(aposta.resultado);
  }

  // Salve o arquivo na pasta 'public'
  workbook.toFileAsync('public/' + fileName)
    .then(() => {
      res.download(__dirname + '/public/' + fileName, (err) => {
        if (err) {
          console.error(err);
        } else {
          // Exclua o arquivo após o download
          fs.unlink('public/' + fileName, (err) => {
            if (err) {
              console.error(err);
            }
          });
        }
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Erro ao criar o arquivo.');
    });
});

const port = 3000; // Porta em que o servidor será executado
app.listen(port, () => {
  console.log('Servidor está escutando na porta ' + port);
});

