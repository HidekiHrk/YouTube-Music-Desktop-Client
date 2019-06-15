const os = require('os');
const fs = require('fs');

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

module.exports = userConfig;