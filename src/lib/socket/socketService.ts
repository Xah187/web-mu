import { io, Socket } from 'socket.io-client';
import { Api } from '../api/axios';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  async initializeSocket(): Promise<void> {
    try {
      // Only initialize socket on client side
      if (typeof window === 'undefined') {
        console.log('Socket initialization skipped on server side');
        return;
      }

      this.socket = io(Api, {
        transports: ['websocket'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        // Socket connected successfully
      });

      this.socket.on('disconnect', () => {
        // Socket disconnected
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    } catch (error) {
      console.error('Socket initialization failed:', error);
    }
  }

  emit(event: string, data: any = {}): void {
    if (!this.socket) {
      console.error('Socket is not initialized. Call initializeSocket() first.');
      return;
    }
    this.socket.emit(event, data);
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.socket) {
      console.error('Socket is not initialized. Call initializeSocket() first.');
      return;
    }
    this.socket.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void): void {
    if (!this.socket) {
      console.error('Socket is not initialized. Call initializeSocket() first.');
      return;
    }
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  removeListener(listenerName: string): void {
    if (!this.socket) {
      console.error('Socket is not initialized. Call initializeSocket() first.');
      return;
    }
    this.socket.removeListener(listenerName);
  }

  closeSocketConnection(): void {
    if (!this.socket) {
      console.log('Socket already disconnected');
      return;
    }
    this.socket.disconnect();
    console.log('Socket disconnected manually');
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

const socketService = SocketService.getInstance();
export default socketService;
