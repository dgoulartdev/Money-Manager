const { banco } = require('../bancodedados')

const validaSenha = (req, res, next) => {
    const { senha_banco } = req.query;

    if (senha_banco !== banco.senha) {
        return res.status(401).json({ mensagem: 'A senha está incorreta' });
    }

    next();
};

module.exports = validaSenha;