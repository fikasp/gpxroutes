# GPX Routes

Prosta aplikacja webowa do wyświetlania tras z plików GPX na mapie. Bez frameworków, bez bundlera — czysty HTML, CSS i JavaScript (Vanilla JS) oparty na mapie OpenStreetMap.

## 🔗 Kluczowe funkcje

* **Wczytywanie wielu plików GPX** — w oknie wyboru można zaznaczyć dowolną liczbę plików.
* **Lista tras** w bocznym panelu (nazwa pliku + długość w km), kliknięcie trasy wyśrodkowuje na niej mapę.
* **Kolor i grubość linii** ustawiane osobno dla każdej trasy (wybór koloru + suwak).
* **Zmiana koloru i grubości wszystkich tras naraz** — blok „Wszystkie trasy” nad listą. Ustawione wartości są zapamiętywane i stają się domyślnym kolorem i grubością każdej nowo wczytanej trasy.
* **Drag and drop** — pliki `.gpx` można przeciągnąć na przycisk „Wczytaj”.
* **Wskaźnik powiększenia** w lewym dolnym rogu mapy.
* **Usuwanie pojedynczych tras** przyciskiem **×** oraz **Wyczyść** (z potwierdzeniem) usuwające wszystkie.
* **Tryb pełnoekranowy** (np. F11) ukrywa nagłówek i stopkę — mapa i panel zajmują cały ekran.
* **Mapa OpenStreetMap** (Leaflet) — bez kluczy API, bez opłat.

## 🏛️ Struktura projektu

- `vendor/` — biblioteki zewnętrzne (Font Awesome, Leaflet, czcionka Play)
- `styles.css` — style aplikacji
- `script.js` — logika aplikacji
- `index.html` — plik główny
- `README.md` — dokumentacja

## ⚙️ Technologie

* **HTML5 + CSS3**
* **JavaScript (ES6)**
* **Leaflet** — biblioteka do interaktywnych map
* **OpenStreetMap** — źródło kafelków mapowych

## 📄 Instrukcja użycia

1. **Otwórz `index.html`** w przeglądarce.
2. Kliknij **„Wczytaj”** i zaznacz jeden lub wiele plików `.gpx` albo przeciągnij je na ten przycisk.
3. Trasy pojawią się na mapie i na liście, a widok dopasuje się do wczytanych plików.
4. Przy każdej trasie zmień **kolor** (kwadrat po lewej) i **grubość** (suwak).
5. Blok **„Wszystkie trasy”** zmienia kolor i grubość każdej trasy jednocześnie.
6. **„Wyczyść”** usuwa wszystkie trasy po potwierdzeniu.
7. Klawisz **F2** zwija/rozwija panel.

## ⏱️ Historia wersji

* **v1.3 (2026-09-30):**
  * Wczytywanie plików GPX przez drag and drop na przycisk „Wczytaj”.
  * Wskaźnik poziomu powiększenia w lewym dolnym rogu.

* **v1.2 (2026-09-30):**
  * Ukrywanie nagłówka i stopki w trybie pełnoekranowym.
  * Zapamiętywanie domyślnego koloru i grubości tras w `localStorage`.
  * Zoom co 0,5 poziomu.

* **v1.1 (2026-09-30):**
  * Dodanie przycisku „Wyczyść” z oknem potwierdzenia.
  * Dodanie zmiany koloru i grubości wszystkich tras naraz.

* **v1.0 (2026-09-30):** Pierwsza wersja aplikacji.
  * Wczytywanie wielu plików GPX i wyświetlanie tras na mapie.
  * Zmiana koloru i grubości linii dla każdej trasy.