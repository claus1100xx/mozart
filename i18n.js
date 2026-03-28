// i18n.js — English / German translation system
window.I18N = {
  lang: 'en',

  toggle() {
    this.lang = this.lang === 'en' ? 'de' : 'en';
  },

  t(key) {
    return (this.strings[this.lang] && this.strings[this.lang][key]) || key;
  },

  strings: {
    en: {
      // ── Core UI ────────────────────────────────────────────────────────
      menu_title:    "Mozart's Musical Adventure",
      menu_subtitle: "Defeat Salieri and save the music!",
      menu_start:    "Press ENTER or click to Start",
      menu_lang:     "Language: EN | DE",
      hud_lives:     "Lives",
      hud_score:     "Score",
      hud_level:     "Level",
      pause_title:   "PAUSED",
      pause_resume:  "ESC to resume",
      pause_mute:    "M to toggle music",
      gameover_title:"GAME OVER",
      gameover_sub:  "Press ENTER to try again",
      win_title:     "Bravo, Maestro!",
      win_sub:       "Mozart triumphs over Salieri!",
      win_score:     "Final Score:",
      boss_intro:    "Salieri appears!",
      tutorial_move: "Arrow keys to move",
      tutorial_jump: "Space or Up to jump",
      tutorial_stomp:"Jump on enemies to defeat them!",
      level_name_1:  "The Concert Hall",
      level_name_2:  "The Opera House",
      level_name_3:  "Salieri's Lair",
      stars_1:       "One Star — Keep practicing!",
      stars_2:       "Two Stars — Well done!",
      stars_3:       "Three Stars — Magnificent!",

      // ── Mozart Facts ───────────────────────────────────────────────────
      fact_label:    "♪ Did you know?",
      fact_1_1:      "Mozart wrote his first symphony at just 8 years old!",
      fact_1_2:      "By age 5, Mozart could play piano perfectly by ear.",
      fact_1_3:      "Mozart composed over 600 works in his short 35-year life.",
      fact_1_4:      "The Turkish March was composed in Vienna around 1783.",
      fact_2_1:      "Mozart wrote The Magic Flute just months before he died.",
      fact_2_2:      "Symphony No. 40 in G minor is one of his most beloved works.",
      fact_2_3:      "Mozart could write out a whole piece after hearing it just once!",
      fact_2_4:      "Mozart's full baptismal name had 14 words in it!",
      fact_3_1:      "Salieri and Mozart were real rivals in the Vienna court.",
      fact_3_2:      "Mozart often composed through the night without sleeping.",
      fact_3_3:      "Mozart's last work, the Requiem, was left unfinished when he died.",

      // ── Quiz UI ────────────────────────────────────────────────────────
      quiz_title:          "Knowledge Challenge!",
      quiz_summary:        "Quiz Complete!",
      quiz_bonus:          "Bonus Points:",
      quiz_correct_banner: "Correct! ★",
      quiz_wrong_banner:   "Not quite... the answer was:",
      quiz_hint:           "Press  A B C D  or  1 2 3 4  or click an answer",
      quiz_loading:        "Get ready for the next level...",
      quiz_question_label: "Question",
      quiz_of:             "of",

      // ── Quiz Questions — Level 1 ───────────────────────────────────────
      quiz_q_1_1:   "How old was Mozart when he wrote his first symphony?",
      quiz_q_1_1_a: "4 years old",
      quiz_q_1_1_b: "8 years old",
      quiz_q_1_1_c: "12 years old",
      quiz_q_1_1_d: "16 years old",

      quiz_q_1_2:   "At what age could Mozart play piano perfectly by ear?",
      quiz_q_1_2_a: "3 years old",
      quiz_q_1_2_b: "7 years old",
      quiz_q_1_2_c: "5 years old",
      quiz_q_1_2_d: "10 years old",

      quiz_q_1_3:   "How many works did Mozart compose in his lifetime?",
      quiz_q_1_3_a: "About 200",
      quiz_q_1_3_b: "About 400",
      quiz_q_1_3_c: "Over 600",
      quiz_q_1_3_d: "Over 1,000",

      quiz_q_1_4:   "In which city was the Turkish March composed?",
      quiz_q_1_4_a: "Salzburg",
      quiz_q_1_4_b: "Paris",
      quiz_q_1_4_c: "London",
      quiz_q_1_4_d: "Vienna",

      // ── Quiz Questions — Level 2 ───────────────────────────────────────
      quiz_q_2_1:   "When did Mozart write The Magic Flute?",
      quiz_q_2_1_a: "Early in his career",
      quiz_q_2_1_b: "Just months before he died",
      quiz_q_2_1_c: "During his teenage years",
      quiz_q_2_1_d: "While living in London",

      quiz_q_2_2:   "In what key is Symphony No. 40?",
      quiz_q_2_2_a: "C major",
      quiz_q_2_2_b: "D minor",
      quiz_q_2_2_c: "G minor",
      quiz_q_2_2_d: "A major",

      quiz_q_2_3:   "What amazing musical skill did Mozart have?",
      quiz_q_2_3_a: "Playing 3 instruments at once",
      quiz_q_2_3_b: "Composing while asleep",
      quiz_q_2_3_c: "Writing out music after hearing it just once",
      quiz_q_2_3_d: "Memorising entire operas",

      quiz_q_2_4:   "How many words were in Mozart's full baptismal name?",
      quiz_q_2_4_a: "4",
      quiz_q_2_4_b: "8",
      quiz_q_2_4_c: "14",
      quiz_q_2_4_d: "20",

      // ── Piano Challenge ────────────────────────────────────────────────
      piano_title:      "Piano Challenge!",
      piano_subtitle:   "Can you play Mozart's melody?",
      piano_watch:      "Watch carefully...",
      piano_ready:      "Get ready!",
      piano_repeat:     "Now repeat the melody!",
      piano_success:    "Magnificent! ★",
      piano_wrong:      "Wrong note — try again!",
      piano_fail_demo:  "Watch the melody one more time...",
      piano_hint:       "Click the keys  or use letter keys  C D E F G A B",
      piano_fail_label: "Mistakes:",
      piano_progress:   "Notes correct:",
    },

    de: {
      // ── Core UI ────────────────────────────────────────────────────────
      menu_title:    "Mozarts Musikalisches Abenteuer",
      menu_subtitle: "Besieg Salieri und rette die Musik!",
      menu_start:    "ENTER oder Klick zum Starten",
      menu_lang:     "Sprache: EN | DE",
      hud_lives:     "Leben",
      hud_score:     "Punkte",
      hud_level:     "Level",
      pause_title:   "PAUSE",
      pause_resume:  "ESC zum Fortsetzen",
      pause_mute:    "M für Musik an/aus",
      gameover_title:"SPIEL VORBEI",
      gameover_sub:  "ENTER zum Nochmals versuchen",
      win_title:     "Bravo, Maestro!",
      win_sub:       "Mozart besiegt Salieri!",
      win_score:     "Endpunktzahl:",
      boss_intro:    "Salieri erscheint!",
      tutorial_move: "Pfeiltasten zum Bewegen",
      tutorial_jump: "Leertaste oder Hoch zum Springen",
      tutorial_stomp:"Spring auf Feinde, um sie zu besiegen!",
      level_name_1:  "Der Konzertsaal",
      level_name_2:  "Das Opernhaus",
      level_name_3:  "Salieris Versteck",
      stars_1:       "Ein Stern — Weiter üben!",
      stars_2:       "Zwei Sterne — Gut gemacht!",
      stars_3:       "Drei Sterne — Wunderbar!",

      // ── Mozart Facts ───────────────────────────────────────────────────
      fact_label:    "♪ Wusstest du?",
      fact_1_1:      "Mozart schrieb seine erste Sinfonie mit nur 8 Jahren!",
      fact_1_2:      "Mit 5 Jahren konnte Mozart Klavier perfekt nach Gehör spielen.",
      fact_1_3:      "Mozart komponierte über 600 Werke in seinem kurzen 35-jährigen Leben.",
      fact_1_4:      "Der Türkische Marsch wurde um 1783 in Wien komponiert.",
      fact_2_1:      "Mozart schrieb Die Zauberflöte wenige Monate vor seinem Tod.",
      fact_2_2:      "Sinfonie Nr. 40 in g-Moll ist eines seiner bekanntesten Werke.",
      fact_2_3:      "Mozart konnte ein ganzes Stück aufschreiben, nachdem er es einmal gehört hatte!",
      fact_2_4:      "Mozarts vollständiger Taufname hatte 14 Wörter!",
      fact_3_1:      "Salieri und Mozart waren echte Rivalen am Wiener Hof.",
      fact_3_2:      "Mozart komponierte oft die ganze Nacht durch.",
      fact_3_3:      "Mozarts letztes Werk, das Requiem, blieb unvollendet.",

      // ── Quiz UI ────────────────────────────────────────────────────────
      quiz_title:          "Wissensquiz!",
      quiz_summary:        "Quiz abgeschlossen!",
      quiz_bonus:          "Bonuspunkte:",
      quiz_correct_banner: "Richtig! ★",
      quiz_wrong_banner:   "Nicht ganz... die Antwort war:",
      quiz_hint:           "Drücke  A B C D  oder  1 2 3 4  oder klicke eine Antwort",
      quiz_loading:        "Bereit für das nächste Level...",
      quiz_question_label: "Frage",
      quiz_of:             "von",

      // ── Quiz Questions — Level 1 ───────────────────────────────────────
      quiz_q_1_1:   "Wie alt war Mozart, als er seine erste Sinfonie schrieb?",
      quiz_q_1_1_a: "4 Jahre alt",
      quiz_q_1_1_b: "8 Jahre alt",
      quiz_q_1_1_c: "12 Jahre alt",
      quiz_q_1_1_d: "16 Jahre alt",

      quiz_q_1_2:   "In welchem Alter konnte Mozart Klavier perfekt nach Gehör spielen?",
      quiz_q_1_2_a: "3 Jahre alt",
      quiz_q_1_2_b: "7 Jahre alt",
      quiz_q_1_2_c: "5 Jahre alt",
      quiz_q_1_2_d: "10 Jahre alt",

      quiz_q_1_3:   "Wie viele Werke komponierte Mozart in seinem Leben?",
      quiz_q_1_3_a: "Etwa 200",
      quiz_q_1_3_b: "Etwa 400",
      quiz_q_1_3_c: "Über 600",
      quiz_q_1_3_d: "Über 1.000",

      quiz_q_1_4:   "In welcher Stadt wurde der Türkische Marsch komponiert?",
      quiz_q_1_4_a: "Salzburg",
      quiz_q_1_4_b: "Paris",
      quiz_q_1_4_c: "London",
      quiz_q_1_4_d: "Wien",

      // ── Quiz Questions — Level 2 ───────────────────────────────────────
      quiz_q_2_1:   "Wann schrieb Mozart Die Zauberflöte?",
      quiz_q_2_1_a: "Früh in seiner Karriere",
      quiz_q_2_1_b: "Wenige Monate vor seinem Tod",
      quiz_q_2_1_c: "In seiner Jugend",
      quiz_q_2_1_d: "Während er in London lebte",

      quiz_q_2_2:   "In welcher Tonart steht Sinfonie Nr. 40?",
      quiz_q_2_2_a: "C-Dur",
      quiz_q_2_2_b: "d-Moll",
      quiz_q_2_2_c: "g-Moll",
      quiz_q_2_2_d: "A-Dur",

      quiz_q_2_3:   "Welche besondere musikalische Fähigkeit hatte Mozart?",
      quiz_q_2_3_a: "3 Instrumente gleichzeitig spielen",
      quiz_q_2_3_b: "Im Schlaf komponieren",
      quiz_q_2_3_c: "Musik aufschreiben, nachdem er sie einmal gehört hatte",
      quiz_q_2_3_d: "Ganze Opern auswendig kennen",

      quiz_q_2_4:   "Wie viele Wörter hatte Mozarts vollständiger Taufname?",
      quiz_q_2_4_a: "4",
      quiz_q_2_4_b: "8",
      quiz_q_2_4_c: "14",
      quiz_q_2_4_d: "20",

      // ── Piano Challenge ────────────────────────────────────────────────
      piano_title:      "Klavieraufgabe!",
      piano_subtitle:   "Kannst du Mozarts Melodie spielen?",
      piano_watch:      "Schau genau hin...",
      piano_ready:      "Mach dich bereit!",
      piano_repeat:     "Wiederhole jetzt die Melodie!",
      piano_success:    "Wunderbar! ★",
      piano_wrong:      "Falsche Note — nochmal!",
      piano_fail_demo:  "Schau dir die Melodie noch einmal an...",
      piano_hint:       "Klicke auf die Tasten oder benutze Tasten  C D E F G A B",
      piano_fail_label: "Fehler:",
      piano_progress:   "Richtige Noten:",
    }
  }
};
