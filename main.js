// imports //
const electron = require('electron');
const { 
	app, BrowserWindow,
	Notification, NativeImage, Tray,
	ipcMain, Menu, MenuItem } = electron;
const RPC = require('discord-rpc');
const os = require('os');
const fs = require('fs');
const userConfig = require('./userConfigWrapper');
const ytReq = require('./front_end/ytRequest');

// vars //
var client = new RPC.Client({ transport: 'ipc' });
const config = require('./config.json');
//var startTimestamp = new Date();
var clientid = config.clientId;
const pckg = require('./package.json');
var rpcState = false;

// UserConfig Set //
if(Object.keys(userConfig()).length == 0){
	userConfig('post', {
		"rich_presence":true,
		"minimize":true,
		"notifications":true,
		"notification_pos":"top"
	})
}

//Util Functions//

function getNotPos(wW, wH, nC){
	let x = wW - 350;
	let y;
	switch(userConfig().notification_pos){
		case 'top':
			y = (130 * nC) + (nC > 0 ? 30 : 0);
			break;
		case 'bot':
			y = (wH - 130) - ((130 * nC) + (nC > 0 ? 10 : 0));
			break;
	}
	return {x,y};
}

var n_sys = {
	notify_count:0,
	notify: (music_name, music_author, music_thumb, timeout=5000) => {
		let workarea = electron.screen.getPrimaryDisplay().workAreaSize;
		let pos = getNotPos(workarea.width, workarea.height, n_sys.notify_count);
		let notifyWindow = new BrowserWindow(
			{	
				x:pos.x, y:pos.y,
				width:350, height:130, alwaysOnTop:true,skipTaskbar:true,
				resizable:false, maximizable:false, transparent: true, frame:false
			}
		)
		n_sys.notify_count += 1;
		notifyWindow.setMenu(null);
		notifyWindow.loadFile(`${__dirname}/front_end/notifications/notification.html`);
		// notifyWindow.openDevTools();
		notifyWindow.webContents.on('did-finish-load', () => {
			notifyWindow.webContents.send('notify', {
				name:music_name, author:music_author,
				thumbnail:music_thumb
			})
			setTimeout(() => {notifyWindow.destroy()}, timeout);
		})
		notifyWindow.on('closed', () => {notifyWindow = null;
			if(n_sys.notify_count)
				n_sys.notify_count -= 1;
		});
	}
}

// Window App //

function createWindow(){
	win = new BrowserWindow({width:800, height:500, minWidth:400, minHeight:250, icon:`${__dirname}/img/ico.png`, transparent: true, frame:false, resizable:true});
	win.setMenu(null);
	win.loadFile(`${__dirname}/front_end/index.html`);
	//win.openDevTools()
	win.on('close', e =>{
		if(userConfig().minimize){
			e.preventDefault();
			win.hide();
		}
	});
	win.on('closed', () => {
		win = null;
		app.quit();
	})
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	app.quit();
});

app.on('activate', () =>{
	if(win === null){
		createWindow()
	};
})

// app listeners //
ipcMain.on('notify', (event, arg) => {
	n_sys.notify(arg.name, arg.author, arg.thumb)
})

// Discord RPC Connection //

ipcMain.on('activity', (event, arg) => {
	client.setActivity(arg)
		.catch(console.error)
})

client.on('ready', () => {
	rpcState = true;
	client.setActivity({
		details: `Idling...`,
		state: 'Just Started...',
		largeImageKey: config.idle,
		largeImageText: 'three',
		instance: false
	})
});

client.login({ clientId: clientid });