import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

const APP_PORT = process.env.PORT || 3001;
const SERIAL_BAUD = parseInt(process.env.SERIAL_BAUD || '115200', 10);
const PREFERRED_PORT = process.env.SERIAL_PORT || 'COM9'; // e.g. COM9 or /dev/ttyUSB0

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let serial = null;
let parser = null;

async function openSerial(portPath) {
  try {
    if (serial) {
      try { serial.close(); } catch (e) {}
      serial = null;
    }

    serial = new SerialPort({ path: portPath, baudRate: SERIAL_BAUD });
    parser = serial.pipe(new ReadlineParser({ delimiter: '\n' }));

    parser.on('data', (line) => {
      broadcast(JSON.stringify({ type: 'serial', raw: line.trim() }));
    });

    serial.on('open', () => {
      console.log('Serial port opened', portPath);
      broadcast(JSON.stringify({ type: 'status', status: 'serial-open', port: portPath }));
    });

    serial.on('close', () => {
      console.log('Serial port closed');
      broadcast(JSON.stringify({ type: 'status', status: 'serial-closed' }));
    });

    serial.on('error', (err) => {
      console.error('Serial error:', err);
      broadcast(JSON.stringify({ type: 'status', status: 'serial-error', message: String(err) }));
    });

    return true;
  } catch (err) {
    console.error('Failed to open serial:', err);
    return false;
  }
}

async function autoDetectAndOpen() {
  try {
    const ports = await SerialPort.list();
    let chosen = null;
    if (PREFERRED_PORT) {
      chosen = ports.find(p => p.path === PREFERRED_PORT);
    }
    if (!chosen) {
      // Prefer ports with manufacturer data or likely USB/ACM names
      chosen = ports.find(p => p.manufacturer || /usb|acm|tty|COM/i.test(p.path)) || ports[0];
    }
    if (!chosen) {
      console.warn('No serial ports found');
      return false;
    }
    return openSerial(chosen.path);
  } catch (err) {
    console.error('Auto-detect failed:', err);
    return false;
  }
}

function broadcast(message) {
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(message);
  }
}

wss.on('connection', (ws) => {
  console.log('Client connected via WebSocket');
  ws.send(JSON.stringify({ type: 'status', status: 'connected' }));

  ws.on('message', async (data) => {
    try {
      const msg = typeof data === 'string' ? JSON.parse(data) : JSON.parse(data.toString());

      if (msg.type === 'connect-serial') {
        if (msg.port) {
          const ok = await openSerial(msg.port);
          ws.send(JSON.stringify({ type: 'status', status: ok ? 'serial-open' : 'serial-failed', port: msg.port }));
        } else {
          const ok = await autoDetectAndOpen();
          ws.send(JSON.stringify({ type: 'status', status: ok ? 'serial-open' : 'serial-failed' }));
        }
      }

      if (msg.type === 'command') {
        // Forward the command string to serial
        if (serial && serial.writable) {
          const toSend = typeof msg.command === 'string' ? msg.command : JSON.stringify(msg.command);
          serial.write(toSend + '\n');
          ws.send(JSON.stringify({ type: 'status', status: 'command-sent', command: msg.command }));
        } else {
          ws.send(JSON.stringify({ type: 'status', status: 'no-serial' }));
        }
      }

    } catch (err) {
      console.error('Error handling ws message', err);
      ws.send(JSON.stringify({ type: 'error', message: String(err) }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

app.get('/', (req, res) => {
  res.send('Serial bridge running');
});

server.listen(APP_PORT, async () => {
  console.log(`Serial bridge listening on http://0.0.0.0:${APP_PORT}`);
  // Try auto-open on start
  await autoDetectAndOpen();
});
