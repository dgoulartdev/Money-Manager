let { contas, saques, depositos, transferencias } = require('../bancodedados')

const listarContas = (req, res) => {
    return res.json(contas)
}

const criarConta = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    const camposObrigatorios = ['nome', 'cpf', 'data_nascimento', 'telefone', 'email', 'senha'];

    for (const campo of camposObrigatorios) {
        if (!req.body[campo]) {
            return res.status(400).json({ mensagem: `${campo.charAt(0).toUpperCase() + campo.slice(1)} é obrigatório!` });
        }
    };

    let id = 1;
    if (contas.length > 0) {
        const ultimaConta = contas[contas.length - 1];
        id = ultimaConta.numero + 1
    };

    const novaConta = {
        numero: id,
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    }

    const contaExistente = contas.find((conta) =>
        conta.usuario.cpf === novaConta.usuario.cpf || conta.usuario.email === novaConta.usuario.email
    )

    if (contaExistente) {
        return res.status(400).json({ mensagem: 'Já existe uma conta com o CPF ou e-mail informado!' });
    }

    contas.push(novaConta);
    return res.status(201).json(contas);

};


const atualizarConta = (req, res) => {
    const camposObrigatorios = ['nome', 'cpf', 'data_nascimento', 'telefone', 'email', 'senha'];

    for (const campo of camposObrigatorios) {
        if (!req.body[campo]) {
            return res.status(400).json({ mensagem: `${campo.charAt(0).toUpperCase() + campo.slice(1)} é obrigatório!` });
        }
    }

    const numeroConta = parseInt(req.params.numeroConta);
    const contaExistente = contas.find((conta) => conta.numero === numeroConta);
    if (!contaExistente) {
        return res.status(404).json({ mensagem: 'Conta bancária não encontrada!' });
    }

    const cpfExistente = contas.find((conta) => conta.usuario.cpf === req.body.cpf && conta.numero !== numeroConta);
    if (cpfExistente) {
        return res.status(400).json({ mensagem: 'O CPF informado já existe cadastrado em outra conta!' });
    }

    const emailExistente = contas.find((conta) => conta.usuario.email === req.body.email && conta.numero !== numeroConta);
    if (emailExistente) {
        return res.status(400).json({ mensagem: 'O E-mail informado já existe cadastrado em outra conta!' });
    }

    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
    const usuarioAtualizado = {
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha
    };
    contaExistente.usuario = usuarioAtualizado;

    return res.status(204).send();
};

const excluirConta = (req, res) => {

    const numeroConta = parseInt(req.params.numeroConta);
    const contaExistenteIndex = contas.findIndex((conta) => conta.numero === numeroConta);

    if (contaExistenteIndex === -1) {
        return res.status(404).json({ mensagem: 'Conta bancária não encontrada!' });
    }

    if (contas[contaExistenteIndex].saldo !== 0) {
        return res.status(400).json({ mensagem: 'A conta só pode ser removida se o saldo for zero!' });
    }

    contas.splice(contaExistenteIndex, 1);
    return res.status(204).send();
};

const depositarSaldo = (req, res) => {
    const { numero_conta, valor } = req.body;

    if (!numero_conta || !valor) {
        return res.status(400).json({ mensagem: 'O número da conta e o valor são obrigatórios!' });
    }

    const numeroConta = parseInt(numero_conta);
    const contaExistente = contas.find((conta) => conta.numero === numeroConta);

    if (!contaExistente) {
        return res.status(404).json({ mensagem: 'Conta bancária não encontrada!' });
    }

    if (valor <= 0) {
        return res.status(400).json({ mensagem: 'O valor do depósito deve ser maior que zero!' });
    }

    contaExistente.saldo += valor;

    const dataTransacao = new Date().toLocaleString();
    const transacao = {
        data: dataTransacao,
        numero_conta: numeroConta,
        valor: valor
    };

    depositos.push(transacao);
    return res.status(204).send();
};

const sacarSaldo = (req, res) => {
    const { numero_conta, valor, senha } = req.body;

    if (!numero_conta || !valor || !senha) {
        return res.status(400).json({ mensagem: 'O número da conta, o valor do saque e a senha são obrigatórios!' });
    }

    const numeroConta = parseInt(numero_conta);
    const contaExistente = contas.find((conta) => conta.numero === numeroConta);

    if (!contaExistente) {
        return res.status(404).json({ mensagem: 'Conta bancária não encontrada!' });
    }

    if (contaExistente.usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'Senha incorreta!' });
    }

    if (valor <= 0 || valor > contaExistente.saldo) {
        return res.status(400).json({ mensagem: 'Saldo insuficiente ou valor de saque inválido!' });
    }

    contaExistente.saldo -= valor;

    const dataTransacao = new Date().toLocaleString();
    const transacao = {
        data: dataTransacao,
        numero_conta: numeroConta,
        valor: valor
    };

    saques.push(transacao);

    return res.status(204).send();
};

const transferirSaldo = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
        return res.status(400).json({ mensagem: 'O número da conta de origem, o número da conta de destino, a senha e o valor da transferência são obrigatórios!' });
    }

    const numeroContaOrigem = parseInt(numero_conta_origem);
    const contaOrigem = contas.find((conta) => conta.numero === numeroContaOrigem);

    if (!contaOrigem) {
        return res.status(404).json({ mensagem: 'Conta bancária de origem não encontrada!' });
    }

    const numeroContaDestino = parseInt(numero_conta_destino);
    const contaDestino = contas.find((conta) => conta.numero === numeroContaDestino);

    if (!contaDestino) {
        return res.status(404).json({ mensagem: 'Conta bancária de destino não encontrada!' });
    }

    if (contaOrigem.usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'Senha incorreta!' });
    }

    if (valor <= 0 || valor > contaOrigem.saldo) {
        return res.status(400).json({ mensagem: 'Saldo insuficiente ou valor de transferência inválido!' });
    }

    contaOrigem.saldo -= valor;
    contaDestino.saldo += valor;

    const dataTransacao = new Date().toLocaleString();
    const transacao = {
        data: dataTransacao,
        numero_conta_origem: numeroContaOrigem,
        numero_conta_destino: numeroContaDestino,
        valor: valor
    }

    transferencias.push(transacao);

    return res.status(204).send();
}

const saldoConta = (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: 'O número da conta e a senha são obrigatórios!' });
    }

    const contaExistente = contas.find((conta) => conta.numero === parseInt(numero_conta));

    if (!contaExistente) {
        return res.status(404).json({ mensagem: 'Conta bancária não encontrada!' });
    }

    if (contaExistente.usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'A senha está incorreta!' });
    }

    const saldoConta = contaExistente.saldo;

    return res.status(200).json({ saldo: saldoConta });
};


const extrato = (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: 'O número da conta e a senha são obrigatórios!' });
    }

    const contaExistente = contas.find((conta) => conta.numero === parseInt(numero_conta));

    if (!contaExistente) {
        return res.status(404).json({ mensagem: 'Conta bancária não encontrada!' });
    }

    if (contaExistente.usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'Senha incorreta!' });
    }

    const depositosExtrato = depositos.filter((deposito) => {
        return deposito.numero_conta === contaExistente.numero;
    });

    const saquesExtrato = saques.filter((saque) => {
        return saque.numero_conta === contaExistente.numero;
    });

    const transferenciasEnviadasExtrato = transferencias.filter((transferencia) => {
        return transferencia.numero_conta_origem === contaExistente.numero;
    });

    const transferenciasRecebidaExtrato = transferencias.filter((transferencia) => {
        return transferencia.numero_conta_destino === contaExistente.numero;
    });

    const transacoesConta = {
        depositos: depositosExtrato,
        saques: saquesExtrato,
        transferenciasEnviadas: transferenciasEnviadasExtrato,
        transferenciasRecebidas: transferenciasRecebidaExtrato
    };


    return res.status(200).json(transacoesConta);

}

module.exports = {
    listarContas,
    criarConta,
    atualizarConta,
    excluirConta,
    depositarSaldo,
    sacarSaldo,
    transferirSaldo,
    saldoConta,
    extrato
};