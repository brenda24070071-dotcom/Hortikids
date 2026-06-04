# Integração ESP32 com Sensor de Umidade - HortiKids

## 📱 Como Funciona

A aplicação agora pode ler dados de umidade diretamente de um **ESP32** conectado via **porta serial USB**.

Quando você conecta o ESP32 ao computador:
1. Clique no botão **"Sensor"** no app (canto superior esquerdo)
2. Selecione a porta COM do ESP32 no diálogo do navegador
3. Os dados de umidade serão atualizados automaticamente
4. O valor de **Água 💧** da planta será atualizado em tempo real

---

## 🔧 Componentes Necessários

- **ESP32** (microcontrolador)
- **Sensor de Umidade de Solo** (Capacitivo recomendado)
- **Cabo USB** (para conectar ao computador)
- **Arduino IDE** (para programar o ESP32)

---

## 🔌 Conexões Físicas

```
SENSOR DE UMIDADE → ESP32

Pin Analógico → GPIO 34 (ADC1_CH6)
GND          → GND
VCC          → 3.3V
```

> ⚠️ **Importante**: Use sensores que suportam 3.3V!

---

## 💻 Programação do ESP32

1. **Abra o Arduino IDE**
2. **Instale suporte para ESP32**:
   - Vá em `Arquivo > Preferências`
   - Em "URLs adicionais de gerenciadores de placas", adicione:
   ```
   https://dl.espressif.com/dl/package_esp32_index.json
   ```
   - Vá em `Ferramentas > Placa > Gerenciador de placas`
   - Procure por "ESP32" e instale

3. **Copie o código** de `ESP32_MOISTURE_EXAMPLE.ino`
4. **Calibre o sensor**:
   - Coloque o sensor no solo SECO e anote o valor
   - Coloque o sensor EM ÁGUA e anote o valor
   - Atualize as constantes `DRY` e `WET` no código

5. **Envie o código** para o ESP32:
   - Conecte o ESP32 via USB
   - Selecione `Ferramentas > Placa > ESP32-WROOM-32`
   - Selecione a porta COM correta
   - Clique em "Enviar" (→)

---

## 📊 Formato de Dados

O ESP32 deve enviar os dados em **uma das seguintes formas**:

### Opção 1: JSON (Recomendada)
```json
{"moisture":65}
{"moisture":72}
{"moisture":68}
```

### Opção 2: Texto Simples
```
Umidade: 65%
Umidade: 72%
Umidade: 68%
```

---

## ✅ Testando a Conexão

1. **Abra o Serial Monitor** do Arduino IDE (Ctrl + Shift + M)
2. **Configure a velocidade** para `115200 baud`
3. **Você deve ver** os dados sendo enviados a cada 5 segundos
4. **Exemplo de saída**:
   ```
   {"moisture":65}
   {"moisture":68}
   {"moisture":72}
   ```

---

## 🔗 Como Usar no App

### Pré-requisitos
- Navegador moderno (Chrome, Edge, Brave) que suporte **Web Serial API**
- ESP32 conectado via USB
- Código do ESP32 enviado

### Passos
1. **Inicie o app** (npm run dev)
2. **Clique no botão "Sensor"** (canto superior esquerdo)
3. **Na janela do navegador**, selecione a porta do ESP32
4. **Aguarde a confirmação** ✓ Conectado!
5. **Os dados começarão a chegar** automaticamente

### Monitoramento
- Olhe o valor de **Água 💧** no dashboard
- Ele deve atualizar em tempo real com os valores do sensor

---

## 🐛 Troubleshooting

### Botão "Sensor" não aparece
- Seu navegador não suporta Web Serial API
- **Solução**: Use Chrome, Edge, Brave ou Opera

### Erro ao tentar conectar
- A porta está em uso por outro programa
- **Solução**: Feche o Arduino IDE ou outro terminal serial

### Dados não são recebidos
- ESP32 não está enviando dados
- **Solução**: Verifique no Serial Monitor do Arduino IDE

### Porta não aparece no diálogo
- Driver CH340 não está instalado (comum em clones)
- **Solução**: [Baixe o driver aqui](https://www.wch.cn/downloads/CH341SER_ZIP.html)

---

## 📈 Próximos Passos (Ideias)

- [ ] Adicionar Temperatura ao sensor
- [ ] Adicionar Luminosidade ao sensor
- [ ] Persistir histórico de umidade
- [ ] Gráficos de tendência de umidade
- [ ] Alertas automáticos quando muito seco
- [ ] Integrar com WiFi (sem USB)

---

## 📝 Notas

- O App **não armazena** dados do sensor (reload = perda de dados)
- Web Serial API **apenas funciona em HTTPS** ou localhost
- O ESP32 envia dados a cada 5 segundos (configure conforme necessário)

---

**Dúvidas?** Consulte o código comentado em `ESP32_MOISTURE_EXAMPLE.ino`
