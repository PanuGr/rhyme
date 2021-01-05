const text = document.getElementById('userWord');
const parameters = document.querySelector('select');
const results = document.querySelector('ol');
const textarea = document.querySelector('textarea');
textarea.innerText = "";
const button = document.querySelector('button');

button.onclick = function () {
    fetch(`https://api.datamuse.com/words?${parameters[parameters.selectedIndex].value}=${text.value}&md=pd`)
        .then((res) => res.json())
        .then(results.innerHTML = '')
        .then((data) => {
            if (data[0].defs === undefined) {
                return alert('No results found. Try another option');}
            let actualWords = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i].defs !== undefined) {
                    actualWords.push(data[i]);
                }
            }
            for (let j = 0; j < actualWords.length; j++) {
                const li = document.createElement('li');
                li.classList = 'list-group-item m-1 ';
                setAttributes(li, { 'data-toggle': "tooltip", 'data-placement': "top", 'title': `${actualWords[j].defs[0]} ` })
                const words = document.createTextNode(`${actualWords[j].word}`);
                li.appendChild(words);
                results.appendChild(li);
            }
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-toggle="tooltip"]'))
            const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl)
            });
        })
        .then(() => {
            const li = document.getElementsByTagName('li');
            for (let i = 0; i < li.length; i++) {
                li[i].addEventListener('click', function () {
                    textarea.value += " " + li[i].textContent
                })
            }
        })
    return false;
};

function setAttributes(el, attrs) {
    for (let key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}
