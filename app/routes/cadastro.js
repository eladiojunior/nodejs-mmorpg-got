module.exports = function(application){
	application.get('/cadastro', function(request, response){
		application.app.controllers.cadastroController.cadastro(application, request, response);
	});
	application.post('/cadastrar', function(request, response){
		application.app.controllers.cadastroController.cadastrar(application, request, response);
	});
}