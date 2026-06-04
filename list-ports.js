import { SerialPort } from 'serialport';

(async () => {
  try {
    const ports = await SerialPort.list();
    console.log(JSON.stringify(ports, null, 2));
  } catch (err) {
    console.error('Erro listando portas seriais:', err);
    process.exit(1);
  }
})();
