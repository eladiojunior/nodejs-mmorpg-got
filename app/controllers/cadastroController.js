module.exports.cadastro = function (application, request, response) {
    response.render('cadastro', {validacao : {}, dadosForm: {}});
}

module.exports.cadastrar = function (application, request, response) {

    //Verificar erros no formulário...
    request.assert('nome', 'Nome do jogador não informado.').notEmpty();
    request.assert('usuario', 'Usuário do jogador não informado.').notEmpty();
    request.assert('senha', 'Senha do jogador não informado.').notEmpty();
    request.assert('casa', 'Casa (GOT) do jogador não selecionada.').notEmpty();

    var erros = request.validationErrors();
    if (erros) {
        response.render('cadastro', {validacao : erros, dadosForm: request.body});
        return;
    }

    const connection = application.config.db;
    const usuarioDAO = new application.app.models.usuarioDAO(connection);
    usuarioDAO.registrarUsuario(request.body, function (erro) {
        if (erro != null) {
            response.render('cadastro', {validacao :  [{msg: "Desculpe, não foi possível gravar o usuário."}], dadosForm: request.body});
            return;
        } else {
            const jogoDAO = new application.app.models.jogoDAO(connection);
            jogoDAO.gerarParametrosJogo(request.body.usuario, function (erro){
                if (erro) {
                    console.log("Erro ao definir os parametros do jogo.");
                }
            });
            response.redirect("/");
        }
    });

}