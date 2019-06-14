// imports //
const { app, BrowserWindow, Notification, NativeImage, Tray, ipcMain } = require('electron');
const RPC = require('discord-rpc');
const os = require('os');
const fs = require('fs');

// vars //
var client = new RPC.Client({ transport: 'ipc' });
const config = require('./config.json');
//var startTimestamp = new Date();
var clientid = config.clientId;
const pckg = require('./package.json');
var rpcState = false;

function userConfig(method='get', data={}, filename='.ytmConfig.json'){
	let user_config;
	switch(process.platform){
		case 'linux':
			user_config = `${os.homedir}/.YTMusicFiles`;
			break;
		case 'win32':
			user_config = `%AppData%/YTMusicFiles`;
			break;
		default:
			return null;
	}
	if(!fs.existsSync(user_config)){fs.mkdirSync(user_config);}
	if(!fs.existsSync(`${user_config}/${filename}`)){
		fs.writeFileSync(`${user_config}/${filename}`, '{}')}
	if(method == 'post'){
		fs.writeFileSync(`${user_config}/${filename}`,
			JSON.stringify(data, null, 4)
		); return data;
	}
	else if(method == 'get'){
		return JSON.parse(fs.readFileSync(`${user_config}/${filename}`).toString());
	}
}
var user_config = userConfig();
if(Object.keys(user_config).length == 0){
	userConfig('post', {
		"rich_presence":true,
		"minimize":true
	})
}


//Util Functions//

function notify(obj, timeout=5, click=false){
	if(renderer_on){
		win.webContents.send('notify', [obj, timeout, click])
	}
}

// Window App //

function createWindow(){
	win = new BrowserWindow({width:800, height:500, minWidth:400, minHeight:250, icon:`${__dirname}/img/ico.png`, transparent: true, frame:false, resizable:true});
	win.setMenu(null);
	win.loadFile(`${__dirname}/front_end/index.html`);
	//win.openDevTools()
	win.on('closed', () => {
		win = null;
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