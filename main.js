// This application demonstrates how to use the Web Bluetooth API
// it was adapted from: https://github.com/electron/electron/tree/main/docs/fiddles/features/web-bluetooth

"use strict";

const { strict, strictEqual } = require('assert');
const { app, BrowserWindow, ipcMain } = require('electron');
const bluetooth = require("webbluetooth").bluetooth;
const path = require('path');
let win = null;
let server = null;
let characteristic = null;
let service = null;
let device = null;

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

async function createWindow() {
   win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
         nodeIntegration: true,
         contextIsolation: false,
      }
   });

   win.webContents.openDevTools();

   // Device scans start with calling Bluetooth.requestDevice(...) on the renderer side.  
   // When devices are found, this event is triggered.  We can use this event to present 
   // a device picker to the user, or we can automaically pick something.
   // win.webContents.on('select-bluetooth-device', (event, devices, callback) => {
   //    event.preventDefault()

   //    // just pick the first device discovered (requestDevice() handles filtering)
   //    if (devices && devices.length > 0) {
   //       callback(devices[0].deviceId)
   //    }
   // });

   // device = await bluetooth.requestDevice({
   //    filters:[{ services: [SERVICE_UUID] }]
   // });

   // server = await device.gatt.connect();

   // service = await server.getPrimaryService(SERVICE_UUID);

   // characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

   win.loadFile('index.html');
}

app.whenReady().then(async () => {
   await createWindow();

   app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
         await createWindow();
      }
   });
});

ipcMain.on('refresh', (_event) => {
   win.loadFile('index.html');
});

ipcMain.on('connect-device', async (_event) => {
   device = await bluetooth.requestDevice({
      filters:[{ services: [SERVICE_UUID] }]
   });

   server = await device.gatt.connect();

   service = await server.getPrimaryService(SERVICE_UUID);

   characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
});

ipcMain.on('write-to-device', async (_event, data) => {
   try { 
      console.log(data);
      console.log(Buffer.from(data, 'utf8'));
      let resp = await characteristic.writeValueWithResponse(Buffer.from(data, 'utf8'));
      console.log(`the response: ${resp}`);
      // await characteristic.writeValue(Buffer.from(['3C', '31', ]));
   }
   catch (err) { console.error(err); }
});

app.on('window-all-closed', function () {
   console.log("Bye");
   app.quit();
});


