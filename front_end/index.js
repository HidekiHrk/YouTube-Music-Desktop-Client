const { remote } = require('electron');
const fs = require('fs');
const ytdl = require('ytdl-core');
const RPC = require('discord-rpc');
const client = new RPC.Client({ transport: 'ipc' })
const config = require('../config.json');
const pkg = require('../package.json')
const startTimestamp = new Date()
var clientid = config.clientId;
console.log(Notification)
var isReady = false;
var currentPlaying = null;
var webView = document.getElementById('webview');

var tray = new remote.Tray('./img/icon2.png')
tray.setToolTip('Idling...')

var in_search = false;

var is_playing = false;

function decode(str, idx){
	return String.fromCharCode(str.charCodeAt(idx));
}

function video_info(url, title, author) {
	this.url = url;
	this.title = title;
	this.author = author;
}

tray.on('click', () => {
	remote.getCurrentWindow().show();
})

webview.addEventListener('media-started-playing', () =>{
	let ganzerozos = setInterval(() => {
		if(is_playing){
			is_playing = false
			let newTimeStamp = new Date()
			let playNotifi = new remote.Notification({title:pkg.productName, body:`\u{1F3B5} ${currentPlaying.title}\n\u{1F464} ${currentPlaying.author}`, icon:'./img/ico.png'})
			playNotifi.show()
			setTimeout(() => {
				playNotifi.close();
			}, 5000)
			tray.setToolTip(`Playing - Music: ${currentPlaying.title} - ${currentPlaying.author}`)
			tray.setImage('./img/ico.png')
			client.setActivity({
				details:`\u{1F3B5} ${currentPlaying.title}`,
				state:`\u{1F464} ${currentPlaying.author}`,
				newTimeStamp,
				largeImageKey:config.playing,
				largeImageText: `YouTube Music v${pkg.version}`,
				smallImageKey:config.play,
				smallImageText: 'Playing',
				instance: false,
			})
			clearInterval(ganzerozos);
		}
	}, 300)
})

webview.addEventListener('media-paused', () => {
	is_playing = true;
	let newTimeStamp = new Date()
	tray.setToolTip(`Paused - Music: ${currentPlaying.title} - ${currentPlaying.author}`)
	tray.setImage('./img/ico.png')
	client.setActivity({
		details:`\u{1F3B5} ${currentPlaying.title}`,
		state:`\u{1F464} ${currentPlaying.author}`,
		newTimeStamp,
		largeImageKey:config.playing,
		largeImageText: `YouTube Music v${pkg.version}`,
		smallImageKey:config.pause,
		smallImageText: 'Paused',
		instance: false,
	})
})

webview.addEventListener('did-stop-loading', () => {
	let url = webview.getURL()
	let newTimeStamp = new Date()
	if(url.startsWith('https://music.youtube.com/search?q=')){
		if(!isReady){ return; }
		webview.getWebContents().executeJavaScript(`
			try{
				let video = document.getElementsByClassName('video-stream html5-main-video');
				video[0].pause();
			}
			catch(e){}
		`, { userGesture:true })
		in_search = true;
		let srch_qry = decodeURI(url.slice('https://music.youtube.com/search?q='.length, url.length)).replace(/\+/g, ' ');
		tray.setToolTip(`Searching: ${srch_qry}`)
		tray.setImage('./img/icon2.png')
		client.setActivity({
			details:'Searching...',
			state:`${'\u{1F50D}'} ${srch_qry}`,
			newTimeStamp,
			largeImageKey:config.idle,
			largeImageText: `YouTube Music v${pkg.version}`,
			smallImageKey:config.search,
			smallImageText: 'Searching',
			instance: false,
		});
	}
	else if(url.startsWith('https://music.youtube.com/watch?v=')){
		if(!isReady){ return; }
		let new_url = 'https://www.youtube.com/watch?v=' + url.slice('https://music.youtube.com/watch?v='.length, url.length)
		ytdl.getInfo(new_url, (err, info) => {
			currentPlaying = new video_info(url, info.title, info.author.name)
			is_playing = true;
			webview.getWebContents().executeJavaScript(`
			try{
				let video = document.getElementsByClassName('video-stream html5-main-video');
				video[0].play();
			}
			catch(e){}
			`, { userGesture:true })
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
			instance: false,
		})
	}
	console.log(url);
});

function manipulate_window(mode){
	switch(mode){
		case 'close':
			remote.getCurrentWindow().close();
			break;
		case 'minimize':
			remote.getCurrentWindow().minimize();
			break;
		case 'maximize':
			let win = remote.getCurrentWindow()
			let elcontrol = document.getElementById('control')
			if(!win.isMaximized()){
				win.maximize();
			}
			else{
				win.unmaximize();
			}
			break;
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
		instance: false,
	})
});

function rpc_connect_notifi(fail){
	if(!fail){
		let not2 = new remote.Notification({title:pkg.productName, body:'Successfully connected to Discord RPC!', icon:'./img/Discord-Logo-Color.png'})
		not2.show()
		setTimeout(() => {
			not2.close()
		}, 5000)
	}
	else{
		let not = new remote.Notification({title:pkg.productName, body:'Failed to connect to Discord RPC', body:`Attempting to connect in ${segs}s...`, icon:'./img/Discord-Logo-Color.png'})
		not.show()
		setTimeout(() => {
			not.close();
		}, 5000)	
	}
}

client.login({ clientId: clientid })
	.catch((e) => {
		console.log(e);
		let segs = 5
		rpc_connect_notifi(true);
		let logInterval = setInterval(() => {
			client.login({ clientId: clientid })
				.catch((e) => {
					rpc_connect_notifi(true);
				})
				.then(() => {
					clearInterval(logInterval);
				});
		}, segs * 1000)
	})
	.then(() => {
		rpc_connect_notifi(false);
	})