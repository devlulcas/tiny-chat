export const wsClient = new WebSocket('ws://localhost:8080');

wsClient.onmessage = (ev) => {
  console.log('Mensagem recebida:', ev.data);
  wsClient.send('Olá, servidor!');
};

wsClient.onclose = (ev) => {
  wsClient.send('close connection' + ev.code + ev.reason);
};
