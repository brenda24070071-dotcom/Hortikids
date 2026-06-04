/*
  ESP32 + sensor de umidade + relé
  Conexões:
  - Sensor VCC -> 3.3V
  - Sensor GND -> GND
  - Sensor saída analógica -> GPIO 34
  - Relé IN -> GPIO 26
  - Relé VCC -> 5V (ou 3.3V, conforme módulo)
  - Relé GND -> GND
*/

const int SensorUmidade_pin = A0;
const int RELE = D5;

// Ajuste esses valores conforme a calibração do seu sensor
const int MIN = 16;
const int MAX = 580;

// Tempo que o relé ficará ligado em milissegundos
const unsigned long tempoIrrigacao = 3000;

void setup() {
  pinMode(RELE, OUTPUT);
  digitalWrite(RELE, HIGH); // Desliga relé por padrão

  Serial.begin(115200);
  delay(500);
  Serial.println("ESP32 sensor de umidade iniciado");
}

void loop() {
  // Lê a serial apenas se houver dados disponíveis
  if (Serial.available()) {
    String line = Serial.readStringUntil('\n');
    line.trim();
    if (line.length() > 0) {
      processSerialCommand(line);
    }
  }

  // Envia o valor de umidade a cada 5 segundos
  static unsigned long lastSend = 0;
  if (millis() - lastSend > 5000) {
    lastSend = millis();
    sendMoisture();
  }
}

void sendMoisture() {
  int rawValue = analogRead(SensorUmidade_pin);
  int moisture = map(rawValue, MIN, MAX, 0, 100);
  moisture = constrain(moisture, 0, 100);

  String jsonData = "{\"moisture\":" + String(moisture) + "}";
  Serial.println(jsonData);
}

void processSerialCommand(const String &line) {
  // Exemplo de comando recebido: {"command":"irrigate"}
  if (line.indexOf("\"command\"") >= 0 && line.indexOf("irrigate") >= 0) {
    irrigate();
  }
}

void irrigate() {
  Serial.println("{\"status\":\"irrigating\"}");
  digitalWrite(RELE, LOW); // Aciona o relé
  delay(tempoIrrigacao);
  digitalWrite(RELE, HIGH); // Desliga o relé
  Serial.println("{\"status\":\"done\"}");
}