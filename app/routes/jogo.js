module.exports = function(application){
	application.get('/jogo', function(req, res){
		application.app.controllers.jogoController.jogo(application, req, res);
	});
	application.get('/suditos', function(req, res){
		application.app.controllers.jogoController.suditos(application, req, res);
	});
	application.get('/pergaminhos', function(req, res){
		application.app.controllers.jogoController.pergaminhos(application, req, res);
	});
	application.post('/ordenar_acao_sudito', function(req, res){
		application.app.controllers.jogoController.ordenar_acao_suditos(application, req, res);
	});
	application.post('/revogar_acao_sudito', function(req, res){
		application.app.controllers.jogoController.revogar_acao_suditos(application, req, res);
	});
	application.get('/sair', function(req, res){
		application.app.controllers.jogoController.sair(application, req, res);
	});
}