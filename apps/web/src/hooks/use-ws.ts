import useWebSocket from 'react-use-websocket';

const WS_URL = 'ws://127.0.0.1:8000/ws';

export const useWS = () => useWebSocket(WS_URL);
