// imports //
const { 
	app, BrowserWindow,
	Notification, NativeImage, Tray,
	ipcMain, Menu, MenuItem } = require('electron');
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
var userClose = true;

// UserConfig Set //
if(Object.keys(userConfig()).length == 0){
	userConfig('post', {
		"rich_presence":true,
		"minimize":true,
		"notifications":true
	})
}

//Util Functions//

function notify(obj, timeout=5, click=false){
	if(renderer_on){
		win.webContents.send('notify', [obj, timeout, click])
	}
}

var notification_sys = {
	notify_number:0,
	notify: (music_name, music_author, music_thumb) => {
		let notifyWindow = new BrowserWindow(
			{	width:350, height:130, 
				resizable:false, maximizable:false, transparent: true, frame:false
			}
		)
		notifyWindow.setMenu(null);
		notifyWindow.loadFile(`${__dirname}/front_end/notifications/notification.html`);
		// notifyWindow.openDevTools();
		notifyWindow.webContents.on('did-finish-load', () => {
			notifyWindow.webContents.send('notify', {
				name:music_name, author:music_author,
				thumbnail:music_thumb
			})
		})
		notifyWindow.on('closed', () => {notifyWindow = null;});
	}
}

// Window App //

function createWindow(){
	win = new BrowserWindow({width:800, height:500, minWidth:400, minHeight:250, icon:`${__dirname}/img/ico.png`, transparent: true, frame:false, resizable:true});
	win.setMenu(null);
	win.loadFile(`${__dirname}/front_end/index.html`);
	//win.openDevTools()
	let aa = ytReq.getVideoInfo('https://www.youtube.com/watch?v=ObpAQ1kPizk')
		.then(v => {
			notification_sys.notify(
				v.title, v.author, v.thumb
			)
			console.log(v.thumb)
		});
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