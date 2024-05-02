import useWebSocket from 'react-use-websocket';

const WS_URL = 'ws://127.0.0.1:8000/ws';

export const useWS = () =>
  useWebSocket(WS_URL, {
    shouldReconnect: () => true,
    reconnectInterval: 3000,
    reconnectAttempts: 10,
    heartbeat: {
      message: () => {
        const username = localStorage.getItem('username');
        return JSON.stringify({ type: 'heartbeat', payload: { username } });
      },
    },
  });
