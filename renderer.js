const { ipcRenderer } = require('electron');

// For this example, a BLE device needs to have the following service UUID with
// a readable/writeable characteristic.
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';


const statusLabel = document.getElementById('statusLabel');
const connectButton = document.getElementById('connectButton');
const refreshButton = document.getElementById('refreshButton');
const enterButton = document.getElementById('enterButton');
let writeInput = document.getElementById('writeInput');

refreshButton.addEventListener('click', refresh);
connectButton.addEventListener('click', connectToDevice);
enterButton.addEventListener('click', writeToDeviceMain);
// enterButton.addEventListener('click', writeToDeviceRenderer);
// connectButton.addEventListener('click', testIt);

let service = null;
// let characteristic = null;

// Display what's happening to user
function displayStatus(status) {
   statusLabel.innerHTML = status;
   console.log(status);
}

// Find device by service, connect, read, write
async function testIt() {
   displayStatus('Searching devices for service ' + SERVICE_UUID);

   try {
      // In a browser, this will display a device picker, but in Electron we handle
      // device selection via the select-bluetooth-device event on the server side.
      // This allows us to automatically pick the device, or display a picker, etc.
      // See Session.setBluetoothPairingHandler() for info on displaying a picker.
      const device = await navigator.bluetooth.requestDevice({
         filters: [{ services: [SERVICE_UUID] }]
      });
      displayStatus('Found device ' + device.name + ' with service');

      const server = await device.gatt.connect();
      displayStatus('Connected to GATT server');

      service = await server.getPrimaryService(SERVICE_UUID);
      displayStatus('Connected to service ' + SERVICE_UUID);
   } catch (error) {
      displayStatus("Error: " + error);
   }
}

async function connectToDevice() {
   ipcRenderer.send('connect-device');
}

async function refresh() {
   ipcRenderer.send('refresh');
}

async function writeToDeviceMain() {
   // try {
   //    const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
   //    characteristic.writeValueWithResponse(Buffer.from(writeInput.value, "utf-8"));
   //    displayStatus('Characteristic ' + CHARACTERISTIC_UUID + ' set to ' + writeInput.value);
   // }
   // catch(err) {
   //    displayStatus("Error: " + err);
   // }

   ipcRenderer.send('write-to-device', writeInput.value);
}

async function writeToDeviceRenderer() {
   try {
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
      characteristic.writeValueWithResponse(Buffer.from(writeInput.value, "utf-8"));
      displayStatus('Characteristic ' + CHARACTERISTIC_UUID + ' set to ' + writeInput.value);
   }
   catch(err) {
      displayStatus("Error: " + err);
   }
}