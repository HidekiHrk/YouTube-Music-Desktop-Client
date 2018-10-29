const { remote } = require('electron');
const fs = require('fs');
const ytdl = require('ytdl-core');
const RPC = require('discord-rpc');
const client = new RPC.Client({ transport: 'ipc' })
const config = require('../config.json');
const pkg = require('../package.json')
const startTimestamp = new Date()
var clientid = config.clientId;

var isReady = false;
var currentPlaying;
var webView = document.getElementById('webview');

function decode(str, idx){
	return String.fromCharCode(str.charCodeAt(idx));
}

function video_info(url, title, author) {
	this.url = url;
	this.title = title;
	this.author = author;
}

webview.addEventListener('did-stop-loading', () => {
	let url = webview.getURL()
	if(url.startsWith('https://music.youtube.com/search?q=')){
		if(!isReady){ return; }
		let srch_qry = decodeURI(url.slice('https://music.youtube.com/search?q='.length, url.length)).replace(/\+/g, ' ');
		let newTimeStamp = new Date()
		client.setActivity({
			details:'Searching...',
			state:`${'\u{1F50D}'} ${srch_qry}`,
			newTimeStamp,
			largeImageKey:config.idle,
			largeImageText: `YouTube Music v${pkg.version}`,
			smallImageKey:config.search,
			smallImageText: 'Searching',
			instance: true,
		});
	}
	else if(url.startsWith('https://music.youtube.com/watch?v=')){
		if(!isReady){ return; }
		let new_url = 'https://www.youtube.com/watch?v=' + url.slice('https://music.youtube.com/watch?v='.length, url.length)
		ytdl.getInfo(new_url, (err, info) => {
			let pTimeStamp = new Date()
			client.setActivity({
				details:`\u{1F3B5} ${info.title}`,
				state:`\u{1F464} ${info.author.name}`,
				pTimeStamp,
				largeImageKey:config.playing,
				largeImageText: `YouTube Music v${pkg.version}`,
				smallImageKey:config.play,
				smallImageText: 'Playing',
				instance: true,
			})
			currentPlaying = new video_info(url, info.title, info.author.name)
		});
		
	}
	else{
		if(!isReady){ return; }
		client.setActivity({
			details:'Just idling...',
			state:'and making some stuff',
			startTimestamp,
			largeImageKey:config.idle,
			largeImageText: `YouTube Music v${pkg.version}`,
			instance: true,
		})
	}
	console.log(url);
});

function close_window(){
	remote.getCurrentWindow().close();
}

function minimize_window(){
	remote.getCurrentWindow().minimize();
}

function maximize_window(){
	let win = remote.getCurrentWindow()
	let elcontrol = document.getElementById('control')
	if(!win.isMaximized()){
		win.maximize();
	}
	else{
		win.unmaximize();
	}
}

client.on('ready', () => {
	isReady = true
	client.setActivity({
		details:'Just idling...',
		state:'and making some stuff',
		startTimestamp,
		largeImageKey:config.idle,
		largeImageText: `YouTube Music v${pkg.version}`,
		instance: true,
	})
});


client.login({ clientId: clientid });