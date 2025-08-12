let balance = Number(localStorage.getItem('balance')) || 100;
let skins = JSON.parse(localStorage.getItem('skins')) || [];

const balanceEl = document.getElementById('balance');
const depositBtn = document.getElementById('depositBtn');
const openCaseBtn = document.getElementById('openCaseBtn');
const skinsList = document.getElementById('skinsList');
const battleBtn = document.getElementById('battleBtn');
const battleResult = document.getElementById('battleResult');

const cases = [
    { name: 'Skin A', rarity: 50 },
    { name: 'Skin B', rarity: 30 },
    { name: 'Skin C', rarity: 15 },
    { name: 'Skin D (legendary)', rarity: 5 },
];

function updateUI() {
    balanceEl.textContent = `Twój rower: ${balance}`;
    skinsList.innerHTML = skins.map(skin => `<li>${skin}</li>`).join('');
    battleResult.textContent = '';
}

function deposit() {
    balance += 10;
    localStorage.setItem('balance', balance);
    updateUI();
}

function openCase() {
    if (balance < 20) {
        alert('Masz za mało roweru, wpłać więcej!');
        return;
    }
    balance -= 20;

    // Losowanie skina wg rarity
    const rand = Math.random() * 100;
    let sum = 0;
    let wonSkin = '';
    for (const c of cases) {
        sum += c.rarity;
        if (rand <= sum) {
            wonSkin = c.name;
            break;
        }
    }
    skins.push(wonSkin);
    localStorage.setItem('balance', balance);
    localStorage.setItem('skins', JSON.stringify(skins));
    updateUI();
}

function battle() {
    if (skins.length === 0) {
        alert('Nie masz skinów do walki!');
        return;
    }
    const win = Math.random() < 0.5;
    if (win) {
        balance += 30;
        battleResult.textContent = 'Wygrałeś bitwę! +30 roweru!';
    } else {
        const lostSkin = skins.pop();
        battleResult.textContent = `Przegrałeś bitwę! Straciłeś skina: ${lostSkin}`;
    }
    localStorage.setItem('balance', balance);
    localStorage.setItem('skins', JSON.stringify(skins));
    updateUI();
}

depositBtn.addEventListener('click', deposit);
openCaseBtn.addEventListener('click', openCase);
battleBtn.addEventListener('click', battle);

updateUI();
