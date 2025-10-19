Phase 1 – Sicht schaffen & Leitplanken setzen
	1.	Bestandsaufnahme (nur notieren, nichts umbauen)

	•	Liste der UI-Screens, die Video lesen/schreiben: Liste/Detail/Edit/Imports o. ä.
	•	Welche Felder/Relationen nutzt jeder Screen tatsächlich?
	•	Wo existieren heute eigene Types/Interfaces/Fragments pro Use-Case?

	2.	Gemeinsame Begriffe/Struktur definieren

	•	Ein Output-Vokabular (Basic | Detail | Edit) für Video.
	•	Ein Input-Vokabular (UpsertInput) für Mutationen.
	•	Entscheidung: ID-basiertes Schreiben ist der Default; Name-basierte Pfade nur dort, wo wirklich nötig.

	3.	Akzeptanzkriterien pro Use-Case festlegen

	•	Basic: minimale Felder, schnell ladbar, für Listenansicht.
	•	Detail: alle Anzeige-Felder inkl. aufgelöster Relationen.
	•	Edit: Felder für Formularwerte + benötigte Lookup-Listen (Genres, MediaTypes) mit {id,name}.
	•	Upsert: nur die Felder, die fürs Speichern nötig sind (IDs für Relationen).

Phase 2 – Backend konsolidieren (Prisma + GraphQL)
	4.	Selektionen standardisieren (nur konzeptionell)

	•	Einmalige, wiederverwendbare “Select-Profile” festlegen: Basic/Detail/Edit.
	•	Entscheiden, welche Relationen in Detail vs. Edit wirklich benötigt sind.

	5.	Repository-Schnittstelle ordnen

	•	Pro Use-Case genau eine Funktion: getVideoBasic, getVideoDetailById, getVideoEditById, upsertVideo.
	•	Jede dieser Funktionen liefert/erwartet exakt das definierte Profil/Input.
	•	Keine „magischen“ Flags mehr quer durch Allgemein-Funktionen; Flags bleiben auf Use-Case begrenzt.

	6.	GraphQL-Schema glätten

	•	Output-Typen (Basic/Detail/Edit) klar trennen – oder ein Typ mit klaren optionalen Feldern, aber Queries pro Use-Case.
	•	Mutations-Input als ein konsistentes UpsertInput (IDs für Relationen).
	•	Optional: separater Endpunkt für seltene Name-basierte Schreibpfade (nur wenn wirklich gebraucht).

Definition of Done für Phase 2:
	•	Ein Ort, an dem pro Use-Case die gelieferten Felder zentral definiert sind.
	•	Ein Mutation-Input, der in allen Schreibpfaden gleich ist.
	•	Keine UI bricht: bestehender Durchstich läuft unverändert.

Phase 3 – Client/UX aufräumen (schonender Umbau)
	7.	Fragments & Queries pro Use-Case

	•	VideoBasicFields, VideoDetailFields, VideoEditFields.
	•	Jede Komponente nutzt genau ein Fragment. Keine Ad-hoc-Felder mehr in Queries.

	8.	Dropdown-Datenfluss vereinheitlichen

	•	Lookup-Queries für Genres/MediaTypes bereitstellen.
	•	UI zeigt name, hält id als Wert, sendet beim Speichern IDs.

	9.	Formular-State und DTO-Grenze

	•	Interner Formular-State spiegelt Edit-Profil wider.
	•	Vor dem Submit: klare, kleine Transformation → UpsertInput (IDs, skalare Felder).

Definition of Done für Phase 3:
	•	Detail- und Edit-Seite verwenden je ein klar definiertes Fragment.
	•	Speichern sendet nur IDs für Relationen.
	•	Kein Komponenten-Spaghetti: pro Screen eine Query, ein Fragment, ein Submit-Mapping.

Phase 4 – Qualität absichern
	10.	Typ-Kontrakte testen

	•	Leichte Contract-Tests je Repository-Funktion: liefert genau die erwarteten Felder (keine mehr, keine weniger).
	•	Mutation-Tests: validieren, dass nur definierte Input-Felder akzeptiert werden.

	11.	UI-Checks

	•	Snapshot/Story-basierte Tests für Detail/Edit (Rendering mit Minimal- und Voll-Payload).
	•	E2E-Pfad: Laden Detail → Öffnen Edit → Ändern → Speichern → Rücksprung.

	12.	Observability

	•	Log/Trace pro Use-Case Query/Mutation (Name, Dauer, Größe der Antwort).
	•	Warnschwellen definieren (z. B. Antwortgröße > X KB in Detail).

Phase 5 – Entrümpeln & Dokumentieren
	13.	Alte Pfade deprecaten

	•	Flag-basierte, generische Fetches mit zu vielen Optionen markieren und schrittweise ersetzen.
	•	Migrations-Notiz: welche Consumer ziehen auf welche neuen Funktionen/Queries um.

	14.	Dev-Dokumentation

	•	Kurzleitfaden „Wie baue ich einen neuen Use-Case?“
(Select-Profil wählen/erstellen → Repo-Methode → Query/Fragment → UI-Mapping → Tests)
	•	Tabelle der verfügbaren Use-Case-Felder (Basic/Detail/Edit) zur schnellen Orientierung.

Reihenfolge der Umsetzung (kleinstmögliche Risiken zuerst)
	1.	Phase 1 (Sicht & Leitplanken)
	2.	Phase 2 Schritt 4–6 (Backend-Profile/Repo/Schema – ohne UI-Änderungen)
	3.	Phase 3 Schritt 7–9 (Detail/Edit UI auf neue Profile/Fragments heben)
	4.	Phase 4 (Tests/Observability)
	5.	Phase 5 (Deprecations + Docs)

Risiko-/Trade-offs & Gegenmaßnahmen
	•	Drift zwischen Profilen und UI → Ein zentraler Ort für Profile; Tests prüfen Feldmenge.
	•	Überladung von Detail-Profil → „Edit“ strikt separat halten; Detail bleibt lesefreundlich, Edit formular-tauglich.
	•	Name-basierte Sonderpfade → Nur gezielt erlauben; Unique-Constraints auf Namen, klare Abgrenzung vom Standard (ID-basiert).
	•	Leistungs-Regress → Telemetrie auf Antwortgröße & Dauer; frühzeitig alarmieren.
