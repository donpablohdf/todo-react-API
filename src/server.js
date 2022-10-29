const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('./db.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(router)
server.listen(7000, () => {
    console.dir(server)
    console.log(router)
    console.log(middlewares)
})