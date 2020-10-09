/* Importar o modulo do MongoDB com Mongose (OER) */
const mongoose = require('mongoose');
const {
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOSTNAME,
    MONGO_PORT,
    MONGO_DB
} = process.env;

var options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    connectTimeoutMS: 10000,
    user: MONGO_USERNAME,
    pass: MONGO_PASSWORD
};
const url_conn = 'mongodb://'+MONGO_HOSTNAME+':'+MONGO_PORT+'/'+MONGO_DB+'?authSource=admin';
mongoose.connect(url_conn, options).then(function() {
    console.log('MongoDB ['+MONGO_DB+'] conectado.');
});
//Definir os schemas do banco.
var usuarioSchema = new mongoose.Schema({
    nome: String,
    usuario: String,
    senha: String,
    dataUltimoAcesso: Date,
    casa: String,
    dataRegistro: Date
    }, { collection: 'usuarios' }
);
var acessoSchema = new mongoose.Schema(
    {
        usuario: String,
        ipMaquina: String,
        dataRegistro: Date
    }, { collection: 'acessos' }
);
var jogoSchema = new mongoose.Schema(
    {
        usuario: String,
        qtd_moeda: Number,
        qtd_sudito: Number,
        qtd_temor: Number,
        qtd_sabedoria: Number,
        qtd_comercio: Number,
        qtd_magia: Number,
        dataRegistro: Date
    }, { collection: 'jogos' }
);
var ordemSchema = new mongoose.Schema(
    {
        usuario: String,
        ordem: Number,
        qtd_ordem: Number,
        tempo_final_ordem: Number,
        data_registro: Date
    }, { collection: 'ordens' }
);
module.exports = { Mongoose: mongoose,
    UsuarioSchema: usuarioSchema, AcessoSchema: acessoSchema, JogoSchema: jogoSchema, OrdemSchema: ordemSchema }