const fastify = require('fastify')();
var cors = require('cors')
const mjml = require('mjml');

fastify.post('/', function (request, reply) {
    if (typeof request.body.mjml === 'undefined' || request.body.mjml === null) {
        reply.send({});
        return;
    }

    let result = mjml(request.body.mjml);

    if (Object.keys(result.errors).length) {
        Object.keys(result.errors).forEach((key) => {
            delete result.errors[key].formattedMessage;
        });
    }

    reply.send(result)
});

fastify.get('/', function (request, reply) {
    reply.send({
        hello: 'This is a tool to convert mjml input to it\'s html output',
        greetings: 'Was FANTASTIC seeing you <3'
    });
});

// Middleware
fastify.use(require('cors')())

// Run the server!
fastify.listen(9001, '127.0.0.1', function (err) {
    if (err) throw err;
    console.log(`server listening on ${fastify.server.address().port}`)
});
