const { remote, ipcRenderer } = require('electron');

function convert(element, to){
    let new_element = document.createElement(to);
    new_element.id = element.id;
    new_element.innerHTML = element.innerHTML;
    element.parentNode.replaceChild(new_element, element);
}

function transformTexts(text_arr){
    text_arr.forEach(el => {
        el_obj = document.getElementById(el);
        if(el_obj.scrollWidth > el_obj.offsetWidth ||
            el_obj.scrollHeight > el_obj.offsetHeight + 4){
            convert(el_obj, 'marquee');
        }
    });
}

function change_name(textid, newname){
    document.getElementById(textid).innerHTML = newname;
}

function change_thumb(uri){
    document.querySelector("#thumbnail").src = uri;
}

ipcRenderer.on('notify', (event, arg) => {
    change_name('name', arg.name);
    change_name('author', arg.author);
    change_thumb(arg.thumbnail);
    transformTexts(['name', 'author']);
})