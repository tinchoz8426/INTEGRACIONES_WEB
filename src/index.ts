import express from 'express';
import { createServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { PORT } from './config/env.js';
import turnoRoutes from './routes/turno.routes.js';
import { turnoService } from './services/turno.service.js';
import { appEvents } from './events/eventEmitter.js';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
  },
});

app.use(express.json());
app.use('/turnos', turnoRoutes);

// Puente entre EventEmitter y Socket.IO
appEvents.on('turno:creado', (turno) => {
  io.emit('turno:nuevo', turno);
});

appEvents.on('turno:actualizado', (turno) => {
  io.emit('turno:actualizado', turno);
});

appEvents.on('turno:eliminado', (turno) => {
  io.emit('turno:eliminado', turno);
});

io.on('connection', (socket) => {
  console.log(`Cliente conectado via Socket.IO: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

async function main() {
  await turnoService.cargarTurnosIniciales();
  httpServer.listen(PORT, () => {
    console.log(`Servidor de TurnosRed ejecutándose en el puerto ${PORT}`);
  });
}

main();