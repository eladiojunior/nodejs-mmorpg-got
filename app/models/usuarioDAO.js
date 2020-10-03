/* Importar o modulo do Crypto */
var crypto = require("crypto");
function UsuarioDAO(connection) {
    this._usuarios = connection.Mongoose.model('usuarios', connection.UsuarioSchema, 'usuarios');
    this._acessos = connection.Mongoose.model('acessos', connection.AcessoSchema, 'acessos');
}
module.exports = function () {
    return UsuarioDAO;
}

UsuarioDAO.prototype.registrarUsuario = function (usuario, callback) {
    //Utilizar o usuario para criar um salt de senha.
    var chave_senha = usuario.usuario + usuario.senha;
    var senha_criptografada = crypto.createHash("MD5").update(chave_senha).digest("hex");
    var entity = new this._usuarios(
    {
        nome: usuario.nome,
        usuario: usuario.usuario,
        senha: senha_criptografada,
        casa: usuario.casa,
        dataUltimoAcesso: null,
        dataRegistro: new Date()
    });
    entity.save(callback);
}

UsuarioDAO.prototype.autenticarUsuario = function (usuario, senha, callback) {

    //Gerar senha criptografada.
    var chave_senha = usuario + senha;
    var senha_criptografada = crypto.createHash("MD5").update(chave_senha).digest("hex");

    //Verificar usuário e senha.
    this._usuarios.find({usuario: {$eq: usuario}, senha: {$eq: senha_criptografada}}, callback);

}

UsuarioDAO.prototype.registrarAcesso = function (usuario, maquina) {

    var dataCorrente = new Date();
    var acessos = new this._acessos(
    {
        usuario: usuario,
        ipMaquina: maquina,
        dataRegistro: dataCorrente
    });
    acessos.save(function (erro1) {
        if (erro1)
            console.log(erro1);
    });

    //Registrar último acesso do usuário.
    this._usuarios.findOneAndUpdate(
        {usuario : usuario},
        {$set: {dataUltimoAcesso: dataCorrente}}, null,
        function (erro2) {
            if (erro2)
                console.log(erro2);
        });

}