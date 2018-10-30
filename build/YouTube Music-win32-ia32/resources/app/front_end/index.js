const { remote, ipcRenderer } = require('electron');
const fs = require('fs');
const ytdl = require('ytdl-core');
const config = require('../config.json');
const pkg = require('../package.json');
const startTimestamp = new Date()
var isReady = false;
var currentPlaying = null;
var webView = document.getElementById('webview');

// Create Icon in TaskBar //
var tray = new remote.Tray('./img/icon2.png')
tray.setToolTip('Idling...')
tray.on('click', () => {
	remote.getCurrentWindow().show();
})

// Global Vars //
var in_search = false;

var is_playing = false;

// Functions //
function decode(str, idx){
	return String.fromCharCode(str.charCodeAt(idx));
}

function video_info(url, title, author) {
	this.url = url;
	this.title = title;
	this.author = author;
}

function setActivity(arg){
	let Data = {name:'activity', value:arg}
	ipcRenderer.send('request-mainprocess-action', Data);
}

// WebView Events //

// Playing //
webview.addEventListener('media-started-playing', () =>{
	let playingDelay = setInterval(() => {
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
			setActivity({
				details:`\u{1F3B5} ${currentPlaying.title}`,
				state:`\u{1F464} ${currentPlaying.author}`,
				newTimeStamp,
				largeImageKey:config.playing,
				largeImageText: `YouTube Music v${pkg.version}`,
				smallImageKey:config.play,
				smallImageText: 'Playing',
				instance: false,
			})
			clearInterval(playingDelay);
		}
	}, 300)
})

// Paused //
webview.addEventListener('media-paused', () => {
	if(in_search){return}
	is_playing = true;
	let newTimeStamp = new Date()
	tray.setToolTip(`Paused - Music: ${currentPlaying.title} - ${currentPlaying.author}`)
	tray.setImage('./img/ico.png')
	setActivity({
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


// URL Handler //
webview.addEventListener('did-stop-loading', () => {
	let url = webview.getURL()
	let newTimeStamp = new Date()
	if(url.startsWith('https://music.youtube.com/search?q=')){
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
		setActivity({
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
		in_search = false;
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
		in_search = false;
		setActivity({
			details:'Just idling...',
			state:'and making some stuff',
			startTimestamp,
			largeImageKey:config.idle,
			largeImageText: `YouTube Music v${pkg.version}`,
			instance: false,
		})
	}
});

// Window Control Function //
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

