export interface SerialData {
  moisture: number;
  temperature?: number;
  light?: number;
  timestamp: string;
}

class SerialService {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<string> | null = null;
  private isConnected = false;
  private listeners: ((data: SerialData) => void)[] = [];
  private ws: WebSocket | null = null;
  private wsConnected = false;

  // Verifica se está acessando via localhost (não via IP remoto)
  private isLocalhost(): boolean {
    try {
      const host = window.location.hostname;
      return host === 'localhost' || host === '127.0.0.1' || host === '::1';
    } catch {
      return false;
    }
  }

  // Verifica se Web Serial API está disponível E se está em localhost
  // Se estiver em IP remoto (celular), não tenta Web Serial, apenas WebSocket bridge
  isSupported(): boolean {
    if (!this.isLocalhost()) {
      return false;
    }
    return 'serial' in navigator;
  }

  // Conecta à porta serial
  async connect(): Promise<boolean> {
    try {
      if (!this.isSupported()) {
        throw new Error('Web Serial API não é suportada neste navegador');
      }

      // Abre o diálogo do navegador para selecionar a porta
      this.port = await navigator.serial.requestPort();
      
      // Abre a porta com os parâmetros corretos para ESP32
      await this.port.open({ baudRate: 115200 });

      // Prepara escrita de texto para enviar comandos ao ESP32
      const textEncoder = new TextEncoderStream();
      this.writer = textEncoder.writable.getWriter();
      textEncoder.readable.pipeTo(this.port.writable);
      
      this.isConnected = true;
      console.log('Conectado à porta serial');
      
      // Inicia a leitura dos dados
      this.startReading();
      
      return true;
    } catch (error) {
      console.error('Erro ao conectar à porta serial:', error);
      this.isConnected = false;
      return false;
    }
  }

  // Inicia a leitura contínua de dados
  private async startReading() {
    try {
      if (!this.port) return;

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
      this.reader = textDecoder.readable.getReader();

      let buffer = '';

      // Lê dados continuamente
      while (true) {
        const { value, done } = await this.reader.read();
        
        if (done) break;

        buffer += value;
        
        // Processa linhas completas (espera por \n)
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          this.processLine(line.trim());
        }
      }
    } catch (error) {
      console.error('Erro na leitura serial:', error);
      this.isConnected = false;
    }
  }

  // Processa cada linha recebida do ESP32
  private processLine(line: string) {
    if (!line) return;

    try {
      // Esperamos um formato JSON do ESP32: {"moisture":65,"temperature":24,"light":80}
      const data = JSON.parse(line);
      
      const sensorData: SerialData = {
        moisture: Math.min(100, Math.max(0, data.moisture || 0)),
        temperature: data.temperature,
        light: data.light,
        timestamp: new Date().toISOString(),
      };

      // Notifica todos os listeners
      this.listeners.forEach(listener => listener(sensorData));
    } catch (error) {
      // Se não for JSON válido, tenta interpretar como texto plano
      // Exemplo: "Umidade: 65%"
      const moistureMatch = line.match(/(\d+)/);
      if (moistureMatch) {
        const sensorData: SerialData = {
          moisture: Math.min(100, Math.max(0, parseInt(moistureMatch[1]))),
          timestamp: new Date().toISOString(),
        };
        this.listeners.forEach(listener => listener(sensorData));
      }
    }
  }

  // Registra um callback para receber dados
  onDataReceived(callback: (data: SerialData) => void): () => void {
    this.listeners.push(callback);
    
    // Retorna função para remover o listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Envia um comando ao ESP32 via serial
  async sendCommand(command: string): Promise<void> {
    try {
      // Prefer serial native if available
      if (this.port && this.writer && this.isConnected) {
        await this.writer.write(`${command}\n`);
        console.log('Comando serial enviado (native):', command);
        return;
      }

      // Fallback to websocket bridge to backend
      if (this.ws && this.wsConnected) {
        this.ws.send(JSON.stringify({ type: 'command', command }));
        console.log('Comando serial enviado (ws):', command);
        return;
      }

      throw new Error('Porta serial não conectada e websocket não disponível');
    } catch (error) {
      console.error('Erro ao enviar comando serial:', error);
    }
  }

  // Inicializa conexão WebSocket com servidor bridge (fallback para controle remoto via celular)
  connectWebSocketBridge(port = 3001) {
    try {
      if (this.ws) {
        console.log('WebSocket bridge já está conectando/aberto');
        return;
      }

      const host = window.location.hostname || 'localhost';
      const url = `ws://${host}:${port}`;
      
      console.log(`[WS Bridge] Conectando a ${url}...`);
      this.ws = new WebSocket(url);

      this.ws.addEventListener('open', () => {
        this.wsConnected = true;
        console.log(`[WS Bridge] ✓ Conectado a ${url}`);
        // solicitamos auto-conexão do bridge ao serial (sem porto forçado = auto-detect)
        this.ws?.send(JSON.stringify({ type: 'connect-serial' }));
        console.log(`[WS Bridge] Solicitado connect-serial ao servidor`);
      });

      this.ws.addEventListener('message', (ev) => {
        try {
          const msg = JSON.parse(ev.data as string);
          
          // Log de mensagens de status
          if (msg.type === 'status') {
            console.log(`[WS Bridge] Status: ${msg.status}`, msg.message || '');
          }
          
          // Processa dados seriais recebidos
          if (msg.type === 'serial' && msg.raw) {
            try {
              const data = JSON.parse(msg.raw);
              const sensorData: SerialData = {
                moisture: Math.min(100, Math.max(0, data.moisture || 0)),
                temperature: data.temperature,
                light: data.light,
                timestamp: new Date().toISOString(),
              };
              this.listeners.forEach(l => l(sensorData));
            } catch (e) {
              // se não for JSON, extrai número
              const m = (msg.raw || '').match(/(\d+)/);
              if (m) {
                const sensorData: SerialData = { 
                  moisture: Math.min(100, Math.max(0, parseInt(m[1]))), 
                  timestamp: new Date().toISOString() 
                };
                this.listeners.forEach(l => l(sensorData));
              }
            }
          }
        } catch (err) {
          console.error('[WS Bridge] Erro parseando mensagem:', err);
        }
      });

      this.ws.addEventListener('error', (err) => {
        console.error(`[WS Bridge] Erro: ${err}`);
      });

      this.ws.addEventListener('close', () => {
        this.wsConnected = false;
        console.log(`[WS Bridge] Desconectado`);
        this.ws = null;
      });
    } catch (err) {
      console.error('[WS Bridge] Erro ao criar WebSocket:', err);
    }
  }

  // Desconecta da porta serial
  async disconnect(): Promise<void> {
    try {
      if (this.reader) {
        await this.reader.cancel();
        this.reader = null;
      }
      
      if (this.writer) {
        await this.writer.close();
        this.writer = null;
      }
      
      if (this.port) {
        await this.port.close();
        this.port = null;
      }
      
      this.isConnected = false;
      this.listeners = [];
      console.log('Desconectado da porta serial');
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  }

  getIsConnected(): boolean {
    return this.isConnected || this.wsConnected;
  }

  getIsWebSocketConnected(): boolean {
    return this.wsConnected;
  }

  getIsLocalhost(): boolean {
    return this.isLocalhost();
  }
}

export const serialService = new SerialService();
