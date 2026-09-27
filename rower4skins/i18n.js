// Rower4Skins — tłumaczenia interfejsu. Tekst strony jest pisany po polsku; po zmianie języka
// każdy nowy lub zmieniony fragment tekstu jest podmieniany według słownika (TR) albo wzorców (TRP).
// Elementy z translate="no" (nazwy skinów, nicki) zostają bez zmian.
'use strict';

const LANGS = { pl: 'Polski', en: 'English', zh: '中文', wit: 'Witowy 🤪' };

const TR = { en: {}, zh: {}, wit: {} };
const TRP = []; // [regex, { en: fn, zh: fn, wit: fn }]

Object.assign(TR.en, {
"AKTYWNA": "ACTIVE",
"AKTYWNE BITWY": "ACTIVE BATTLES",
"Anuluj bitwę": "Cancel battle",
"Armia Goryli": "Gorilla Army",
"BITWY ROWER4SKINS": "ROWER4SKINS BATTLES",
"BITWY SKRZYNEK": "CASE BATTLES",
"BMX sąsiada": "Neighbour's BMX",
"Balonik": "Balloon",
"Bitwy": "Battles",
"Bitwy z kolegami działają, gdy strona jest otwarta przez link claude.ai, a koledzy są zaproszeni mailem. Teraz możesz grać z botami.": "Battles with friends work when the page is opened through the claude.ai link and your friends are invited by email. For now you can play against bots.",
"Brak operacji w portfelu.": "No wallet transactions yet.",
"Brak powiadomień.": "No notifications.",
"Brak historii przedmiotów.": "No item history yet.",
"Bronie": "Weapons",
"CODZIENNA SKRZYNKA": "DAILY CASE",
"CODZIENNA SKRZYNKA I SKRZYNKI ZA POZIOMY": "DAILY CASE AND LEVEL CASES",
"CZEKA": "WAITING",
"CZEKA NA GRACZA": "WAITING FOR PLAYER",
"Cena do": "Price to",
"Cena malejąco": "Price: high to low",
"Cena od": "Price from",
"Cena rosnąco": "Price: low to high",
"Ceny liczone są w dolarach i przeliczane po stałym kursie.": "Prices are kept in dollars and converted at a fixed rate.",
"Codzienna Skrzynka": "Daily Case",
"Codzienna skrzynka": "Daily case",
"Czekamy na gracza…": "Waiting for a player…",
"DARMOWA": "FREE",
"DARMOWE": "FREE",
"DARMOWE SKRZYNKI": "FREE CASES",
"DODAJ": "ADD",
"DOŁADUJ KONTO (+10%)": "TOP UP (+10%)",
"DOŁĄCZ": "JOIN",
"Demo": "Demo",
"Dodaj skrzynkę": "Add case",
"Długa Szyja": "Long Neck",
"Długość szyfru:": "Code length:",
"Dźwięk": "Sound",
"Dźwięk i animacje": "Sound and animations",
"Dźwięki ruletki": "Roulette sounds",
"ENGWE EP-2.0 Boost": "ENGWE EP-2.0 Boost",
"Elektryk miejski": "City e-bike",
"Elita": "Elite",
"Event": "Event",
"GRACZE": "PLAYERS",
"GRASZ": "PLAYING",
"GWARANTOWANY": "GUARANTEED",
"Gemy": "Gems",
"Gemy zdobywasz za granie: 4 gemy za każdy wydany dolar, 25× poziom za każdy awans, gemy za wpłaty rowerów, misje i kody. Im wyższy poziom skrzynki, tym więcej Covert i noży.": "You earn gems by playing: 4 gems for every dollar spent, 25× your level for each level-up, plus gems for bike deposits, missions and codes. The higher the case tier, the more Covert skins and knives.",
"Gotowe": "Done",
"Gotowy": "Ready",
"Gołąb z KFC": "KFC Pigeon",
"Gracze z otwartą stroną": "Players with the page open",
"Góral z marketu": "Supermarket MTB",
"HARDCORE: 35 sekund, mgła, dwa pasy zawsze zablokowane, a tempo rośnie prawie dwukrotnie.": "HARDCORE: 35 seconds, fog, two lanes always blocked, and the speed almost doubles.",
"HISTORIA PORTFELA": "WALLET HISTORY",
"HISTORIA PRZEDMIOTÓW": "ITEM HISTORY",
"I DARMOWE SKRZYNKI ZA POZIOMY": "AND FREE LEVEL CASES",
"Im więcej, tym weselej!": "The more, the merrier!",
"Inny rower": "Another bike",
"Jak działają poziomy?": "How do levels work?",
"Język": "Language",
"KOD PROMOCYJNY": "PROMO CODE",
"KONIEC": "FINISHED",
"KONTRAKTY": "CONTRACTS",
"KOSZT SKRZYNEK": "CASE COST",
"Kanadyjski Syrop": "Canadian Syrup",
"Karbonowa kolarzówka": "Carbon road bike",
"Klikaj „POMPUJ” (albo spację) tak szybko, jak umiesz, zanim skończy się czas.": "Tap “PUMP” (or Space) as fast as you can before time runs out.",
"Kliknij skrzynkę, żeby dodać rundę. Maksymalnie 20 rund.": "Click a case to add a round. Up to 20 rounds.",
"Kod promocyjny": "Promo code",
"Kody promocyjne": "Promo codes",
"Kolekcjoner": "Collector",
"Kolor avatara": "Avatar colour",
"Konfetti": "Confetti",
"Kontrakt": "Contract",
"Koszt próby": "Cost per try",
"Kąt:": "Angle:",
"Legenda": "Legendary",
"Legendy": "Legends",
"Liczba graczy": "Players",
"Ląduje w Plecaku": "Lands in the Backpack",
"MEME": "MEME",
"MISJE EVENTU": "EVENT MISSIONS",
"MOJE BITWY": "MY BATTLES",
"Menu": "Menu",
"Misje za gemy": "Missions for gems",
"Mistrz": "Master",
"Mięsny Cyborg": "Meat Cyborg",
"Miś Miodek": "Honey Bear",
"Możliwy wynik": "Possible result",
"Można dołączyć": "Can join",
"MÓJ EKWIPUNEK": "MY INVENTORY",
"Najdroższe": "Most expensive",
"Najlepsze dropy": "Top drops",
"Najnowsze": "Newest",
"Najpierw znajdź tę skrzynkę na banerze na stronie głównej.": "First find this case on the banner on the home page.",
"Najstarsze": "Oldest",
"Najtańsze": "Cheapest",
"Napompuj oponę": "Pump the tyre",
"Nazwa A–Z": "Name A–Z",
"Nazwa przedmiotu": "Item name",
"Nazwa skrzynki": "Case name",
"Nick": "Nickname",
"Nie tym razem": "Not this time",
"Nikt jeszcze nie stworzył bitwy.": "Nobody has created a battle yet.",
"Nowicjusz": "Starter",
"Nowość!": "New!",
"Noże": "Knives",
"ODBIERZ": "CLAIM",
"ODBIERZ CODZIENNĄ SKRZYNKĘ": "CLAIM THE DAILY CASE",
"OTWÓRZ ZA DARMO": "OPEN FOR FREE",
"Odbierz": "Claim",
"Oddajesz": "You give",
"Odkrywca": "Explorer",
"Oglądaj": "Watch",
"Omijaj kamienie i dziury, zmieniając pas strzałkami albo przyciskami.": "Dodge rocks and potholes by switching lanes with the arrows or buttons.",
"Opłata jest pobierana od razu i wraca, jeśli anulujesz bitwę przed startem.": "The fee is charged right away and refunded if you cancel before the battle starts.",
"Osiągnij poziom 5": "Reach level 5",
"Ostateczna": "Ultimate",
"Otrzymujesz": "You get",
"Otwieraj ją za darmo raz na 24 godziny.": "Open it for free once every 24 hours.",
"Otwierajcie te same skrzynki, a najlepszy drop zgarnia wszystko. Graj z kolegami, którzy mają otwartą tę stronę — na żywo.": "Open the same cases — the best drop takes it all. Play live with friends who have this page open.",
"Otwórz 10 skrzynek": "Open 10 cases",
"Otwórz ponownie": "Open again",
"PODPISZ KONTRAKT": "SIGN CONTRACT",
"PODSTAWOWE INFORMACJE O TWOIM KONCIE": "BASIC INFORMATION ABOUT YOUR ACCOUNT",
"POMPUJ!": "PUMP!",
"POŁĄCZ OD 3 DO 10 SKINÓW W JEDEN NOWY": "COMBINE 3 TO 10 SKINS INTO A NEW ONE",
"PREMIUM": "PREMIUM",
"PREZENTY": "GIFTS",
"PRZEPUSTKA URODZINOWA": "BIRTHDAY PASS",
"PRZEZNACZENIE": "DESTINY",
"Patrz uważnie…": "Watch closely…",
"Pies Sąsiada": "Neighbour's Dog",
"Podpisz kontrakt": "Sign a contract",
"Podstawowy tryb. Wygrywa gracz z najwyższą łączną wartością dropów i zabiera wszystko. Pozostali dostają gwarantowany skin.": "Standard mode. The player with the highest total drop value wins and takes everything. Everyone else gets a guaranteed skin.",
"Odwrócone zasady. Wygrywa gracz z najniższą łączną wartością dropów i zabiera wszystko.": "Reversed rules. The player with the lowest total drop value wins and takes everything.",
"Liczy się tylko ostatnia runda. Wygrywa ten, kto wylosuje najdroższy skin w ostatniej skrzynce.": "Only the last round counts. Whoever gets the most expensive skin from the last case wins.",
"Podsumowanie": "Summary",
"Poszukiwacz": "Adventurer",
"Powiadomienia": "Notifications",
"Pretendent": "Challenger",
"Profil": "Profile",
"Przywołaj bota": "Summon a bot",
"Przywołaj wszystkie boty": "Summon all bots",
"RANKING": "RANKING",
"RUNDY": "ROUNDS",
"Ranking graczy": "Player ranking",
"Ranking według łącznej kwoty wydanej na skrzynki i bitwy. Pozostali gracze to boty.": "Ranked by total amount spent on cases and battles. The other players are bots.",
"Reset konta": "Reset account",
"Resetuj konto": "Reset account",
"Reszta na saldo": "Change to balance",
"Romet Jubilat": "Romet Jubilat",
"Rowerowe Urodziny": "Bike Birthday",
"Rzadkości": "Rarities",
"Rękawice": "Gloves",
"SKLEP GEMÓW": "GEM SHOP",
"SKRZYNKI EXP": "EXP CASES",
"SKRZYNKI ZA GEMY": "GEM CASES",
"SKRZYNKĘ": "CASE",
"SPRZEDAJ WSZYSTKO": "SELL ALL",
"SPRÓBUJ": "TRY",
"SPRÓBUJ ZNALEŹĆ UKRYTĄ SKRZYNKĘ NA BANERZE!": "TRY TO FIND THE HIDDEN CASE ON THE BANNER!",
"START": "START",
"STOP!": "STOP!",
"STWÓRZ": "CREATE",
"STWÓRZ BITWĘ": "CREATE BATTLE",
"Saldo": "Balance",
"Skinów w kontrakcie": "Skins in contract",
"Sklep": "Shop",
"Skrzynki": "Cases",
"Skrzynki EXP": "EXP cases",
"Skrzynki memów": "Meme cases",
"Skrzynki twórców": "Creator cases",
"Skrzynki urodzinowe": "Birthday cases",
"Skrzynki za gemy": "Gem cases",
"Składak Wigry 3": "Wigry 3 folding bike",
"Smocza Legenda": "Dragon Legend",
"Sortowanie": "Sorting",
"Sortuj": "Sort",
"Sprzedaj": "Sell",
"Sprzedaj wszystko": "Sell all",
"Spróbuj ponownie": "Try again",
"Start za chwilę…": "Starting soon…",
"Stwórz własną bitwę. Żeby grać z kolegami, otwórzcie stronę przez link claude.ai (zaproszenie mailem).": "Create your own battle. To play with friends, open the page through the claude.ai link (email invite).",
"Stwórz własną — koledzy na serwerze zobaczą ją od razu i będą mogli dołączyć.": "Create your own — friends on the server will see it right away and can join.",
"Supremacja": "Supreme",
"Symulator · wirtualne monety": "Simulator · virtual coins",
"Szosówka Kross": "Kross road bike",
"Szukaj skina": "Search skin",
"Szybkie otwieranie": "Fast opening",
"Szyfr kłódki": "Padlock code",
"TWOJE GEMY": "YOUR GEMS",
"TWOJE PRZEDMIOTY": "YOUR ITEMS",
"TWÓJ PROFIL": "YOUR PROFILE",
"TY": "YOU",
"TYLKO PRAWDZIWI GRACZE — BOTY TYLKO NA TWOJE ŻYCZENIE": "REAL PLAYERS ONLY — BOTS ONLY WHEN YOU ASK",
"To jest symulator": "This is a simulator",
"To symulator: rowery i dolary są wirtualne, nic nie jest pobierane.": "It's a simulator: bikes and dollars are virtual, nothing is charged.",
"Tort Urodzinowy": "Birthday Cake",
"Trafienia:": "Hits:",
"Trafienie w punkt": "Perfect timing",
"Tropiciel": "Seeker",
"Tryb bitwy": "Battle mode",
"Tryb lokalny": "Local mode",
"Trzymaj Varga na tylnym kole: GAZ (↑ / W / spacja) podnosi przód, HAMULEC (↓ / S) go opuszcza. Nie dotknij przodem ziemi i nie przewróć się do tyłu. Wiatr i nierówności będą Ci przeszkadzać coraz mocniej.": "Keep the Varg on its back wheel: THROTTLE (↑ / W / Space) lifts the front, BRAKE (↓ / S) lowers it. Don't let the front touch down and don't flip over backwards. Wind and bumps get stronger and stronger.",
"Twoja szansa:": "Your chance:",
"Twoje przedmioty": "Your items",
"Twój drop!": "Your drop!",
"Twoje dropy!": "Your drops!",
"Twój poziom": "Your level",
"Tylko ulubione": "Favourites only",
"UKRYJ": "HIDE",
"POKAŻ": "SHOW",
"USTAWIENIA": "SETTINGS",
"Ukraina z piwnicy": "Basement Ukraina",
"Ukryta Skrzynka": "Hidden Case",
"Ukryta skrzynka": "Hidden case",
"Ulubione": "Favourites",
"Ustawienia": "Settings",
"Usuwa saldo, gemy, poziom i wszystkie skiny.": "Removes your balance, gems, level and all skins.",
"W strefie:": "In zone:",
"WARTOŚĆ BITWY": "BATTLE VALUE",
"WARTOŚĆ:": "VALUE:",
"WPISZ KOD": "ENTER CODE",
"WPŁAĆ": "DEPOSIT",
"WSZYSTKIE": "ALL",
"WYBIERZ SKRZYNKI I ZASADY": "CHOOSE CASES AND RULES",
"WYBIERZ WYMARZONY SKIN I SWOJĄ SZANSĘ": "PICK YOUR DREAM SKIN AND YOUR CHANCE",
"WYKONUJ ZADANIA I ZBIERAJ GEMY": "COMPLETE TASKS AND COLLECT GEMS",
"WYMIENNIK": "EXCHANGER",
"WYMIEŃ": "EXCHANGE",
"Waluta": "Currency",
"Wartość wkładu": "Input value",
"Wciskaj strzałki w podanej kolejności. Pomyłka zabiera czas.": "Press the arrows in the given order. A mistake costs time.",
"Wheelie OMEGA": "Wheelie OMEGA",
"Wielki Prezent": "Big Present",
"Wirtualne monety i skiny. Brak prawdziwych pieniędzy, wypłat i przedmiotów Steam. Stan gry zapisuje się tylko w Twojej przeglądarce.": "Virtual coins and skins. No real money, withdrawals or Steam items. Your progress is saved only in your browser.",
"Wolne miejsce": "Free slot",
"Wpisz kod i odbierz bonus. Każdy kod działa raz.": "Enter a code and claim a bonus. Each code works once.",
"Wpisz kod, np.": "Enter a code, e.g.",
"Wpłać rower": "Deposit a bike",
"Wróć": "Back",
"Wróć do bitew": "Back to battles",
"Wszystkie dropy": "All drops",
"Wszystkie monety, gemy i skiny są wirtualne. Nie da się ich kupić ani wypłacić.": "All coins, gems and skins are virtual. They can't be bought or withdrawn.",
"Wybierz skin": "Choose a skin",
"Wybierz skin z listy poniżej.": "Choose a skin from the list below.",
"Wygraj bitwę skrzynek": "Win a case battle",
"Wygrałeś bitwę!": "You won the battle!",
"Wygrałeś!": "You won!",
"Wyjec": "Howler",
"Wymiennik": "Exchanger",
"Wystarczające saldo": "Enough balance",
"ZAMIEŃ SWOJE SKINY NA INNE — RESZTA WRACA NA SALDO": "SWAP YOUR SKINS FOR OTHERS — THE CHANGE GOES TO YOUR BALANCE",
"ZOBACZ": "VIEW",
"Zamknij": "Close",
"Zapamiętaj kolejność zapalających się pól i powtórz ją bez błędu.": "Memorise the order the pads light up and repeat it without a mistake.",
"Zapisz": "Save",
"Zatrzymaj": "Keep",
"Zatrzymaj wskaźnik w zielonej strefie. Każde trafienie przesuwa strefę.": "Stop the marker in the green zone. Each hit moves the zone.",
"Zawartość skrzynki": "Case contents",
"Zdecyduj, jak potoczy się bitwa!": "Decide how the battle plays out!",
"Zdobywasz 100 EXP za każdy wydany $1. Skrzynki poziomowe otwierasz raz na 24 h.": "You get 100 EXP for every $1 spent. Level cases can be opened once every 24 h.",
"Zjazd z góry": "Downhill ride",
"Zmiana biegów": "Gear shift",
"Zmień nick i kolor": "Change nickname and colour",
"Znajdź ukrytą skrzynkę na banerze": "Find the hidden case on the banner",
"Zombi": "Zombie",
"Złodziej Rowerów": "Bike Thief",
"dni": "days",
"godz": "hrs",
"min": "min",
"sek": "sec",
"szansa": "chance",
"i gemy.": "and gems.",
"Łowca": "Hunter",
"Łączna wartość:": "Total value:",
"Średnio kontrakt zwraca ok. 95% wartości wkładu. Wkład przepada.": "On average a contract returns about 95% of the input value. The input is lost.",
"Świeczka": "Candle",
"Żeby wpłacić rower, musisz wygrać minigrę. Im droższy rower, tym trudniejsza gra. Nagroda: wartość roweru": "To deposit a bike you have to win a minigame. The pricier the bike, the harder the game. Reward: the bike's value",
"Życia:": "Lives:",
"▲ GAZ": "▲ THROTTLE",
"▼ HAMULEC": "▼ BRAKE",
"★★★★★ HARDCORE": "★★★★★ HARDCORE",
"Udało się!": "You did it!",
"Super": "Great",
"Wpłać kolejny": "Deposit another",
"Na konto wpada": "Credited to your account:",
"Czeka na graczy": "Waiting for players",
"Bitwa czeka na graczy.": "The battle is waiting for players.",
"Wyjdź": "Leave",
"Serwer online": "Server online",
"Łączenie…": "Connecting…",
"Tej bitwy już nie ma.": "This battle no longer exists.",
"Nie masz jeszcze żadnych bitew.": "You don't have any battles yet.",
"Przegrana": "Lost",
"Czekam, aż host Cię przyjmie…": "Waiting for the host to accept you…",
"HOST": "HOST",
"GRACZ": "PLAYER",
"BOT": "BOT",
"PEŁNA": "FULL",
"OGLĄDAJ": "WATCH",
"W TOKU": "IN PROGRESS",
"Ekwipunek jest pusty.": "Your inventory is empty.",
"Do skrzynek": "To the cases",
"Nic nie pasuje do wyszukiwania.": "Nothing matches your search.",
"Otwórz ją za darmo.": "Open it for free.",
"Nie masz skinów. Otwórz kilka skrzynek.": "You have no skins. Open a few cases.",
"Brak przedmiotów.": "No items.",
"Żadna skrzynka nie pasuje do filtrów.": "No case matches the filters.",
"Gołąb zjadł wszystkie Twoje skiny.": "The pigeon ate all your skins.",
"Otwórz skrzynkę, żeby coś mu uciekło.": "Open a case so something gets away from it.",
"Wydaj łącznie $50 na skrzynki i bitwy": "Spend a total of $50 on cases and battles",
"Bitwa anulowana, opłata wróciła.": "Battle cancelled, fee refunded.",
"Konto zresetowane.": "Account reset.",
"Maksymalnie 10 skinów w kontrakcie.": "Up to 10 skins in a contract.",
"Maksymalnie 20 rund.": "Up to 20 rounds.",
"Masz już otwartą bitwę. Zakończ ją albo anuluj.": "You already have an open battle. Finish or cancel it.",
"Nick nie może być pusty.": "Nickname can't be empty.",
"Nie możesz dołączyć do tej bitwy.": "You can't join this battle.",
"Nieprawidłowy kod.": "Invalid code.",
"Przegrałeś tę bitwę.": "You lost this battle.",
"Siedzisz już w innej bitwie.": "You're already in another battle.",
"Ten kod został już użyty.": "This code has already been used.",
"Tym razem się nie udało.": "No luck this time.",
"Wyszedłeś z bitwy, opłata wróciła.": "You left the battle, fee refunded.",
"Za mało środków na tę bitwę.": "Not enough balance for this battle.",
"Za mało środków. Wpłać rower!": "Not enough balance. Deposit a bike!",
"Za mało środków.": "Not enough balance.",
"Zapisano nick.": "Nickname saved.",
"Znalazłeś ukrytą skrzynkę! Otwórz ją za darmo.": "You found the hidden case! Open it for free.",
"Znalazłeś ukrytą skrzynkę!": "You found the hidden case!",
"Zwrócono opłatę za niedokończoną bitwę.": "Refunded the fee for an unfinished battle.",
"Wywrotka! Przeszkoda na trasie.": "Crash! Obstacle on the track.",
"Przednie koło uderzyło w ziemię. Wywrotka!": "The front wheel hit the ground. Crash!",
"Za mocno! Varg przewrócił się do tyłu.": "Too much! The Varg flipped over backwards.",
"Dźwięk włączony": "Sound on",
"Dźwięk wyłączony": "Sound off",
"Ranking": "Ranking",
"Kolarz": "Rider",
"Wolne": "Free",
"ROWEROWE": "BIKE",
"URODZINY": "BIRTHDAY",
"Twoja kolej! Powtórz szyfr.": "Your turn! Repeat the code."
});
Object.assign(TR.zh, {
"AKTYWNA": "进行中",
"AKTYWNE BITWY": "进行中的对战",
"Anuluj bitwę": "取消对战",
"Armia Goryli": "猩猩军团",
"BITWY ROWER4SKINS": "ROWER4SKINS 对战",
"BITWY SKRZYNEK": "箱子对战",
"BMX sąsiada": "邻居的BMX",
"Balonik": "气球",
"Bitwy": "对战",
"Bitwy z kolegami działają, gdy strona jest otwarta przez link claude.ai, a koledzy są zaproszeni mailem. Teraz możesz grać z botami.": "当页面通过 claude.ai 链接打开且朋友通过邮件受邀时，才能和朋友对战。现在你可以和机器人对战。",
"Brak operacji w portfelu.": "钱包暂无记录。",
"Brak powiadomień.": "暂无通知。",
"Brak historii przedmiotów.": "暂无物品记录。",
"Bronie": "武器",
"CODZIENNA SKRZYNKA": "每日箱子",
"CODZIENNA SKRZYNKA I SKRZYNKI ZA POZIOMY": "每日箱子和等级箱子",
"CZEKA": "等待中",
"CZEKA NA GRACZA": "等待玩家",
"Cena do": "最高价格",
"Cena malejąco": "价格从高到低",
"Cena od": "最低价格",
"Cena rosnąco": "价格从低到高",
"Ceny liczone są w dolarach i przeliczane po stałym kursie.": "价格以美元计算，并按固定汇率换算。",
"Codzienna Skrzynka": "每日箱子",
"Codzienna skrzynka": "每日箱子",
"Czekamy na gracza…": "等待玩家加入…",
"DARMOWA": "免费",
"DARMOWE": "免费",
"DARMOWE SKRZYNKI": "免费箱子",
"DODAJ": "添加",
"DOŁADUJ KONTO (+10%)": "充值 (+10%)",
"DOŁĄCZ": "加入",
"Demo": "试玩",
"Dodaj skrzynkę": "添加箱子",
"Długa Szyja": "长脖子",
"Długość szyfru:": "密码长度：",
"Dźwięk": "声音",
"Dźwięk i animacje": "声音和动画",
"Dźwięki ruletki": "轮盘音效",
"ENGWE EP-2.0 Boost": "ENGWE EP-2.0 Boost",
"Elektryk miejski": "城市电动车",
"Elita": "精英",
"Event": "活动",
"GRACZE": "玩家",
"GRASZ": "已加入",
"GWARANTOWANY": "保底",
"Gemy": "宝石",
"Gemy zdobywasz za granie: 4 gemy za każdy wydany dolar, 25× poziom za każdy awans, gemy za wpłaty rowerów, misje i kody. Im wyższy poziom skrzynki, tym więcej Covert i noży.": "玩游戏即可获得宝石：每花 1 美元得 4 颗宝石，每次升级得 25×等级，存入自行车、完成任务和使用代码也有宝石。箱子等级越高，隐秘和刀具越多。",
"Gotowe": "完成",
"Gotowy": "已准备",
"Gołąb z KFC": "肯德基鸽子",
"Gracze z otwartą stroną": "打开页面的玩家",
"Góral z marketu": "超市山地车",
"HARDCORE: 35 sekund, mgła, dwa pasy zawsze zablokowane, a tempo rośnie prawie dwukrotnie.": "硬核：35 秒、大雾、两条车道始终被堵，速度几乎翻倍。",
"HISTORIA PORTFELA": "钱包记录",
"HISTORIA PRZEDMIOTÓW": "物品记录",
"I DARMOWE SKRZYNKI ZA POZIOMY": "以及免费等级箱子",
"Im więcej, tym weselej!": "人越多越热闹！",
"Inny rower": "换一辆车",
"Jak działają poziomy?": "等级如何运作？",
"Język": "语言",
"KOD PROMOCYJNY": "优惠码",
"KONIEC": "已结束",
"KONTRAKTY": "合约",
"KOSZT SKRZYNEK": "箱子费用",
"Kanadyjski Syrop": "加拿大枫糖浆",
"Karbonowa kolarzówka": "碳纤维公路车",
"Klikaj „POMPUJ” (albo spację) tak szybko, jak umiesz, zanim skończy się czas.": "在时间结束前尽快点击“打气”（或空格键）。",
"Kliknij skrzynkę, żeby dodać rundę. Maksymalnie 20 rund.": "点击箱子添加一轮，最多 20 轮。",
"Kod promocyjny": "优惠码",
"Kody promocyjne": "优惠码",
"Kolekcjoner": "收藏家",
"Kolor avatara": "头像颜色",
"Konfetti": "彩纸",
"Kontrakt": "合约",
"Koszt próby": "每次费用",
"Kąt:": "角度：",
"Legenda": "传奇",
"Legendy": "传奇",
"Liczba graczy": "玩家人数",
"Ląduje w Plecaku": "落进背包",
"MEME": "梗图",
"MISJE EVENTU": "活动任务",
"MOJE BITWY": "我的对战",
"Menu": "菜单",
"Misje za gemy": "宝石任务",
"Mistrz": "大师",
"Mięsny Cyborg": "肉肉机器人",
"Miś Miodek": "蜂蜜熊",
"Możliwy wynik": "可能结果",
"Można dołączyć": "可加入",
"MÓJ EKWIPUNEK": "我的库存",
"Najdroższe": "最贵",
"Najlepsze dropy": "最佳掉落",
"Najnowsze": "最新",
"Najpierw znajdź tę skrzynkę na banerze na stronie głównej.": "请先在首页横幅上找到这个箱子。",
"Najstarsze": "最早",
"Najtańsze": "最便宜",
"Napompuj oponę": "给轮胎打气",
"Nazwa A–Z": "名称 A–Z",
"Nazwa przedmiotu": "物品名称",
"Nazwa skrzynki": "箱子名称",
"Nick": "昵称",
"Nie tym razem": "这次没成功",
"Nikt jeszcze nie stworzył bitwy.": "还没有人创建对战。",
"Nowicjusz": "新手",
"Nowość!": "新品！",
"Noże": "刀具",
"ODBIERZ": "领取",
"ODBIERZ CODZIENNĄ SKRZYNKĘ": "领取每日箱子",
"OTWÓRZ ZA DARMO": "免费开启",
"Odbierz": "领取",
"Oddajesz": "你付出",
"Odkrywca": "探险者",
"Oglądaj": "观看",
"Omijaj kamienie i dziury, zmieniając pas strzałkami albo przyciskami.": "用方向键或按钮换道，避开石头和坑洞。",
"Opłata jest pobierana od razu i wraca, jeśli anulujesz bitwę przed startem.": "费用立即扣除，若在开始前取消对战会退还。",
"Osiągnij poziom 5": "达到 5 级",
"Ostateczna": "终极",
"Otrzymujesz": "你获得",
"Otwieraj ją za darmo raz na 24 godziny.": "每 24 小时可免费开启一次。",
"Otwierajcie te same skrzynki, a najlepszy drop zgarnia wszystko. Graj z kolegami, którzy mają otwartą tę stronę — na żywo.": "开同样的箱子，最佳掉落赢走一切。与打开此页面的朋友实时对战。",
"Otwórz 10 skrzynek": "开启 10 个箱子",
"Otwórz ponownie": "再开一次",
"PODPISZ KONTRAKT": "签订合约",
"PODSTAWOWE INFORMACJE O TWOIM KONCIE": "你的账户基本信息",
"POMPUJ!": "打气！",
"POŁĄCZ OD 3 DO 10 SKINÓW W JEDEN NOWY": "将 3 到 10 个皮肤合成一个新皮肤",
"PREMIUM": "高级",
"PREZENTY": "礼物",
"PRZEPUSTKA URODZINOWA": "生日通行证",
"PRZEZNACZENIE": "命运",
"Patrz uważnie…": "仔细看…",
"Pies Sąsiada": "邻居的狗",
"Podpisz kontrakt": "签订一份合约",
"Podstawowy tryb. Wygrywa gracz z najwyższą łączną wartością dropów i zabiera wszystko. Pozostali dostają gwarantowany skin.": "标准模式。掉落总价值最高的玩家获胜并拿走全部，其他人获得保底皮肤。",
"Odwrócone zasady. Wygrywa gracz z najniższą łączną wartością dropów i zabiera wszystko.": "规则反转。掉落总价值最低的玩家获胜并拿走全部。",
"Liczy się tylko ostatnia runda. Wygrywa ten, kto wylosuje najdroższy skin w ostatniej skrzynce.": "只有最后一轮算数，最后一个箱子开出最贵皮肤的人获胜。",
"Podsumowanie": "总结",
"Poszukiwacz": "冒险家",
"Powiadomienia": "通知",
"Pretendent": "挑战者",
"Profil": "个人资料",
"Przywołaj bota": "召唤机器人",
"Przywołaj wszystkie boty": "召唤所有机器人",
"RANKING": "排行榜",
"RUNDY": "回合",
"Ranking graczy": "玩家排行榜",
"Ranking według łącznej kwoty wydanej na skrzynki i bitwy. Pozostali gracze to boty.": "按在箱子和对战上的总花费排名。其他玩家是机器人。",
"Reset konta": "重置账户",
"Resetuj konto": "重置账户",
"Reszta na saldo": "余额找零",
"Romet Jubilat": "Romet Jubilat",
"Rowerowe Urodziny": "自行车生日",
"Rzadkości": "稀有度",
"Rękawice": "手套",
"SKLEP GEMÓW": "宝石商店",
"SKRZYNKI EXP": "经验箱子",
"SKRZYNKI ZA GEMY": "宝石箱子",
"SKRZYNKĘ": "箱子",
"SPRZEDAJ WSZYSTKO": "全部出售",
"SPRÓBUJ": "试一试",
"SPRÓBUJ ZNALEŹĆ UKRYTĄ SKRZYNKĘ NA BANERZE!": "试着在横幅上找到隐藏的箱子！",
"START": "开始",
"STOP!": "停！",
"STWÓRZ": "创建",
"STWÓRZ BITWĘ": "创建对战",
"Saldo": "余额",
"Skinów w kontrakcie": "合约中的皮肤",
"Sklep": "商店",
"Skrzynki": "箱子",
"Skrzynki EXP": "经验箱子",
"Skrzynki memów": "梗图箱子",
"Skrzynki twórców": "创作者箱子",
"Skrzynki urodzinowe": "生日箱子",
"Skrzynki za gemy": "宝石箱子",
"Składak Wigry 3": "Wigry 3 折叠车",
"Smocza Legenda": "龙之传说",
"Sortowanie": "排序",
"Sortuj": "排序",
"Sprzedaj": "出售",
"Sprzedaj wszystko": "全部出售",
"Spróbuj ponownie": "再试一次",
"Start za chwilę…": "即将开始…",
"Stwórz własną bitwę. Żeby grać z kolegami, otwórzcie stronę przez link claude.ai (zaproszenie mailem).": "创建你自己的对战。要和朋友一起玩，请通过 claude.ai 链接（邮件邀请）打开页面。",
"Stwórz własną — koledzy na serwerze zobaczą ją od razu i będą mogli dołączyć.": "创建你自己的对战——服务器上的朋友会立刻看到并可以加入。",
"Supremacja": "至尊",
"Symulator · wirtualne monety": "模拟器 · 虚拟货币",
"Szosówka Kross": "Kross 公路车",
"Szukaj skina": "搜索皮肤",
"Szybkie otwieranie": "快速开箱",
"Szyfr kłódki": "密码锁",
"TWOJE GEMY": "你的宝石",
"TWOJE PRZEDMIOTY": "你的物品",
"TWÓJ PROFIL": "你的资料",
"TY": "你",
"TYLKO PRAWDZIWI GRACZE — BOTY TYLKO NA TWOJE ŻYCZENIE": "只有真人玩家——机器人仅在你召唤时出现",
"To jest symulator": "这是模拟器",
"To symulator: rowery i dolary są wirtualne, nic nie jest pobierane.": "这是模拟器：自行车和美元都是虚拟的，不会扣任何费用。",
"Tort Urodzinowy": "生日蛋糕",
"Trafienia:": "命中：",
"Trafienie w punkt": "精准命中",
"Tropiciel": "追踪者",
"Tryb bitwy": "对战模式",
"Tryb lokalny": "本地模式",
"Trzymaj Varga na tylnym kole: GAZ (↑ / W / spacja) podnosi przód, HAMULEC (↓ / S) go opuszcza. Nie dotknij przodem ziemi i nie przewróć się do tyłu. Wiatr i nierówności będą Ci przeszkadzać coraz mocniej.": "让 Varg 保持后轮行驶：油门（↑ / W / 空格）抬起前轮，刹车（↓ / S）放下前轮。前轮不能着地，也不能向后翻车。风和颠簸会越来越强。",
"Twoja szansa:": "你的概率：",
"Twoje przedmioty": "你的物品",
"Twój drop!": "你的掉落！",
"Twoje dropy!": "你的掉落！",
"Twój poziom": "你的等级",
"Tylko ulubione": "仅收藏",
"UKRYJ": "隐藏",
"POKAŻ": "显示",
"USTAWIENIA": "设置",
"Ukraina z piwnicy": "地下室的老车",
"Ukryta Skrzynka": "隐藏箱子",
"Ukryta skrzynka": "隐藏箱子",
"Ulubione": "收藏",
"Ustawienia": "设置",
"Usuwa saldo, gemy, poziom i wszystkie skiny.": "将清除余额、宝石、等级和所有皮肤。",
"W strefie:": "区内时间：",
"WARTOŚĆ BITWY": "对战价值",
"WARTOŚĆ:": "价值：",
"WPISZ KOD": "输入代码",
"WPŁAĆ": "存入",
"WSZYSTKIE": "全部",
"WYBIERZ SKRZYNKI I ZASADY": "选择箱子和规则",
"WYBIERZ WYMARZONY SKIN I SWOJĄ SZANSĘ": "选择梦想皮肤和概率",
"WYKONUJ ZADANIA I ZBIERAJ GEMY": "完成任务收集宝石",
"WYMIENNIK": "交换器",
"WYMIEŃ": "交换",
"Waluta": "货币",
"Wartość wkładu": "投入价值",
"Wciskaj strzałki w podanej kolejności. Pomyłka zabiera czas.": "按给定顺序按方向键，按错会扣时间。",
"Wheelie OMEGA": "OMEGA 翘头",
"Wielki Prezent": "大礼物",
"Wirtualne monety i skiny. Brak prawdziwych pieniędzy, wypłat i przedmiotów Steam. Stan gry zapisuje się tylko w Twojej przeglądarce.": "虚拟货币和皮肤。没有真钱、提现或 Steam 物品。游戏进度只保存在你的浏览器中。",
"Wolne miejsce": "空位",
"Wpisz kod i odbierz bonus. Każdy kod działa raz.": "输入代码领取奖励，每个代码只能用一次。",
"Wpisz kod, np.": "输入代码，例如",
"Wpłać rower": "存入自行车",
"Wróć": "返回",
"Wróć do bitew": "返回对战",
"Wszystkie dropy": "所有掉落",
"Wszystkie monety, gemy i skiny są wirtualne. Nie da się ich kupić ani wypłacić.": "所有货币、宝石和皮肤都是虚拟的，无法购买或提现。",
"Wybierz skin": "选择皮肤",
"Wybierz skin z listy poniżej.": "从下方列表中选择皮肤。",
"Wygraj bitwę skrzynek": "赢得一场箱子对战",
"Wygrałeś bitwę!": "你赢得了对战！",
"Wygrałeś!": "你赢了！",
"Wyjec": "咆哮者",
"Wymiennik": "交换器",
"Wystarczające saldo": "余额充足",
"ZAMIEŃ SWOJE SKINY NA INNE — RESZTA WRACA NA SALDO": "用你的皮肤换其他皮肤——差额返还余额",
"ZOBACZ": "查看",
"Zamknij": "关闭",
"Zapamiętaj kolejność zapalających się pól i powtórz ją bez błędu.": "记住方块亮起的顺序，并无误地重复。",
"Zapisz": "保存",
"Zatrzymaj": "保留",
"Zatrzymaj wskaźnik w zielonej strefie. Każde trafienie przesuwa strefę.": "让指针停在绿色区域，每次命中区域都会移动。",
"Zawartość skrzynki": "箱子内容",
"Zdecyduj, jak potoczy się bitwa!": "决定对战如何进行！",
"Zdobywasz 100 EXP za każdy wydany $1. Skrzynki poziomowe otwierasz raz na 24 h.": "每花 1 美元获得 100 经验。等级箱子每 24 小时可开一次。",
"Zjazd z góry": "下坡骑行",
"Zmiana biegów": "换挡",
"Zmień nick i kolor": "更改昵称和颜色",
"Znajdź ukrytą skrzynkę na banerze": "找到横幅上的隐藏箱子",
"Zombi": "僵尸",
"Złodziej Rowerów": "偷车贼",
"dni": "天",
"godz": "时",
"min": "分",
"sek": "秒",
"szansa": "概率",
"i gemy.": "和宝石。",
"Łowca": "猎人",
"Łączna wartość:": "总价值：",
"Średnio kontrakt zwraca ok. 95% wartości wkładu. Wkład przepada.": "合约平均返还约 95% 的投入价值，投入物品会消失。",
"Świeczka": "蜡烛",
"Żeby wpłacić rower, musisz wygrać minigrę. Im droższy rower, tym trudniejsza gra. Nagroda: wartość roweru": "要存入自行车，你必须赢得小游戏。车越贵，游戏越难。奖励：自行车价值",
"Życia:": "生命：",
"▲ GAZ": "▲ 油门",
"▼ HAMULEC": "▼ 刹车",
"★★★★★ HARDCORE": "★★★★★ 硬核",
"Udało się!": "成功了！",
"Super": "太棒了",
"Wpłać kolejny": "再存一辆",
"Na konto wpada": "已存入你的账户：",
"Czeka na graczy": "等待玩家",
"Bitwa czeka na graczy.": "对战正在等待玩家。",
"Wyjdź": "离开",
"Serwer online": "服务器在线",
"Łączenie…": "连接中…",
"Tej bitwy już nie ma.": "此对战已不存在。",
"Nie masz jeszcze żadnych bitew.": "你还没有任何对战。",
"Przegrana": "失败",
"Czekam, aż host Cię przyjmie…": "等待房主接受你…",
"HOST": "房主",
"GRACZ": "玩家",
"BOT": "机器人",
"PEŁNA": "已满",
"OGLĄDAJ": "观看",
"W TOKU": "进行中",
"Ekwipunek jest pusty.": "库存为空。",
"Do skrzynek": "去开箱",
"Nic nie pasuje do wyszukiwania.": "没有符合搜索的结果。",
"Otwórz ją za darmo.": "免费开启。",
"Nie masz skinów. Otwórz kilka skrzynek.": "你没有皮肤。去开几个箱子吧。",
"Brak przedmiotów.": "没有物品。",
"Żadna skrzynka nie pasuje do filtrów.": "没有符合筛选条件的箱子。",
"Gołąb zjadł wszystkie Twoje skiny.": "鸽子吃掉了你所有的皮肤。",
"Otwórz skrzynkę, żeby coś mu uciekło.": "开个箱子，让它漏掉点什么。",
"Wydaj łącznie $50 na skrzynki i bitwy": "在箱子和对战上共花费 50 美元",
"Bitwa anulowana, opłata wróciła.": "对战已取消，费用已退还。",
"Konto zresetowane.": "账户已重置。",
"Maksymalnie 10 skinów w kontrakcie.": "合约最多 10 个皮肤。",
"Maksymalnie 20 rund.": "最多 20 轮。",
"Masz już otwartą bitwę. Zakończ ją albo anuluj.": "你已有一个对战，请先完成或取消。",
"Nick nie może być pusty.": "昵称不能为空。",
"Nie możesz dołączyć do tej bitwy.": "你无法加入此对战。",
"Nieprawidłowy kod.": "无效代码。",
"Przegrałeś tę bitwę.": "你输掉了这场对战。",
"Siedzisz już w innej bitwie.": "你已在另一场对战中。",
"Ten kod został już użyty.": "此代码已被使用。",
"Tym razem się nie udało.": "这次没成功。",
"Wyszedłeś z bitwy, opłata wróciła.": "你已离开对战，费用已退还。",
"Za mało środków na tę bitwę.": "余额不足，无法参加此对战。",
"Za mało środków. Wpłać rower!": "余额不足，存辆自行车吧！",
"Za mało środków.": "余额不足。",
"Zapisano nick.": "昵称已保存。",
"Znalazłeś ukrytą skrzynkę! Otwórz ją za darmo.": "你找到了隐藏箱子！免费开启吧。",
"Znalazłeś ukrytą skrzynkę!": "你找到了隐藏箱子！",
"Zwrócono opłatę za niedokończoną bitwę.": "已退还未完成对战的费用。",
"Wywrotka! Przeszkoda na trasie.": "翻车了！赛道上有障碍。",
"Przednie koło uderzyło w ziemię. Wywrotka!": "前轮着地，翻车了！",
"Za mocno! Varg przewrócił się do tyłu.": "用力过猛！Varg 向后翻车了。",
"Dźwięk włączony": "声音已开启",
"Dźwięk wyłączony": "声音已关闭",
"Ranking": "排行榜",
"Kolarz": "骑手",
"Wolne": "空",
"ROWEROWE": "自行车",
"URODZINY": "生日",
"Twoja kolej! Powtórz szyfr.": "轮到你了！重复密码。"
});
Object.assign(TR.wit, {
"np. ROWER4SKINS": "np. ROWER4SKINS",
"Wygrałeś bitwę!": "Witowe zwycięstwo, witku!",
"Twój drop!": "Witowy drop!",
"Twoje dropy!": "Witowe dropy!",
"Wygrałeś!": "Witnąłeś!",
"Nie tym razem": "Nie wit tym witrazem",
"Udało się!": "Witdało się!",
"WPŁAĆ": "WITPŁAĆ",
"Kolarz": "Witkolarz"
});

Object.assign(TR.en, {"OMEGA++++: 35 sekund, strefa 21–39°, silnik reaguje z opóźnieniem, a trzeba spędzić w strefie co najmniej 66% czasu. Powodzenia.": "OMEGA++++: 35 seconds, a 21–39° zone, a laggy engine, and you must stay in the zone at least 66% of the time. Good luck.", "Za każdy wydany $1 dostajesz 100 EXP. Awans daje gemy.": "You get 100 EXP for every $1 spent. Levelling up gives gems.", "np. ROWER4SKINS": "e.g. ROWER4SKINS", "Wszystkie skrzynki": "All cases"});
Object.assign(TR.zh, {"OMEGA++++: 35 sekund, strefa 21–39°, silnik reaguje z opóźnieniem, a trzeba spędzić w strefie co najmniej 66% czasu. Powodzenia.": "OMEGA++++：35 秒，21–39° 的区间，引擎有延迟，而且至少 66% 的时间要在区内。祝你好运。", "Za każdy wydany $1 dostajesz 100 EXP. Awans daje gemy.": "每花 1 美元获得 100 经验，升级可获得宝石。", "np. ROWER4SKINS": "例如 ROWER4SKINS", "Wszystkie skrzynki": "所有箱子"});
Object.assign(TR.en, {"HARDCORE: aż 50 sekund zjazdu, gęsta mgła, dwa pasy zawsze zablokowane, a pełne tempo (prawie 2×) przychodzi już po pół minuty.": "HARDCORE: a full 50-second descent, thick fog, two lanes always blocked, and top speed (almost 2×) arrives after just half a minute.", "HARDCORE: 45 sekund, bramki coraz węższe i coraz dalej od siebie, lód od 12. sekundy. Wolno ominąć tylko jedną bramkę.": "HARDCORE: 45 seconds, gates get narrower and further apart, ice from second 12. You may miss only one gate.", "HARDCORE: 560 m pod górę w 57 sekund. Bez oszczędzania baterii na końcową ścianę nie ma szans.": "HARDCORE: 560 m uphill in 57 seconds. Without saving battery for the final wall you have no chance.", "Przejedź G2 przez bramki z pachołków. Trzymaj ◀ / ▶ (albo A / D, strzałki) — hulajnoga ma bezwładność, więc skręcaj wcześniej. Niebieskie plamy to lód: tam prawie nie da się hamować.": "Ride the G2 through the cone gates. Hold ◀ / ▶ (or A / D, arrows) — the scooter has inertia, so steer early. Blue patches are ice: you can barely brake there.", "Pedałuj na zmianę LEWA / PRAWA (← / → albo A / D) w równym rytmie — kadencja musi być w zielonej strefie. Ta sama noga dwa razy = poślizg łańcucha. TURBO (↑ / W / spacja) mocno pomaga, ale bateria szybko się kończy, a na końcu czeka ściana 36%.": "Pedal LEFT / RIGHT alternately (← / → or A / D) in a steady rhythm — cadence must stay in the green zone. Same leg twice = chain slip. TURBO (↑ / W / space) helps a lot, but the battery drains fast, and a 36% wall waits at the end.", "Slalom G2": "G2 Slalom", "Podjazd e-MTB": "e-MTB Climb", "Bramki:": "Gates:", "Pudła:": "Misses:", "Dystans:": "Distance:", "Nachylenie:": "Slope:", "Bateria:": "Battery:", "◀ LEWO": "◀ LEFT", "PRAWO ▶": "RIGHT ▶", "◀ LEWA": "◀ LEFT", "PRAWA ▶": "RIGHT ▶", "LÓD!": "ICE!", "KADENCJA": "CADENCE", "POŚLIZG ŁAŃCUCHA!": "CHAIN SLIP!", "STAJESZ!": "STALLING!", "PODMUCH ↑": "GUST ↑", "PODMUCH ↓": "GUST ↓", "BŁOTO — silnik muli!": "MUD — the engine is bogging!", "Każda runda to wyścig o punkt: dostaje go gracz z najdroższym dropem w tej rundzie. Najwięcej punktów zabiera wszystko (remis rozstrzyga suma). Przegrani dostają gwarantowany skin.": "Every round is a race for a point: the player with the most expensive drop that round gets it. Most points takes everything (ties go to the higher total). Losers get a guaranteed skin.", "Odwrócony Point Rush: punkt za rundę dostaje gracz z NAJTAŃSZYM dropem. Najwięcej punktów wygrywa (remis: niższa suma).": "Reverse Point Rush: the player with the CHEAPEST drop wins the round's point. Most points wins (ties: lower total).", "Liczy się tylko ostatnia runda, ale na odwrót — wygrywa NAJTAŃSZY skin w ostatniej skrzynce.": "Only the last round counts, but reversed — the CHEAPEST skin in the last case wins.", "Wszystkie rundy oprócz ostatniej się dodają, a ostatnia się ODEJMUJE. Wynik = suma wcześniejszych dropów − ostatni drop. Najwyższy wynik wygrywa.": "All rounds except the last add up, and the last one is SUBTRACTED. Score = earlier drops − last drop. Highest score wins.", "TYLKO PRAWDZIWI GRACZE — BOTY NIGDY NIE DOŁĄCZAJĄ SAME, PRZYWOŁUJE JE TYLKO HOST": "REAL PLAYERS ONLY — BOTS NEVER JOIN ON THEIR OWN, ONLY THE HOST CAN SUMMON THEM", "BEZ SZYBKIEGO OTWIERANIA": "NO FAST OPENING", "W bitwach szybkie otwieranie jest wyłączone": "Fast opening is disabled in battles", "Rare item Special": "Rare item Special", "Rare item": "Rare item", "RARE ITEM": "RARE ITEM", "Złap gwiazdkę Rower4Skins Special": "Catch a Rower4Skins Special star", "Wygraj bitwę w trybie Crazy": "Win a battle in a Crazy mode", "★ Gwiazdka Rower4Skins Special!": "★ Rower4Skins Special star!", "★ Rower4Skins Special!": "★ Rower4Skins Special!", "Point Rush": "Point Rush", "Crazy Rush": "Crazy Rush", "Crazy Terminal": "Crazy Terminal", "Counter Terminal": "Counter Terminal", "POINT RUSH": "POINT RUSH", "CRAZY RUSH": "CRAZY RUSH", "CRAZY TERMINAL": "CRAZY TERMINAL", "COUNTER TERMINAL": "COUNTER TERMINAL", "Rower4Skins Special": "Rower4Skins Special"});
Object.assign(TR.zh, {"HARDCORE: aż 50 sekund zjazdu, gęsta mgła, dwa pasy zawsze zablokowane, a pełne tempo (prawie 2×) przychodzi już po pół minuty.": "硬核：整整 50 秒下坡、浓雾、两条车道始终被堵，半分钟后就达到最高速度（接近 2 倍）。", "HARDCORE: 45 sekund, bramki coraz węższe i coraz dalej od siebie, lód od 12. sekundy. Wolno ominąć tylko jedną bramkę.": "硬核：45 秒，门越来越窄、间距越来越大，第 12 秒起出现冰面。只允许错过一个门。", "HARDCORE: 560 m pod górę w 57 sekund. Bez oszczędzania baterii na końcową ścianę nie ma szans.": "硬核：57 秒内爬坡 560 米。不给最后的陡坡留电量就没有机会。", "Przejedź G2 przez bramki z pachołków. Trzymaj ◀ / ▶ (albo A / D, strzałki) — hulajnoga ma bezwładność, więc skręcaj wcześniej. Niebieskie plamy to lód: tam prawie nie da się hamować.": "驾驶 G2 穿过锥桶门。按住 ◀ / ▶（或 A / D、方向键）——滑板车有惯性，要提前转向。蓝色区域是冰面：几乎刹不住。", "Pedałuj na zmianę LEWA / PRAWA (← / → albo A / D) w równym rytmie — kadencja musi być w zielonej strefie. Ta sama noga dwa razy = poślizg łańcucha. TURBO (↑ / W / spacja) mocno pomaga, ale bateria szybko się kończy, a na końcu czeka ściana 36%.": "按节奏交替踩 左 / 右（← / → 或 A / D）——踏频必须保持在绿色区间。同一只脚连踩两次 = 掉链。TURBO（↑ / W / 空格）帮助很大，但电量消耗很快，终点前还有 36% 的陡坡。", "Slalom G2": "G2 绕桩", "Podjazd e-MTB": "电动山地车爬坡", "Bramki:": "通过的门：", "Pudła:": "失误：", "Dystans:": "距离：", "Nachylenie:": "坡度：", "Bateria:": "电量：", "◀ LEWO": "◀ 左", "PRAWO ▶": "右 ▶", "◀ LEWA": "◀ 左脚", "PRAWA ▶": "右脚 ▶", "LÓD!": "冰面！", "KADENCJA": "踏频", "POŚLIZG ŁAŃCUCHA!": "掉链了！", "STAJESZ!": "要停了！", "PODMUCH ↑": "阵风 ↑", "PODMUCH ↓": "阵风 ↓", "BŁOTO — silnik muli!": "泥地——引擎发软！", "Każda runda to wyścig o punkt: dostaje go gracz z najdroższym dropem w tej rundzie. Najwięcej punktów zabiera wszystko (remis rozstrzyga suma). Przegrani dostają gwarantowany skin.": "每一轮争夺一分：本轮掉落最贵的玩家得分。得分最多者赢走全部（平局比总价值）。输家获得保底皮肤。", "Odwrócony Point Rush: punkt za rundę dostaje gracz z NAJTAŃSZYM dropem. Najwięcej punktów wygrywa (remis: niższa suma).": "反向积分赛：每轮掉落最便宜的玩家得分。得分最多者获胜（平局：总价值更低者）。", "Liczy się tylko ostatnia runda, ale na odwrót — wygrywa NAJTAŃSZY skin w ostatniej skrzynce.": "只看最后一轮，但规则相反——最后一个箱子里最便宜的皮肤获胜。", "Wszystkie rundy oprócz ostatniej się dodają, a ostatnia się ODEJMUJE. Wynik = suma wcześniejszych dropów − ostatni drop. Najwyższy wynik wygrywa.": "除最后一轮外所有回合累加，最后一轮则被减去。得分 = 之前的掉落总和 − 最后一次掉落。得分最高者获胜。", "TYLKO PRAWDZIWI GRACZE — BOTY NIGDY NIE DOŁĄCZAJĄ SAME, PRZYWOŁUJE JE TYLKO HOST": "只有真人玩家——机器人从不自动加入，只有房主可以召唤", "BEZ SZYBKIEGO OTWIERANIA": "禁止快速开箱", "W bitwach szybkie otwieranie jest wyłączone": "对战中禁用快速开箱", "Rare item Special": "稀有物品 Special", "Rare item": "稀有物品", "RARE ITEM": "稀有物品", "Złap gwiazdkę Rower4Skins Special": "抽中一颗 Rower4Skins Special 星星", "Wygraj bitwę w trybie Crazy": "在疯狂模式中赢得一场对战", "★ Gwiazdka Rower4Skins Special!": "★ Rower4Skins Special 星星！", "★ Rower4Skins Special!": "★ Rower4Skins Special！", "Point Rush": "积分赛", "Crazy Rush": "疯狂积分赛", "Crazy Terminal": "疯狂终局", "Counter Terminal": "反向终局", "POINT RUSH": "积分赛", "CRAZY RUSH": "疯狂积分赛", "CRAZY TERMINAL": "疯狂终局", "COUNTER TERMINAL": "反向终局", "Rower4Skins Special": "Rower4Skins Special"});
Object.assign(TR.wit, {"Rare item Special": "Rare item Special", "Rower4Skins Special": "Rower4Skins Special", "RARE ITEM": "RARE ITEM"});
Object.assign(TR.en, {"Omega MX Supercross": "Omega MX Supercross", "Tor motocrossowy z dołami. GAZ (↑ / W) — 100 KM od razu podrywa przód, więc przy gazowaniu pochylaj się do przodu. ◀ TYŁ / PRZÓD ▶ (A / D) to balans ciałem: w locie obraca motocykl. HAMULEC (↓ / S) zwalnia. Za wolno = wpadasz do dołu, za szybko = twarde lądowanie za rampą. Ląduj równolegle do zielonej rampy.": "A motocross track with pits. THROTTLE (↑ / W) — 100 HP lifts the front instantly, so lean forward while on the gas. ◀ BACK / FWD ▶ (A / D) is body balance: in the air it rotates the bike. BRAKE (↓ / S) slows you down. Too slow = you fall into the pit, too fast = hard landing past the ramp. Land parallel to the green ramp.", "OMEGA MAX ☠: 7 skoków, whoopsy, podmuchy wiatru w locie i 55 sekund. Kąt lądowania musi się zgadzać z rampą co do 14°. Jeden błąd = koniec. Najtrudniejsza minigra na stronie.": "OMEGA MAX ☠: 7 jumps, whoops, wind gusts in the air and 55 seconds. The landing angle must match the ramp within 14°. One mistake = game over. The hardest minigame on the site.", "Prędkość:": "Speed:", "Skoki:": "Jumps:", "Czas:": "Time:", "◀ TYŁ": "◀ BACK", "PRZÓD ▶": "FWD ▶", "▼ HAM": "▼ BRAKE", "▲ GAZ": "▲ GAS", "PRZÓD W GÓRZE!": "FRONT UP!", "WIATR!": "WIND!", "Za wolno! Wpadłeś do dołu.": "Too slow! You fell into the pit.", "Uderzyłeś w krawędź rampy!": "You hit the edge of the ramp!", "Za twarde lądowanie — przeleciałeś rampę!": "Landing too hard — you overshot the ramp!", "Za dużo gazu! 100 KM przewróciło Cię do tyłu.": "Too much throttle! 100 HP flipped you backwards.", "Brak połączenia z serwerem bitew": "No connection to the battle server", "Bitwy na żywo działają tylko dla osób zalogowanych na claude.ai i zaproszonych mailem (przycisk „Udostępnij” → wpisz mail kolegi). Otwarcie strony z publicznego linku nie łączy z serwerem. Teraz możesz grać z botami.": "Live battles only work for people signed in to claude.ai and invited by email (the “Share” button → enter your friend's email). Opening the page from a public link does not connect to the server. For now you can play with bots.", "Jesteś sam. Koledzy zobaczą Twoje bitwy, gdy otworzą tę stronę ze swojego konta claude.ai (zaproszenie mailem przez „Udostępnij”).": "You're alone. Friends will see your battles when they open this page from their own claude.ai account (email invite via “Share”).", "SZOK!": "SHOCK!", "PRZEGRANA!": "YOU LOST!", "PRZEPADŁO!": "GONE!", "UPGRADER": "UPGRADER", "POSTAW SKINY I ZAMIEŃ JE NA DROŻSZY": "STAKE YOUR SKINS AND TURN THEM INTO A PRICIER ONE", "Dołóż saldo": "Add balance", "Stawka": "Stake", "UPGRADE": "UPGRADE", "Szansa = stawka ÷ cena celu × 90% (maks. 80%).": "Chance = stake ÷ target price × 90% (max 80%).", "Wybierz cel poniżej": "Pick a target below", "Wybierz skiny z ekwipunku": "Pick skins from your inventory", "TWÓJ EKWIPUNEK": "YOUR INVENTORY", "WYBIERZ CEL": "PICK A TARGET", "Nie masz skinów. Możesz postawić samo saldo.": "You have no skins. You can stake just your balance.", "Maksymalnie 8 skinów naraz.": "Up to 8 skins at once.", "Najpierw wybierz skiny albo wpisz saldo.": "Pick skins or enter a balance first.", "Upgrader (stawka)": "Upgrader (stake)", "Upgrader": "Upgrader", "NOWOŚĆ · ALTIS OMEGA MX · 100 KM": "NEW · ALTIS OMEGA MX · 100 HP", "Otwieraj skrzynki, łap złote gwiazdki Rower4Skins Special, walcz z kolegami w 7 trybach bitew i zrób upgrade do skinów za $25 000.": "Open cases, catch golden Rower4Skins Special stars, battle your friends in 7 modes and upgrade to skins worth $25,000.", "OTWÓRZ SPECIAL": "OPEN SPECIAL", "WPŁAĆ ALTISA": "DEPOSIT THE ALTIS", "Skarbiec Kolarza": "Cyclist's Vault", "Diamentowa Dętka": "Diamond Inner Tube", "Omega Vault": "Omega Vault", "Pies w Szoku": "Shocked Dog", "Skarbiec": "Vault", "SKARBIEC": "VAULT", "Haha, Ezz!": "Haha, ezz!", "GG, za łatwo!": "GG, too easy!", "Kto następny?": "Who's next?", "Skrzynki mnie lubią!": "The cases love me!", "Altis Omega MX": "Altis Omega MX"});
Object.assign(TR.zh, {"Omega MX Supercross": "Omega MX 超级越野", "Tor motocrossowy z dołami. GAZ (↑ / W) — 100 KM od razu podrywa przód, więc przy gazowaniu pochylaj się do przodu. ◀ TYŁ / PRZÓD ▶ (A / D) to balans ciałem: w locie obraca motocykl. HAMULEC (↓ / S) zwalnia. Za wolno = wpadasz do dołu, za szybko = twarde lądowanie za rampą. Ląduj równolegle do zielonej rampy.": "带坑的越野赛道。油门（↑ / W）——100 马力会立刻抬起前轮，所以加油时要向前压身体。◀ / ▶（A / D）是身体平衡：在空中会旋转摩托车。刹车（↓ / S）减速。太慢 = 掉进坑里，太快 = 飞过落地坡重重着地。要平行于绿色坡面落地。", "OMEGA MAX ☠: 7 skoków, whoopsy, podmuchy wiatru w locie i 55 sekund. Kąt lądowania musi się zgadzać z rampą co do 14°. Jeden błąd = koniec. Najtrudniejsza minigra na stronie.": "OMEGA MAX ☠：7 次飞跃、连续小坡、空中阵风，55 秒。落地角度必须与坡面相差不超过 14°。一次失误 = 结束。全站最难的小游戏。", "Prędkość:": "速度：", "Skoki:": "飞跃：", "Czas:": "时间：", "◀ TYŁ": "◀ 后仰", "PRZÓD ▶": "前压 ▶", "▼ HAM": "▼ 刹车", "▲ GAZ": "▲ 油门", "PRZÓD W GÓRZE!": "前轮抬起！", "WIATR!": "有风！", "Za wolno! Wpadłeś do dołu.": "太慢了！你掉进了坑里。", "Uderzyłeś w krawędź rampy!": "你撞上了坡道边缘！", "Za twarde lądowanie — przeleciałeś rampę!": "落地太重——你飞过了坡道！", "Za dużo gazu! 100 KM przewróciło Cię do tyłu.": "油门太大！100 马力把你掀翻了。", "Brak połączenia z serwerem bitew": "无法连接对战服务器", "Bitwy na żywo działają tylko dla osób zalogowanych na claude.ai i zaproszonych mailem (przycisk „Udostępnij” → wpisz mail kolegi). Otwarcie strony z publicznego linku nie łączy z serwerem. Teraz możesz grać z botami.": "实时对战只适用于已登录 claude.ai 且通过邮件受邀的人（“分享”按钮 → 输入朋友的邮箱）。通过公开链接打开页面无法连接服务器。现在你可以和机器人玩。", "Jesteś sam. Koledzy zobaczą Twoje bitwy, gdy otworzą tę stronę ze swojego konta claude.ai (zaproszenie mailem przez „Udostępnij”).": "只有你一个人。朋友用自己的 claude.ai 账号打开此页面后就能看到你的对战（通过“分享”邮件邀请）。", "SZOK!": "震惊！", "PRZEGRANA!": "输了！", "PRZEPADŁO!": "没了！", "UPGRADER": "升级器", "POSTAW SKINY I ZAMIEŃ JE NA DROŻSZY": "押上你的皮肤，换一个更贵的", "Dołóż saldo": "追加余额", "Stawka": "赌注", "UPGRADE": "升级", "Szansa = stawka ÷ cena celu × 90% (maks. 80%).": "概率 = 赌注 ÷ 目标价格 × 90%（最高 80%）。", "Wybierz cel poniżej": "在下方选择目标", "Wybierz skiny z ekwipunku": "从库存中选择皮肤", "TWÓJ EKWIPUNEK": "你的库存", "WYBIERZ CEL": "选择目标", "Nie masz skinów. Możesz postawić samo saldo.": "你没有皮肤。可以只押余额。", "Maksymalnie 8 skinów naraz.": "一次最多 8 个皮肤。", "Najpierw wybierz skiny albo wpisz saldo.": "请先选择皮肤或输入余额。", "Upgrader (stawka)": "升级器（赌注）", "Upgrader": "升级器", "NOWOŚĆ · ALTIS OMEGA MX · 100 KM": "新品 · ALTIS OMEGA MX · 100 马力", "Otwieraj skrzynki, łap złote gwiazdki Rower4Skins Special, walcz z kolegami w 7 trybach bitew i zrób upgrade do skinów za $25 000.": "开箱、抽取金色 Rower4Skins Special 星星、与朋友在 7 种模式中对战，并升级到价值 25,000 美元的皮肤。", "OTWÓRZ SPECIAL": "开启 SPECIAL", "WPŁAĆ ALTISA": "存入 ALTIS", "Skarbiec Kolarza": "车手金库", "Diamentowa Dętka": "钻石内胎", "Omega Vault": "Omega 金库", "Pies w Szoku": "震惊的狗", "Skarbiec": "金库", "SKARBIEC": "金库", "Haha, Ezz!": "哈哈，太简单！", "GG, za łatwo!": "GG，太简单了！", "Kto następny?": "下一个是谁？", "Skrzynki mnie lubią!": "箱子爱我！", "Altis Omega MX": "Altis Omega MX"});
Object.assign(TR.en, {"Rytm Wspomagacza": "Booster Rhythm", "Nuty zjeżdżają trzema torami. Naciśnij ◀ / ▲ / ▶ (A / W / D albo strzałki), gdy nuta dotknie świecącej linii. Trzeba trafić odpowiedni procent nut — im droższy rower, tym szybsze tempo i więcej nut.": "Notes slide down three lanes. Press ◀ / ▲ / ▶ (A / W / D or arrows) when a note touches the glowing line. You must hit enough notes — the pricier the bike, the faster the tempo and the more notes.", "Trafione:": "Hit:", "Combo:": "Combo:", "Tempo:": "Tempo:", "losowanie": "rolling", "WYGRANA": "WIN", "Kieszonkowa": "Pocket", "Drobna": "Small Change", "Mityczna": "Mythic", "Boska": "Divine", "Kosmiczna": "Cosmic", "Omega": "Omega", "Rower4Skins": "Rower4Skins", "Neonowa": "Neon", "Lawa": "Lava", "Toksyczna": "Toxic", "Cukierkowa": "Candy", "Złoty Strzał": "Golden Shot", "Lodowa": "Ice", "Nocna": "Night", "Moro": "Camo", "Grosik": "Penny", "Dycha": "Tenner", "Pedał Gazu": "Gas Pedal", "Kolorowe": "Colorful", "Tanie skrzynki": "Cheap cases", "KOLOROWE": "COLORFUL", "TANIE SKRZYNKI": "CHEAP CASES", "TANIO": "CHEAP", "Wspomagaczerex": "Wspomagaczerex"});
Object.assign(TR.zh, {"Rytm Wspomagacza": "助力节奏", "Nuty zjeżdżają trzema torami. Naciśnij ◀ / ▲ / ▶ (A / W / D albo strzałki), gdy nuta dotknie świecącej linii. Trzeba trafić odpowiedni procent nut — im droższy rower, tym szybsze tempo i więcej nut.": "音符沿三条轨道滑下。当音符碰到发光线时按 ◀ / ▲ / ▶（A / W / D 或方向键）。必须击中足够比例的音符——自行车越贵，节奏越快、音符越多。", "Trafione:": "命中：", "Combo:": "连击：", "Tempo:": "节奏：", "losowanie": "抽取中", "WYGRANA": "赢了", "Kieszonkowa": "口袋", "Drobna": "零钱", "Mityczna": "神话", "Boska": "神圣", "Kosmiczna": "宇宙", "Omega": "Omega", "Rower4Skins": "Rower4Skins", "Neonowa": "霓虹", "Lawa": "熔岩", "Toksyczna": "剧毒", "Cukierkowa": "糖果", "Złoty Strzał": "黄金一击", "Lodowa": "寒冰", "Nocna": "暗夜", "Moro": "迷彩", "Grosik": "一分钱", "Dycha": "十块", "Pedał Gazu": "油门踏板", "Kolorowe": "多彩", "Tanie skrzynki": "便宜箱子", "KOLOROWE": "多彩", "TANIE SKRZYNKI": "便宜箱子", "TANIO": "便宜", "Wspomagaczerex": "Wspomagaczerex"});

// Teksty z liczbami i kwotami.
const P = (re, en, zh) => TRP.push([re, { en, zh }]);
const sub = s => trString(s);
P(/^OTWÓRZ (\d+)X — (.+)$/, (n, m) => `OPEN ${n}X — ${m}`, (n, m) => `开启 ${n} 次 — ${m}`);
P(/^OTWÓRZ ZA (\d+) GEMÓW$/, n => `OPEN FOR ${n} GEMS`, n => `花 ${n} 宝石开启`);
P(/^(\d+) GEMÓW$/, n => `${n} GEMS`, n => `${n} 宝石`);
P(/^(\d+) GRACZY$/, n => `${n} PLAYERS`, n => `${n} 名玩家`);
P(/^(\d+) (?:graczy|gracz)( na stronie)?$/, (n, x) => `${n} player${n === '1' ? '' : 's'}${x ? ' online' : ''}`, (n, x) => `${x ? '在线 ' : ''}${n} 名玩家`);
P(/^(\d+) przedmiotów · (.+)$/, (n, r) => `${n} items · ${r === 'darmowa' ? 'free' : r === 'płacisz gemami' ? 'paid with gems' : r.replace('średni drop', 'average drop')}`,
    (n, r) => `${n} 件物品 · ${r === 'darmowa' ? '免费' : r === 'płacisz gemami' ? '用宝石支付' : r.replace('średni drop', '平均掉落')}`);
P(/^\+(.+) bonus · \+(\d+) gemów$/, (m, g) => `+${m} bonus · +${g} gems`, (m, g) => `+${m} 奖励 · +${g} 宝石`);
P(/^Brakuje (\d+) gracz[ay]\. Poczekaj na kolegów albo przywołaj boty\.$/, n => `${n} player${n === '1' ? '' : 's'} missing. Wait for friends or summon bots.`, n => `还差 ${n} 名玩家。等朋友加入或召唤机器人。`);
P(/^Runda (\d+) z (\d+)$/, (a, b) => `Round ${a} of ${b}`, (a, b) => `第 ${a} / ${b} 轮`);
P(/^Poz\. (\d+)$/, n => `Lvl ${n}`, n => `${n} 级`);
P(/^Poziom (\d+)$/, n => `Level ${n}`, n => `${n} 级`);
P(/^Wymagany poziom (\d+) \(masz (\d+)\)$/, (a, b) => `Level ${a} required (you have ${b})`, (a, b) => `需要 ${a} 级（你是 ${b} 级）`);
P(/^WPŁATA: (.+) · (.+)$/, (a, b) => `DEPOSIT: ${sub(a)} · ${b}`, (a, b) => `存入：${sub(a)} · ${b}`);
P(/^Sprzedaj za (.+)$/, m => `Sell for ${m}`, m => `以 ${m} 出售`);
P(/^Sprzedano za (.+)$/, m => `Sold for ${m}`, m => `已以 ${m} 出售`);
P(/^Wygrałeś (.+)!$/, m => `You won ${m}!`, m => `你赢了 ${m}！`);
P(/^Wygrywa (.+) — (.+)$/, (a, b) => `${a} wins — ${b}`, (a, b) => `${a} 获胜 — ${b}`);
P(/^wartość skinów (.+)$/, m => `skin value ${m}`, m => `皮肤价值 ${m}`);
P(/^EKWIPUNEK \((\d+)\)$/, n => `INVENTORY (${n})`, n => `库存 (${n})`);
P(/^Twoje przedmioty \((\d+)\)$/, n => `Your items (${n})`, n => `你的物品 (${n})`);
P(/^Twój poziom: (\d+)$/, n => `Your level: ${n}`, n => `你的等级：${n}`);
P(/^Trudność (\d)\/5$/, n => `Difficulty ${n}/5`, n => `难度 ${n}/5`);
P(/^Napompowano (\d+) z (\d+)\. Za wolno!$/, (a, b) => `Pumped ${a} of ${b}. Too slow!`, (a, b) => `打气 ${a}/${b}，太慢了！`);
P(/^Pudło! Trafiłeś (\d+) z (\d+)\.$/, (a, b) => `Miss! You hit ${a} of ${b}.`, (a, b) => `没中！命中 ${a}/${b}。`);
P(/^Zdążyłeś zmienić (\d+) z (\d+) biegów\.$/, (a, b) => `You shifted ${a} of ${b} gears in time.`, (a, b) => `你及时换了 ${a}/${b} 个挡。`);
P(/^Zły kolor na pozycji (\d+)\. Kłódka zablokowana\.$/, n => `Wrong colour at position ${n}. Padlock locked.`, n => `第 ${n} 位颜色错误，锁已锁死。`);
P(/^Opona napompowana: (\d+) kliknięć na czas\.$/, n => `Tyre pumped: ${n} taps in time.`, n => `轮胎已打满：及时点击 ${n} 次。`);
P(/^Szyfr (\d+) kolorów złamany\.$/, n => `${n}-colour code cracked.`, n => `${n} 色密码已破解。`);
P(/^Wszystkie (\d+) biegów zmienione na czas\.$/, n => `All ${n} gears shifted in time.`, n => `${n} 个挡全部及时换好。`);
P(/^Wszystkie (\d+) trafienia w punkt\.$/, n => `All ${n} hits on target.`, n => `${n} 次全部命中。`);
P(/^Zjazd ukończony bez wywrotki \((\d+) s\)\.$/, n => `Ride finished without a crash (${n} s).`, n => `完成骑行，没有翻车（${n} 秒）。`);
P(/^Wheelie przez 35 s, (\d+)% czasu w strefie\. Legenda\.$/, n => `Wheelie for 35 s, ${n}% of the time in the zone. Legend.`, n => `翘头 35 秒，${n}% 时间在区内。传奇。`);
P(/^Utrzymałeś się, ale tylko (\d+)% czasu w strefie \(trzeba (\d+)%\)\.$/, (a, b) => `You held on, but only ${a}% of the time in the zone (${b}% needed).`, (a, b) => `你坚持住了，但区内时间只有 ${a}%（需要 ${b}%）。`);
P(/^Awans na poziom (\d+)!(?: \+(\d+) gemów)?$/, (n, g) => `Level up to ${n}!${g ? ` +${g} gems` : ''}`, (n, g) => `升到 ${n} 级！${g ? ` +${g} 宝石` : ''}`);
P(/^Odebrano (\d+) gemów!$/, n => `Claimed ${n} gems!`, n => `已领取 ${n} 宝石！`);
P(/^Potrzebujesz (\d+) gemów\.$/, n => `You need ${n} gems.`, n => `你需要 ${n} 宝石。`);
P(/^Kod (.+) aktywowany!$/, c => `Code ${c} activated!`, c => `代码 ${c} 已激活！`);
P(/^Waluta: (.+)$/, c => `Currency: ${c}`, c => `货币：${c}`);
P(/^Przegrana\. Gwarantowany skin: (.+)$/, s => `Lost. Guaranteed skin: ${s}`, s => `失败。保底皮肤：${s}`);
P(/^Demo: wylosowałbyś (.+)$/, s => `Demo: you would have got ${s}`, s => `试玩：你本会获得 ${s}`);
P(/^host: (.+)$/, s => `host: ${s}`, s => `房主：${s}`);
P(/^brakuje (\d+)$/, n => `${n} short`, n => `还差 ${n}`);
P(/^Dobrze! (\d+)\/(\d+)$/, (a, b) => `Good! ${a}/${b}`, (a, b) => `很好！${a}/${b}`);
P(/^Kolor (#[0-9a-f]+)$/i, c => `Colour ${c}`, c => `颜色 ${c}`);
P(/^Dodano: (.+) \(rund: (\d+)\)$/, (c, n) => `Added: ${sub(c)} (rounds: ${n})`, (c, n) => `已添加：${sub(c)}（回合：${n}）`);
P(/^Wpłacono „(.+)”: \+(.+) i (\d+) gemów$/, (b, m, g) => `Deposited “${sub(b)}”: +${m} and ${g} gems`, (b, m, g) => `已存入“${sub(b)}”：+${m} 和 ${g} 宝石`);
P(/^Misja „(.+)”: \+(\d+) gemów$/, (m, g) => `Mission “${sub(m)}”: +${g} gems`, (m, g) => `任务“${sub(m)}”：+${g} 宝石`);
P(/^Kod (.+): \+(.+)$/, (c, m) => `Code ${c}: +${m}`, (c, m) => `代码 ${c}：+${m}`);
P(/^Ponownie za (.+)$/, t => `Again in ${t}`, t => `${t} 后可再开`);
P(/^Następna darmowa skrzynka za$/, () => 'Next free case in', () => '下一个免费箱子：');
P(/^(.+) — tylko (\d+)% czasu$/, (a, b) => `${a} — only ${b}% of the time`, (a, b) => `${a} — 仅 ${b}% 时间`);
P(/^Przedmioty z gwiazdką to rzadkie dropy \(łącznie ([\d.]+)% szans\)\. Na ruletce pokazują się jako złota gwiazdka — gdy się zatrzyma, kręci się druga ruletka tylko z nich\.$/,
    n => `Starred items are rare drops (${n}% chance in total). On the reel they appear as a gold star — when it stops, a second reel spins with only those items.`,
    n => `带星标的物品是稀有掉落（总概率 ${n}%）。它们在转盘上显示为金色星星——停下时会再转一次，只包含这些物品。`);
P(/^(\d+) pkt$/, n => `${n} pts`, n => `${n} 分`);
P(/^Slalom ukończony: (\d+) bramek, (\d+) pudło\.$/, (a, b) => `Slalom finished: ${a} gates, ${b} miss.`, (a, b) => `绕桩完成：${a} 个门，${b} 次失误。`);
P(/^Za dużo ominiętych bramek \((\d+)\)\. Kukirin wraca do sklepu\.$/, n => `Too many missed gates (${n}). The Kukirin goes back to the shop.`, n => `错过的门太多（${n}）。Kukirin 退回商店。`);
P(/^Podjazd zdobyty w ([\d.]+) s, zostało (\d+)% baterii\.$/, (a, b) => `Climb conquered in ${a} s with ${b}% battery left.`, (a, b) => `${a} 秒完成爬坡，剩余电量 ${b}%。`);
P(/^Stanąłeś na (\d+)% nachylenia \((\d+) m\)\. (Bateria pusta\.|Trzeba było użyć turbo\.)$/, (a, b, c) => `You stalled on a ${a}% slope (${b} m). ${c.startsWith('Bateria') ? 'Battery empty.' : 'You should have used turbo.'}`, (a, b, c) => `你在 ${a}% 的坡上停住了（${b} 米）。${c.startsWith('Bateria') ? '电量耗尽。' : '应该用 TURBO。'}`);
P(/^Czas minął na (\d+) m z (\d+)\. Szybciej i równiej!$/, (a, b) => `Time ran out at ${a} m of ${b}. Faster and steadier!`, (a, b) => `时间到，只骑了 ${a} / ${b} 米。更快更稳！`);
P(/^Złe lądowanie: kąt ([+-]?\d+)° względem rampy \(max ±(\d+)°\)\.$/, (a, b) => `Bad landing: ${a}° off the ramp (max ±${b}°).`, (a, b) => `落地角度错误：与坡面相差 ${a}°（最多 ±${b}°）。`);
P(/^Meta! (\d+) skoków w ([\d.]+) s\.$/, (a, b) => `Finish! ${a} jumps in ${b} s.`, (a, b) => `终点！${b} 秒内完成 ${a} 次飞跃。`);
P(/^Minęło (\d+) s — za wolno na Omegę\.$/, n => `${n} s passed — too slow for the Omega.`, n => `${n} 秒已过——对 Omega 来说太慢了。`);
P(/^Upgrade nieudany \((.+)\)\.$/, m => `Upgrade failed (${/saldo/.test(m) ? 'balance lost' : m.replace(/skin\(y\) przepadły/, 'skin(s) lost')}).`, m => `升级失败（${/saldo/.test(m) ? '余额没了' : m.replace(/skin\(y\) przepadły/, '个皮肤没了')}）。`);
P(/^UPGRADE! x([\d.]+)$/, n => `UPGRADE! x${n}`, n => `升级成功！x${n}`);
P(/^Awans na poziom (\d+)! \+(\d+) gemów$/, (a, b) => `Level ${a}! +${b} gems`, (a, b) => `升到 ${a} 级！+${b} 宝石`);
P(/^Trafione (\d+)% nut, najlepsze combo (\d+)\.$/, (a, b) => `Hit ${a}% of notes, best combo ${b}.`, (a, b) => `命中 ${a}% 的音符，最高连击 ${b}。`);
P(/^Tylko (\d+)% trafionych nut \(trzeba (\d+)%\)\.$/, (a, b) => `Only ${a}% of notes hit (${b}% needed).`, (a, b) => `只命中 ${a}% 的音符（需要 ${b}%）。`);
P(/^(\d+)% \(min\. (\d+)%\)$/, (a, b) => `${a}% (min. ${b}%)`, (a, b) => `${a}%（最低 ${b}%）`);
P(/^(WYGRANA|PUDŁO) · szansa (.+)$/, (a, b) => `${a === 'WYGRANA' ? 'WIN' : 'MISS'} · chance ${b}`, (a, b) => `${a === 'WYGRANA' ? '赢了' : '没中'} · 概率 ${b}`);
P(/^SEKRETNY KOD! \+(.+) i (.+) gemów$/, (a, b) => `SECRET CODE! +${a} and ${b} gems`, (a, b) => `秘密代码！+${a} 和 ${b} 宝石`);

const I18N = { out: new WeakMap(), attrs: ['placeholder', 'title', 'aria-label'] };

// Język witowy: w każdym dłuższym słowie po pierwszej samogłosce pojawia się „wit”.
function witify(str) {
    return str.replace(/\p{L}{4,}/gu, w => {
        const m = w.match(/[aeiouyąęóAEIOUYĄĘÓ]/);
        if (!m) return w;
        const k = m.index + 1;
        const ins = w === w.toUpperCase() ? 'WIT' : 'wit';
        return w.slice(0, k) + ins + w.slice(k);
    });
}

function trString(src) {
    const lang = state.settings.lang;
    if (lang === 'pl' || !src) return src;
    const key = src.trim();
    if (!key || !/\p{L}/u.test(key)) return src;
    const lead = src.slice(0, src.indexOf(key)), tail = src.slice(src.indexOf(key) + key.length);
    const hit = TR[lang]?.[key];
    if (hit !== undefined) return lead + hit + tail;
    for (const [re, fns] of TRP) {
        const m = key.match(re);
        if (m && fns[lang]) return lead + fns[lang](...m.slice(1)) + tail;
    }
    if (lang === 'wit') return lead + witify(key) + tail;
    return src;
}

function skipNode(n) {
    const el = n.nodeType === 1 ? n : n.parentElement;
    return !el || !!el.closest('[translate="no"],script,style,textarea');
}

function trTextNode(n) {
    if (skipNode(n)) return;
    const prev = I18N.out.get(n);
    if (prev !== undefined && prev === n.nodeValue) return;
    const out = trString(n.nodeValue);
    I18N.out.set(n, out);
    if (out !== n.nodeValue) n.nodeValue = out;
}

function trElement(el) {
    if (skipNode(el)) return;
    for (const a of I18N.attrs) {
        const v = el.getAttribute?.(a);
        if (!v) continue;
        const mark = 'data-tr-' + a;
        if (el.getAttribute(mark) === v) continue;
        const out = trString(v);
        el.setAttribute(mark, out);
        if (out !== v) el.setAttribute(a, out);
    }
}

function trTree(root) {
    if (state.settings.lang === 'pl') return;
    if (root.nodeType === 3) { trTextNode(root); return; }
    if (root.nodeType !== 1) return;
    trElement(root);
    root.querySelectorAll?.('[placeholder],[title],[aria-label]').forEach(trElement);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) trTextNode(n);
}

new MutationObserver(muts => {
    if (typeof state === 'undefined' || state.settings.lang === 'pl') return;
    for (const m of muts) {
        if (m.type === 'characterData') trTextNode(m.target);
        else if (m.type === 'attributes') trElement(m.target);
        else m.addedNodes.forEach(trTree);
    }
}).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: I18N.attrs });

function applyLang() {
    const lang = state.settings.lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang === 'en' ? 'en' : 'pl';
    if (lang === 'zh' && !document.getElementById('zhFont')) {
        const l = document.createElement('link');
        l.id = 'zhFont'; l.rel = 'stylesheet';
        l.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@500;700;900&display=swap';
        document.head.appendChild(l);
    }
    document.body.classList.toggle('lang-zh', lang === 'zh');
    // Przebuduj wszystko po polsku — obserwator przetłumaczy nowe węzły.
    renderShell(); renderTop(); renderDrops(false); renderPage();
    trTree(document.body);
}
