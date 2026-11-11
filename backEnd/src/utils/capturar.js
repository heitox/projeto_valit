// Envolve um controller async: qualquer erro vira resposta 500 em vez de derrubar a requisição
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
