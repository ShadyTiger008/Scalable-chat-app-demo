import http from 'http';
import SocketService from './services/socket';

let port = process.env.PORT || 8000

async function init() {
    const socketService = new SocketService();
    socketService.initListener(); 

    const httpServer = http.createServer();

    socketService.io.attach(httpServer);
    
    httpServer.listen(port, () => {
        console.log("Server listening on port " + port);
    })
}

init();