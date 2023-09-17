const { listarContas, criarConta, atualizarConta, excluirConta, depositarSaldo, sacarSaldo, transferirSaldo, saldoConta, extrato } = require("./controladores/controladores");
const validaSenha = require('../src/intermediario/intermediarios')
const express = require('express');

const rotas = express();

rotas.get('/contas', validaSenha, listarContas);
rotas.post('/contas', criarConta);
rotas.put('/contas/:numeroConta/usuario', atualizarConta);
rotas.delete('/contas/:numeroConta', excluirConta);
rotas.post('/transacoes/depositar', depositarSaldo);
rotas.post('/transacoes/sacar', sacarSaldo);
rotas.post('/transacoes/transferir', transferirSaldo);
rotas.get('/contas/saldo', saldoConta);
rotas.get('/contas/extrato', extrato);

module.exports = rotas;