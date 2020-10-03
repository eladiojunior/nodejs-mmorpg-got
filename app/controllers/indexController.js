module.exports.home = function (application, request, response) {
    var usuario_session = {autenticado: false};
    if (request.session.autenticado) {
        usuario_session = request.session.usuario;
    }
    response.render('index', {validacao : {}, dadosForm: {}, usuario: usuario_session});
}
module.exports.autenticar = function (application, request, response) {

    var dadosForm = request.body;

    request.assert('usuario', 'Usuário não informado, obrigatório.').notEmpty();
    request.assert('senha', 'Senha de acesso não informada, obrigatório.').notEmpty();
    var erros = request.validationErrors();
    if (erros) {
        response.render('index', {validacao : erros, dadosForm: dadosForm, usuario: {autenticado: false}});
        return;
    }

    const connection = application.config.db;
    const usuarioDAO = new application.app.models.usuarioDAO(connection);
    usuarioDAO.autenticarUsuario(dadosForm.usuario, dadosForm.senha, function (error, result) {

        if (error != null) {
            response.locals.message = erro.message;
            response.locals.error = erro;
            response.status(erro.status || 500);
            response.render('error');
            return;
        }

        //Verificar se o usuário foi encontrado...
        if (result[0] == undefined) {
            var erros = [{
                param: "usuario",
                msg: "Usuário não existe ou senha inválida.",
                value: "senha"
            }];
            response.render('index', {validacao : erros, dadosForm: dadosForm, usuario: {autenticado: false}})
            return;
        }

        //Registrar acesso do usuário.
        const ipMaquina = obterIpUsuario();
        usuarioDAO.registrarAcesso(result[0].usuario, ipMaquina);

        //Recuperar informações do Jogo
        const jogoDAO = new application.app.models.jogoDAO(connection);
        jogoDAO.obterParametrosJogo(result[0].usuario, function (erro, result_jogo) {
            var parametros_jogo = {
                qtd_moeda: 0, qtd_sudito: 0,
                qtd_temor: 0, qtd_sabedoria: 0, qtd_comercio: 0, qtd_magia: 0
            };
            if (result_jogo[0] != undefined) {
                parametros_jogo = {
                    qtd_moeda: result_jogo[0].qtd_moeda, qtd_sudito: result_jogo[0].qtd_sudito,
                    qtd_temor: result_jogo[0].qtd_temor, qtd_sabedoria: result_jogo[0].qtd_sabedoria,
                    qtd_comercio: result_jogo[0].qtd_comercio, qtd_magia: result_jogo[0].qtd_magia
                };
            }

            //Registrar usuário na sessão;
            if (result[0].dataUltimoAcesso == null)
                result[0].dataUltimoAcesso = new Date();

            var usuario_session = {
                nome: result[0].nome,
                usuario: result[0].usuario,
                casa: result[0].casa,
                dataUltimoAcesso: result[0].dataUltimoAcesso.toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                autenticado: true,
                parametrosJogo: parametros_jogo
            };

            request.session.autenticado = true;
            request.session.usuario = usuario_session;
            response.redirect("/jogo");

        });

    });

}

function obterIpUsuario() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    var ipUsuario = '0.0.0.0';
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                if (net.address!=null && net.address!="") {
                    ipUsuario = net.address;
                }
            }
        }
    }
    return ipUsuario;
}