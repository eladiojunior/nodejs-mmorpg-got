module.exports.jogo = function (application, request, response) {
    if (request.session.autenticado !== true) {
        var erros = [{
            param: "usuario",
            msg: "Jogador você precisa se autenticar, informe seu usuário e senha.",
            value: ""
        }];
        response.render('index', {validacao : erros, dadosForm: {}, usuario: {autenticado: false}})
        return;
    }

    //Buscar parametros do jog.
    const connection = application.config.db;
    const jogoDAO = new application.app.models.jogoDAO(connection);
    jogoDAO.obterParametrosJogo(request.session.usuario.usuario, function (erro, result) {

        if (erro) {
            response.render('jogo', {usuario: request.session.usuario});
            return;
        }

        //Atualizar os parametros do jogo na session.
        var usuario_session = request.session.usuario;
        usuario_session.parametrosJogo.qtd_moeda = result[0].qtd_moeda;
        request.session.usuario = usuario_session;

        response.render('jogo', {usuario: request.session.usuario});

    });

}
module.exports.sair = function (application, request, response) {
    request.session.destroy();
    response.redirect('/');
}
module.exports.suditos = function (application, request, response) {

    if (request.session.autenticado !== true) {
        var erros = [{
            param: "usuario",
            msg: "Jogador você precisa se autenticar.",
            value: ""
        }];
        response.render('aldeoes', {validacao : erros})
        return;
    }

    //Recuperar a quantidade de sutidos e quantos estão com atividade.
    const connection = application.config.db;
    const jogoDAO = new application.app.models.jogoDAO(connection);
    jogoDAO.listarOrdensJogo(request.session.usuario.usuario, function (erro, result) {
        var qtd_suditos_desocupados = request.session.usuario.parametrosJogo.qtd_sudito;
        if (erro) {
            var erros = [{
                param: "qtd_sudito",
                msg: "Não foi possível recuperar as atividades dos suditos.",
                value: ""
            }];
            response.render('aldeoes', {validacao : erros, qtd_suditos_em_atividade: 0, qtd_suditos_desocupados: qtd_suditos_desocupados});
            return;
        }

        var qtd_suditos_em_atividade = 0;
        for (var i=0; i < result.length; i++)  {
            qtd_suditos_em_atividade = qtd_suditos_em_atividade + result[i].qtd_ordem;
        }
        qtd_suditos_desocupados = qtd_suditos_desocupados - qtd_suditos_em_atividade;

        response.render('aldeoes', {validacao : {}, qtd_suditos_em_atividade: qtd_suditos_em_atividade, qtd_suditos_desocupados: qtd_suditos_desocupados});

    });

}
module.exports.pergaminhos = function (application, request, response) {

    if (request.session.autenticado !== true) {
        var erros = [{
            param: "usuario",
            msg: "Jogador você precisa se autenticar.",
            value: ""
        }];
        response.render('pergaminhos', {validacao: erros, ordens: {}});
        return;
    }

    //Recuperar as informações de ordens do banco.
    const connection = application.config.db;
    const jogoDAO = new application.app.models.jogoDAO(connection);
    jogoDAO.listarOrdensJogo(request.session.usuario.usuario, function (erro, result) {
        if (erro) {
            response.render('pergaminhos', {validacao: erro, ordens: {}});
            return;
        }

        //Calcular o tempo restante para ordem...
        var dataCorrente = new Date();
        var valor_calculado = 0;
        for (var i = 0; i < result.length; i++) {
            valor_calculado = ((result[i].tempo_final_ordem - dataCorrente.getTime()) / 1000);
            result[i].segundos_restante = Math.round(valor_calculado);
        }

        response.render('pergaminhos', {validacao: {}, ordens: result});

    });

}
module.exports.ordenar_acao_suditos = function (application, request, response) {

    //Verificar erros no formulário...
    request.assert('acao', 'Nenhuma ação foi ordenada.').notEmpty();
    request.assert('quantidade', 'Nenhuma quantidade informada.').notEmpty();

    var erros = request.validationErrors();
    if (erros) {
        response.send({
            result: false,
            mensagem: erros
        });
        return;
    }

    var dadosForm = request.body;
    dadosForm.usuario = request.session.usuario.usuario;

    //Verificar ordem para calcular o tempo final da ordem.
    var tempo_ordem = 0;
    var dataCorrente = new Date();
    switch (parseInt(dadosForm.acao)) {
        case 1:
            tempo_ordem = (1 * 60 * 60000);
            break;
        case 2:
            tempo_ordem = (2 * 60 * 60000);
            break;
        case 3:
            tempo_ordem = (5 * 60 * 60000);
            break;
        case 4:
            tempo_ordem = (5 * 60 * 60000);
            break;
    }
    dadosForm.tempo_final_ordem = (dataCorrente.getTime() + tempo_ordem);

    //Atualizar as informações de parametros do jogo...
    switch (parseInt(dadosForm.acao)) {
        case 1:
            dadosForm.moedas_ordem = -2 * dadosForm.quantidade;
            break;
        case 2:
            dadosForm.moedas_ordem = -3 * dadosForm.quantidade;
            break;
        case 3:
            dadosForm.moedas_ordem = -1 * dadosForm.quantidade;
            break;
        case 4:
            dadosForm.moedas_ordem = -1 * dadosForm.quantidade;
            break;
    }

    //Recuperar parametros atuais do jogo.
    dadosForm.qtd_moeda = request.session.usuario.parametrosJogo.qtd_moeda;
    var moedas_usuario = (dadosForm.qtd_moeda + dadosForm.moedas_ordem);

    if (moedas_usuario < 0) {
        response.send({
            result: false,
            mensagem: [{msg: "Você não possui moedas suficientes para utilização, verifique seu saldo."}]
        });
        return;
    }

    if (request.session.usuario.parametrosJogo.qtd_sudito < dadosForm.quantidade) {
        response.send({
            result: false,
            mensagem: [{msg: "Você não possui todos esses suditos."}]
        });
        return;
    }

    //Gravar ordem no banco de dados...
    const connection = application.config.db;
    const jogoDAO = new application.app.models.jogoDAO(connection);
    jogoDAO.ordenarJogo(dadosForm, function (erro) {
        if (erro != null) {
            response.send({
                result: false,
                mensagem: [{msg: "Desculpe, não foi possível gravar a ação."}]
            });
            return;
        }

        jogoDAO.atualizarParametrosJogo(dadosForm, function (erro) {

            if (erro != null) {
                response.send({
                    result: false,
                    mensagem: [{msg: "Desculpe, não foi possível atualizar os parametros do jogo."}]
                });
                return;
            }

            //Atualizar moedas na session do usuário.
            request.session.usuario.parametrosJogo.qtd_moeda = moedas_usuario;

            response.send({
                result: true,
                qtd_moeda: moedas_usuario,
                mensagem: [{msg: "Ação registrada com sucesso e parametros atualizados."}]
            });

        });

    });
}

module.exports.revogar_acao_suditos = function (application, request, response) {

    var idOrdem = request.body.id;

    //Gravar ordem no banco de dados...
    const connection = application.config.db;
    const jogoDAO = new application.app.models.jogoDAO(connection);
    jogoDAO.revogarOrdemJogo(idOrdem, function (erro) {
        if (erro != null) {
            response.send({
                result: false,
                mensagem: [{msg: "Desculpe, não foi possível revogar a ação."}]
            });
            return;
        }
        response.send({
            result: true,
            mensagem: [{msg: "Revogação da ação realizada com sucesso."}]
        });

    });

}