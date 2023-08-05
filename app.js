import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
const __dirname = path.resolve();
import { Server } from "socket.io";

dotenv.config();
const PORT = process.env.PORT || 4000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:5173'
}));

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(express.static(path.join(__dirname, "public")));

const connectedHost = new Set();
const roomHostCounts = {};

const socketio = new Server(server, {
  cors: {
    origin: '*',
  }
});
socketio.on("connection", (socket) => {
  console.log("A user connected: ", socket.id);
  connectedHost.add(socket.id);

  socket.on("disconnect", () => {
    console.log("user disconnected");
    connectedHost.delete(socket.id);
  });

  socket.on('createRoom', (room) => {
    console.log('createRoom', room);
    socket.join(room);
    // Initialize host count for the new room
    roomHostCounts[room] = 0;
    // Emit the initial host count for the new room
    socketio.to(room).emit('roomHostCount', { room, count: roomHostCounts[room] });
  });

  console.log(connectedHost, roomHostCounts);
});