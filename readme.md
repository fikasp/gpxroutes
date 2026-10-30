# GPX Studio

Prosta aplikacja webowa do przeglądania tras z plików GPX oraz tworzenia i edycji punktów na mapie. Bez frameworków, bez bundlera — czysty HTML, CSS i JavaScript (Vanilla JS) oparty na mapie OpenStreetMap.

## 🔗 Kluczowe funkcje

* **Dwie zakładki w panelu: Trasy | Punkty** — z licznikami, obie warstwy są widoczne na mapie jednocześnie.
* **Jeden przycisk „Wczytaj”** (także drag and drop na przycisk) — wiele plików GPX naraz. Trasy trafiają do zakładki „Trasy”, punkty (`wpt`) do zakładki „Punkty”.
* **Trasy:** lista z nazwą i długością w km, kolor (paleta) i grubość linii osobno dla każdej trasy oraz dla wszystkich naraz. Domyślny kolor i grubość są zapamiętywane.
* **Punkty:** tryb dodawania (przycisk **＋ Dodawanie**, klik na mapie), edycja nazwy i opisu w popupie, przesuwanie markera, sortowanie A→Z i ręczna kolejność (przeciągnij-upuść), edytowalna nazwa pliku, **Zapisz** do pliku GPX. Punkty są zapamiętywane w `localStorage`.
* **Lista wyboru podkładu mapy** — OpenStreetMap, OpenStreetMap z cieniowaniem terenu, OpenTopoMap (turystyczna) lub Outdoor od Freemap (szlaki w kolorach oznakowania).
* **Wskaźnik powiększenia** w lewym dolnym rogu mapy, zoom co 0,5 poziomu.
* **Tryb pełnoekranowy** (np. F11) ukrywa nagłówek i stopkę.

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
* **OpenStreetMap** i **OpenTopoMap** — źródła kafelków mapowych (dane © OpenStreetMap contributors, SRTM; styl © OpenTopoMap)
* **Freemap Slovakia (Outdoor)** — podkład ze szlakami w kolorach oznakowania (© Freemap Slovakia, © OpenStreetMap contributors)
* **Esri World Hillshade** — cieniowanie terenu nałożone na OpenStreetMap (© Esri)

## 📄 Instrukcja użycia

* **Otwórz `index.html`** w przeglądarce.
* Kliknij **„Wczytaj”** (albo przeciągnij pliki `.gpx` na ten przycisk), aby wczytać trasy i/lub punkty.
* W zakładce **Trasy** zmieniaj kolor (kliknij kwadrat i wybierz z palety) i grubość (przycisk z liczbą pikseli).
* W zakładce **Punkty** włącz **＋ Dodawanie** i klikaj na mapie, aby dodać punkty. **Esc** wyłącza tryb dodawania.
* **„Zapisz”** (zakładka Punkty) pobiera plik GPX z punktami; nazwę pliku zmienisz klikając nazwę nad listą.
* Lista **„Podkład mapy”** zmienia wygląd mapy.
* Klawisz **F2** zwija/rozwija panel.

## ⏱️ Historia wersji

* **v2.0 (2026-10-31):**
  * Integracja aplikacji z GPX points - zakładki Trasy i Punkty we wspólnym panelu.
  * Wprowadzenie dodatkowego Tryb dodawania punktów (+ Dodawanie).

* **v1.7 (2026-10-31):**
  * Zastąpienie systemowego wyboru koloru małą paletą kolorów.
  * Zamiana stale wyświetlanego suwaka szerokości trasy na dedykowane okienko.

* **v1.6 (2026-10-28):**
  * Dodanie podkładu „Mapa outdoorowa” (Freemap) ze szlakami w kolorach oznakowania.
  * Dodanie podkładu „Mapa standardowa z cieniowaniem” (OpenStreetMap + Esri World Hillshade).

* **v1.5 (2026-10-28):**
  * Dodanie przełącznika podkładu mapy (OpenStreetMap / OpenTopoMap).

* **v1.4 (2026-10-20):**
  * Zmiana stylu przycisku „Wczytaj”, podczas przeciągania.

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

## ✉️ Kontakt

Pytania, sugestie lub chęć współpracy: [fikasp@gmail.com](mailto:fikasp@gmail.com).

Dziękuję za korzystanie z aplikacji!
