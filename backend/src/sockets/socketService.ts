import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

class SocketService {
    private io: SocketServer | null = null;

    initialize(server: HttpServer): void {
        this.io = new SocketServer(server, {
            cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET', 'POST'], credentials: true },
            pingTimeout: 60000,
        });
        this.io.on('connection', (socket) => {
            console.log(`Socket connected: ${socket.id}`);
            socket.on('join:admin', (eventId: string) => socket.join(`admin_${eventId}`));
            socket.on('join:display', (eventCode: string) => socket.join(`display_${eventCode}`));
            socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`));
        });
    }

    emit(room: string, event: string, data: unknown): void {
        this.io?.to(room).emit(event, data);
    }

    emitToAdminRoom(eventId: string, event: string, data: unknown): void {
        this.emit(`admin_${eventId}`, event, data);
    }

    emitToDisplayRoom(eventCode: string, event: string, data: unknown): void {
        this.emit(`display_${eventCode}`, event, data);
    }
}

export const socketService = new SocketService();
