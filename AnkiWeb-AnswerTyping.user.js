// ==UserScript==
// @name        AnkiWeb - AnswerTyping
// @namespace   JaTar Scripts
// @match       https://ankiuser.net/study
// @require     https://rawcdn.githack.com/google/diff-match-patch/62f2e689f498f9c92dbc588c58750addec9b1654/javascript/diff_match_patch.js
// @require     https://rawcdn.githack.com/Ja-Tar/ankiweb_answer_typing/9852a2fb00376c62f0a195c36590d6b1af4cc082/compareTexts.js
// @updateURL   https://raw.githubusercontent.com/JaTar/ankiweb_answer_typing/main/AnkiWeb-AnswerTyping.user.js
// @downloadURL https://raw.githubusercontent.com/JaTar/ankiweb_answer_typing/main/AnkiWeb-AnswerTyping.user.js
// @grant       none
// @version     1.0.2
// @author      JaTar
// ==/UserScript==

function dodajHriTextbox() {
    const qaDiv = document.querySelector('div#qa');
    const hrElement = document.querySelector('hr#answer');
    const questionElement = document.querySelector('question');

    if (qaDiv && !hrElement) {
        const hrElement = document.createElement('hr');
        hrElement.id = 'answer';
        qaDiv.appendChild(hrElement);
    }

    if (qaDiv && questionElement && !hrElement) {
        if (!document.querySelector('input#textbox')) {
            console.log("Textbox nie istnieje");
            const textBox = document.createElement('input');
            textBox.setAttribute("autocomplete", "off");
            textBox.type = 'text';
            textBox.id = 'textbox';
            qaDiv.appendChild(textBox);
        }
    }
}

function sprawdzOdpowiedz(userAnswer) {
    const qaDiv = document.querySelector('div#qa');
    let hrElement = qaDiv.querySelector('hr#answer');
    var answerAttribute = null;
    if (qaDiv.querySelector('question')) {
        answerAttribute = qaDiv.querySelector('question').getAttribute('anwser');
    }

    if (!userAnswer) {
        userAnswer = ""
    }

    if (answerAttribute) {
        answerAttribute = answerAttribute.replace(/<\/?[^>]+(>|$)/g, "");
    }

    if (answerAttribute && hrElement) {
        const resultDiv = document.createElement('div');
        resultDiv.innerHTML = compareTexts(answerAttribute, userAnswer);
        try {
            resultDiv.id = 'result';
            qaDiv.insertBefore(resultDiv, document.querySelector('br'));
        } catch (e) {
            if (!e instanceof DOMException) {
                throw e;
            }
        }
    }
}


function zapiszOdpowiedz() {
    var textBox = document.querySelector('input#textbox');
    const userAnswer = textBox.value;
    localStorage.setItem('savedAnswer', userAnswer);
}

function wczytajOdpowiedz() {
    var textBox = document.querySelector('input#textbox');
    const savedAnswer = localStorage.getItem('savedAnswer');
    sprawdzOdpowiedz(savedAnswer);
}

function wyczyscOdpowiedz() {
    const savedAnswer = localStorage.getItem('savedAnswer');
    if (savedAnswer) {
        localStorage.setItem('savedAnswer', "");
    }
}

function inputlisiner() {
    var textBox = document.querySelector('input#textbox');
    textBox.addEventListener('input', function () {
        const userAnswer = textBox.value;
        zapiszOdpowiedz(userAnswer);
    });
}

setInterval(function () {
    const qaDiv = document.querySelector('div#qa');
    if (qaDiv.querySelector('input')) {
        inputlisiner();
    }
}, 1000);

document.addEventListener('click', function (event) {
    if (event.target.matches('button') && event.target.textContent === 'Show Answer') {
        console.log("Show Answer")
        const intervalID = setInterval(function () {
            const qaDiv = document.querySelector('div#qa');
            if (qaDiv.querySelector('hr#answer')) {
                clearInterval(intervalID); // Zatrzymaj sprawdzanie po pojawieniu się <hr id="answer">
                wczytajOdpowiedz();
                wyczyscOdpowiedz();
            }
        }, 1000);
    }
});

// Uruchamiamy funkcję co 1 sekundę
setInterval(dodajHriTextbox, 1000);
