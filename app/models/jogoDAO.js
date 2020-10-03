function JogoDAO(connection) {
    this._jogos = connection.Mongoose.model('jogos', connection.JogoSchema, 'jogos');
    this._ordens = connection.Mongoose.model('ordens', connection.OrdemSchema, 'ordens');
}
module.exports = function () {
    return JogoDAO;
}

JogoDAO.prototype.gerarParametrosJogo = function (usuario, callback) {
    var entity = new this._jogos(
    {
        usuario: usuario,
        qtd_moeda: 15,     //Valor padrão;
        qtd_sudito: 10,    //Valor padrão;
        qtd_temor: Math.floor(Math.random() * 1000), //Recuperar valores randomicos, sem fração;
        qtd_sabedoria: Math.floor(Math.random() * 1000), //Recuperar valores randomicos, sem fração;
        qtd_comercio: Math.floor(Math.random() * 1000), //Recuperar valores randomicos, sem fração;
        qtd_magia: Math.floor(Math.random() * 1000), //Recuperar valores randomicos, sem fração;
        dataRegistro: new Date()
    });
    entity.save(callback);
}

JogoDAO.prototype.obterParametrosJogo = function (usuario, callback) {

    //Recupera os parametros do jogo de um usuário.
    this._jogos.find({usuario: {$eq: usuario}}, callback);

}

JogoDAO.prototype.ordenarJogo = function (ordem, callback) {
    var entity = new this._ordens(
        {
            usuario: ordem.usuario,
            ordem: ordem.acao,
            qtd_ordem: ordem.quantidade,
            tempo_final_ordem: ordem.tempo_final_ordem,
            data_registro: new Date()
        });
    entity.save(callback);
}

JogoDAO.prototype.listarOrdensJogo = function (usuario, callback) {

    //Recupera os parametros do jogo de um usuário.
    var dataCorrente = new Date();
    var tempo_atual = dataCorrente.getTime();
    this._ordens.find({usuario: {$eq: usuario}, tempo_final_ordem: {$gt:tempo_atual}}, callback);

}

JogoDAO.prototype.atualizarParametrosJogo = function (parametros, callback) {
    //Atualizar a quantidade de moedas.
    //$inc utilizada para incrementar um valor no mongo.
    this._jogos.findOneAndUpdate(
        {usuario : parametros.usuario},
        {$inc: {qtd_moeda: parametros.moedas_ordem}}, null,
        callback);
}

JogoDAO.prototype.revogarOrdemJogo = function (idOrdem, callback) {
    this._ordens.findByIdAndDelete(idOrdem, {}, callback);
}
