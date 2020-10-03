/* importar as configurações do servidor */
const app = require('./config/server');
const port = process.env.PORT || 8080;
/* parametrizar a porta de escuta */
app.listen(port, function(){
	console.log('Servidor online [' + port + ']');
})