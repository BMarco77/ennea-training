
import { useEffect, useState } from "react";
import wappen from "./assets/wappen.png";
import merkmale from "./data/merkmale.json";
import LexButton from "./components/LexButton.jsx";

const LOCALSTORAGE_KEY = "geseheneBilder";
const STATS_KEY = "ennea_quiz_stats";

// >>> HIER anpassen, falls Pfad/Name anders ist:
const LEXIKON_BASE_URL = "https://ennea-lexikon.netlify.app";
const QUIZ_BILDER_URL = `${LEXIKON_BASE_URL}/bilder.json`;
// <<<

function speichereGezeigteBilder(bildNamen) {
  const bisher = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY)) || [];
  const zusammen = [...new Set([...bisher, ...bildNamen])];
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(zusammen));
}

function ladeGeseheneBilder() {
  return JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY)) || [];
}

function resetGezeigteBilder() {
  localStorage.removeItem(LOCALSTORAGE_KEY);
}

const subtypen = ["Se", "So", "Sx"];
const typen = Array.from({ length: 9 }, (_, i) => i + 1);

function getWingsForType(typ) {
  if (!typ) return [];
  const left = typ === 1 ? 9 : typ - 1;
  const right = typ === 9 ? 1 : typ + 1;
  return [left, right];
}

const dropdownStyle = {
  width: "100%",
  padding: "0.4rem 0.6rem",
  borderRadius: "0.5rem",
  border: "1px solid #444",
  backgroundColor: "#f5e6d2",
  fontFamily: "inherit",
  fontSize: "0.95rem",
  color: "#333",
  boxSizing: "border-box",
  boxShadow: "inset 0 1px 1px rgba(0,0,0,0.1)",
  cursor: "pointer",
};

function parseBildInfo(pfad) {
  // erwartet z.B. "Se4w5"
  const typMatch = pfad.match(/\d+/);
  const wingMatch = pfad.match(/w(\d)/i);
  return {
    typ: typMatch ? parseInt(typMatch[0], 10) : null,
    subtyp: pfad.slice(0, 2), // "Se", "So", "Sx"
    wing: wingMatch ? parseInt(wingMatch[1], 10) : null,
  };
}

// --- Ausgewogene Ziehlogik (40 / 40 / 20) ---
function zieheAusgewogenesBild(weiblich, maennlich, neutral, gesehen) {
  const w = 0.4;
  const m = 0.4;
  const n = 0.2;

  const r = Math.random();
  let pool = r < w ? weiblich : r < w + m ? maennlich : neutral;

  let unge = pool.filter((b) => !gesehen.includes(b.datei));

  if (unge.length === 0) {
    unge = [...pool];
  }

  // Zufallsbild zurückgeben
  return unge[Math.floor(Math.random() * unge.length)];
}

export default function QuizModul() {
  const [alleBilder, setAlleBilder] = useState([]); // kompletter Pool aus JSON
  const [weiblichPool, setWeiblichPool] = useState([]);
  const [maennlichPool, setMaennlichPool] = useState([]);
  const [neutralPool, setNeutralPool] = useState([]);

  const [rundeBilder, setRundeBilder] = useState([]);
  const [antworten, setAntworten] = useState({});
  const [feedback, setFeedback] = useState({});
  const [geprueft, setGeprueft] = useState(false);
  const [vergroessertesBild, setVergroessertesBild] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Level: anfaenger | fortgeschritten | expert
  const [level, setLevel] = useState("fortgeschritten");
  
  // --- Trefferquote / Stats ---
const [showStats, setShowStats] = useState(false);
const [stats, setStats] = useState({
  imagesTotal: 0,        // Anzahl geübter Bilder
  overallCorrect: 0,     // alles korrekt (je Bild, je Level)
  typCorrect: 0,         // Typ richtig
  subtypTotal: 0,        // Subtyp-Versuche (nur ab Fortgeschritten)
  subtypCorrect: 0,      // Subtyp richtig
  wingTotal: 0,          // Wing-Versuche (nur Expert & wenn Wing vorhanden)
  wingCorrect: 0,        // Wing richtig
});
// --- Stats aus LocalStorage laden ---
useEffect(() => {
  const saved = JSON.parse(localStorage.getItem(STATS_KEY));
  if (saved) setStats(saved);
}, []);
  const starteNeueRunde = (
    pool = alleBilder,
    weiblichArg = weiblichPool,
    maennlichArg = maennlichPool,
    neutralArg = neutralPool
  ) => {
    if (!pool || pool.length === 0) {
      setRundeBilder([]);
      return;
    }

    const gesehen = ladeGeseheneBilder();

    // (Optionaler Reset-Mechanismus bleibt, auch wenn Ziehung nun über Pools läuft)
    let nochNichtGesehen = pool.filter((bild) => !gesehen.includes(bild.datei));
    if (nochNichtGesehen.length < 2) {
      resetGezeigteBilder();
      nochNichtGesehen = [...pool];
    }

    const bild1 = zieheAusgewogenesBild(
      weiblichArg,
      maennlichArg,
      neutralArg,
      gesehen
    );

    const bild2 = zieheAusgewogenesBild(
      weiblichArg,
      maennlichArg,
      neutralArg,
      [...gesehen, bild1.datei]
    );

    const neue = [bild1, bild2];

    setRundeBilder(neue);
    setAntworten({});
    setFeedback({});
    setGeprueft(false);

    speichereGezeigteBilder(neue.map((b) => b.datei));
  };

  // --- Trefferquote / Stats ---
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState({
    imagesTotal: 0, // Anzahl geübter Bilder
    overallCorrect: 0, // alles korrekt (je Bild, je Level)
    typCorrect: 0, // Typ richtig
    subtypTotal: 0, // Subtyp-Versuche (nur ab Fortgeschritten)
    subtypCorrect: 0, // Subtyp richtig
    wingTotal: 0, // Wing-Versuche (nur Expert & wenn Wing vorhanden)
    wingCorrect: 0, // Wing richtig
  });
  // --- Stats aus LocalStorage laden ---
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STATS_KEY));
    if (saved) setStats(saved);
  }, []);
  const starteNeueRunde = (
    pool = alleBilder,
    weiblichArg = weiblichPool,
    maennlichArg = maennlichPool,
    neutralArg = neutralPool
  ) => {
    if (!pool || pool.length === 0) {
      setRundeBilder([]);
      return;
    }

    const gesehen = ladeGeseheneBilder();

    // (Optionaler Reset-Mechanismus bleibt, auch wenn Ziehung nun über Pools läuft)
    let nochNichtGesehen = pool.filter((bild) => !gesehen.includes(bild.datei));
    if (nochNichtGesehen.length < 2) {
      resetGezeigteBilder();
      nochNichtGesehen = [...pool];
    }

    const bild1 = zieheAusgewogenesBild(
      weiblichArg,
      maennlichArg,
      neutralArg,
      gesehen
    );

    const bild2 = zieheAusgewogenesBild(weiblichArg, maennlichArg, neutralArg, [
      ...gesehen,
      bild1.datei,
    ]);

    const neue = [bild1, bild2];

    setRundeBilder(neue);
    setAntworten({});
    setFeedback({});
    setGeprueft(false);

    speichereGezeigteBilder(neue.map((b) => b.datei));
  };

  // JSON vom Lexikon laden
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(QUIZ_BILDER_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const bilder = data.bilder || [];

        const enriched = bilder.map((bild) => ({
          ...bild,
          ...parseBildInfo(bild.pfad),
        }));

        // Pools berechnen
        const weiblich = enriched.filter((b) => b.typ >= 1 && b.typ <= 4);
        const maennlich = enriched.filter((b) => b.typ >= 5 && b.typ <= 8);
        const neutral = enriched.filter((b) => b.typ === 9);

        // In State speichern
        setWeiblichPool(weiblich);
        setMaennlichPool(maennlich);
        setNeutralPool(neutral);

        setAlleBilder(enriched);

        // erste Runde mit frischen Pools starten
        starteNeueRunde(enriched, weiblich, maennlich, neutral);
      } catch (e) {
        console.error("Fehler beim Laden der Quizdaten:", e);
        setError("Daten konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAntwort = (index, field, value) => {
    setAntworten((prev) => ({
      ...prev,
      [index]: { ...prev[index], [field]: value },
    }));
  };

  const pruefeAntworten = () => {
    const result = {};
    rundeBilder.forEach((bild, index) => {
      const a = antworten[index] || {};

      const typRichtig = a.typ != null && parseInt(a.typ, 10) === bild.typ;
      const subtypRichtig = a.subtyp === bild.subtyp;
      const wingRichtig =
        bild.wing == null
          ? true
          : a.wing != null && parseInt(a.wing, 10) === bild.wing;

      let istRichtig = false;
      if (level === "anfaenger") {
        istRichtig = typRichtig;
      } else if (level === "fortgeschritten") {
        istRichtig = typRichtig && subtypRichtig;
      } else if (level === "expert") {
        // Expert: Typ + Subtyp + Wing (falls vorhanden)
        istRichtig = typRichtig && subtypRichtig && wingRichtig;
      }

      result[index] = {
        typRichtig,
        subtypRichtig,
        wingRichtig,
        istRichtig,
      };
    });
    // --- Stats aktualisieren ---
    let overallInc = 0;
    let typInc = 0;
    let subtypInc = 0;
    let wingInc = 0;

    let subtypTotalInc = 0;
    let wingTotalInc = 0;

    rundeBilder.forEach((bild, index) => {
      const r = result[index];

      if (r.istRichtig) overallInc++;
      if (r.typRichtig) typInc++;

      if (level !== "anfaenger") {
        subtypTotalInc++;
        if (r.subtypRichtig) subtypInc++;
      }

      if (level === "expert" && bild.wing != null) {
        wingTotalInc++;
        if (r.wingRichtig) wingInc++;
      }
    });

    const newStats = {
      imagesTotal: stats.imagesTotal + rundeBilder.length,
      overallCorrect: stats.overallCorrect + overallInc,
      typCorrect: stats.typCorrect + typInc,
      subtypTotal: stats.subtypTotal + subtypTotalInc,
      subtypCorrect: stats.subtypCorrect + subtypInc,
      wingTotal: stats.wingTotal + wingTotalInc,
      wingCorrect: stats.wingCorrect + wingInc,
    };

    setStats(newStats);
    localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    setFeedback(result);
    setGeprueft(true);
  };

  const neueRunde = () => {
    starteNeueRunde();
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "#ead0aa",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Merriweather', serif",
        }}
      >
        Daten werden geladen…
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          backgroundColor: "#ead0aa",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Merriweather', serif",
          color: "crimson",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#ead0aa",
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "'Merriweather', serif",
        color: "#000",
        maxWidth: "100vw",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "0.5rem",
          marginTop: "-1rem",
        }}
      >
        <img
          src={wappen}
          alt="Wappen"
          style={{
            width: "120px",
            height: "auto",
            marginBottom: "0rem",
          }}
        />
      </div>

      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "800",
          textAlign: "center",
          marginTop: "0rem",
          marginBottom: "1rem",
        }}
      >
        Typisierungsübungen
      </h1>

      {/* Level-Schalter */}
      <div className="text-center mb-6 flex justify-center gap-2 flex-wrap">
        {[
          { key: "anfaenger", label: "Anfänger" },
          { key: "fortgeschritten", label: "Fortgeschritten" },
          { key: "expert", label: "Expert" },
        ].map((lvl) => {
          const isActive = level === lvl.key;

          return (
            <LexButton
              key={lvl.key}
              active={isActive}
              onClick={() => setLevel(lvl.key)}
              className={[
                // kompakter als Standard-LexButton
                "px-3 py-1.5 text-sm min-w-0",
                // Active soll einen stärkeren Rahmen haben wie vorher
                isActive
                  ? "border-2 border-black shadow-[0_0_0_2px_rgba(0,0,0,0.3)]"
                  : "border border-black/60",
                // leicht andere Inactive-Farbe als LexButton-Default (wie bei dir #c8a979)
                !isActive
                  ? "bg-[#c8a979] text-black/90 hover:bg-[#d2b089]"
                  : "",
              ].join(" ")}
            >
              {lvl.label}
            </LexButton>
          );
        })}
      </div>

      {/* Stats Toggle + Premium Stats Box */}
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setShowStats((v) => !v)}
          style={{
            backgroundColor: "#c2a178",
            border: "1px solid #000",
            borderRadius: "0.5rem",
            padding: "0.35rem 0.8rem",
            fontWeight: "bold",
            cursor: "pointer",
            color: "#000",
            marginBottom: "0.75rem",
          }}
        >
          {showStats ? "Trefferquote ausblenden" : "Trefferquote anzeigen"}
        </button>

        {showStats && (
          <div
            style={{
              maxWidth: "520px",
              margin: "0 auto",
              backgroundColor: "#c8a979",
              borderRadius: "0.9rem",
              padding: "0.9rem",
              borderTop: "2px solid #8b6b3c",
              borderBottom: "2px solid #8b6b3c",
              boxShadow: "0 3px 8px rgba(0,0,0,0.35)",
              fontSize: "1rem",
            }}
          >
            <div style={{ fontWeight: "800", marginBottom: "0.4rem" }}>
              📈 Trefferquote
            </div>

            <div
              style={{
                backgroundColor: "#f5e6d2",
                padding: "0.6rem",
                borderRadius: "0.6rem",
              }}
            >
              <div>
                <strong>Bilder gesamt:</strong> {stats.imagesTotal}
              </div>

              <div style={{ marginTop: "0.35rem" }}>
                <strong>Typ richtig:</strong>{" "}
                {stats.imagesTotal === 0
                  ? "—"
                  : ((stats.typCorrect / stats.imagesTotal) * 100).toFixed(1) +
                    "%"}
              </div>

              <div style={{ marginTop: "0.2rem" }}>
                <strong>Subtyp richtig:</strong>{" "}
                {stats.subtypTotal === 0
                  ? "—"
                  : ((stats.subtypCorrect / stats.subtypTotal) * 100).toFixed(
                      1
                    ) + "%"}
              </div>

              <div style={{ marginTop: "0.2rem" }}>
                <strong>Wing richtig:</strong>{" "}
                {stats.wingTotal === 0
                  ? "—"
                  : ((stats.wingCorrect / stats.wingTotal) * 100).toFixed(1) +
                    "%"}
              </div>

              <div style={{ marginTop: "0.35rem" }}>
                <strong>Gesamt korrekt:</strong>{" "}
                {stats.imagesTotal === 0
                  ? "—"
                  : ((stats.overallCorrect / stats.imagesTotal) * 100).toFixed(
                      1
                    ) + "%"}
              </div>
            </div>
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          gap: "2rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {rundeBilder.map((bild, index) => {
          const userAntwort = antworten[index] || {};
          const fb = feedback[index];

          const pfad = `${LEXIKON_BASE_URL}/bilder/${
            bild.pfad
          }/${encodeURIComponent(bild.datei)}`;

          return (
            <div
              key={bild.pfad + "-" + bild.datei}
              style={{
                backgroundColor: "#c8a979",
                border: "1px solid #000",
                borderRadius: "1rem",
                padding: "1rem",
                width: "280px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  backgroundColor: "#000",
                  borderRadius: "0.5rem",
                  marginBottom: "0.5rem",
                  overflow: "hidden",
                  width: "100%",
                  height: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={pfad}
                  alt={bild.title}
                  onClick={() =>
                    setVergroessertesBild({ pfad, title: bild.title })
                  }
                  onError={(e) => {
                    const altPfad = e.target.src.endsWith(".jpeg")
                      ? e.target.src.replace(".jpeg", ".jpg")
                      : e.target.src.replace(".jpg", ".jpeg");
                    if (!e.target.dataset.fallbackTried) {
                      e.target.dataset.fallbackTried = "true";
                      e.target.src = altPfad;
                    }
                  }}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    display: "block",
                    cursor: "zoom-in",
                  }}
                />
              </div>

              <div
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                {bild.title}
              </div>

              {/* Typ-Auswahl (immer) */}
              <div style={{ marginBottom: "0.5rem" }}>
                <select
                  value={userAntwort.typ || ""}
                  onChange={(e) => handleAntwort(index, "typ", e.target.value)}
                  style={dropdownStyle}
                >
                  <option value="" disabled hidden>
                    Typ auswählen
                  </option>
                  {typen.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subtyp nur ab Fortgeschritten */}
              {level !== "anfaenger" && (
                <div style={{ marginBottom: "0.5rem" }}>
                  <select
                    value={userAntwort.subtyp || ""}
                    onChange={(e) =>
                      handleAntwort(index, "subtyp", e.target.value)
                    }
                    style={dropdownStyle}
                  >
                    <option value="" disabled hidden>
                      Subtyp auswählen
                    </option>
                    {subtypen.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Wing nur im Expert-Modus, wenn im Pfad vorhanden */}
              {(() => {
                const userTyp = userAntwort.typ
                  ? parseInt(userAntwort.typ, 10)
                  : null;

                return (
                  level === "expert" &&
                  bild.wing != null &&
                  userTyp && (
                    <div style={{ marginBottom: "0.5rem" }}>
                      <select
                        value={userAntwort.wing || ""}
                        onChange={(e) =>
                          handleAntwort(index, "wing", e.target.value)
                        }
                        style={dropdownStyle}
                      >
                        <option value="" disabled hidden>
                          Wing auswählen
                        </option>
                        {getWingsForType(userTyp).map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                );
              })()}

              {/* Merkmale (nicht im Expert-Modus) */}
              {(() => {
                const key = `${bild.subtyp}${bild.typ}`;
                const merkm = merkmale[key];

                if (level === "expert") return null;
                if (!merkm) return null;

                return (
                  <details
                    style={{
                      backgroundColor: "#f5e6d2",
                      padding: "0.75rem",
                      borderRadius: "0.6rem",
                      fontSize: "0.9rem",
                      border: "1px solid #a68b65",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <summary
                      style={{
                        cursor: "pointer",
                        fontWeight: "bold",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Typ-Merkmale einblenden
                    </summary>
                    <div>
                      <strong>Seite des Enneagramms:</strong> {merkm.seite}
                    </div>
                    <div>
                      <strong>Augenausdruck:</strong> {merkm.augenausdruck}
                    </div>
                    <div>
                      <strong>Körperliche Auffälligkeiten:</strong>{" "}
                      {merkm.koerperlich}
                    </div>
                    <div>
                      <strong>Wirkung:</strong> {merkm.wirkung}
                    </div>
                  </details>
                );
              })()}

              {/* Feedback */}
              {geprueft && fb && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    fontWeight: "bold",
                    color: (() => {
                      if (fb.istRichtig) return "green";
                      if (
                        (fb.typRichtig ||
                          fb.subtypRichtig ||
                          fb.wingRichtig) &&
                        level !== "anfaenger"
                      ) {
                        return "#a65e00";
                      }
                      return "crimson";
                    })(),
                    textAlign: "center",
                  }}
                >
                  {(() => {
                    if (level === "anfaenger") {
                      return fb.typRichtig ? "✔️ Typ richtig" : "❌ Typ falsch";
                    }
                    if (fb.istRichtig) return "✔️ Alles korrekt";

                    const teile = [];
                    teile.push(fb.typRichtig ? "Typ ✅" : "Typ ❌");
                    if (level !== "anfaenger") {
                      teile.push(fb.subtypRichtig ? "Subtyp ✅" : "Subtyp ❌");
                    }
                    if (level === "expert" && bild.wing != null) {
                      teile.push(fb.wingRichtig ? "Wing ✅" : "Wing ❌");
                    }
                    return teile.join(" · ");
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Buttons unten */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        {!geprueft ? (
          <button
            onClick={pruefeAntworten}
            style={{
              backgroundColor: "#c2a178",
              border: "2px solid #000",
              borderRadius: "0.5rem",
              padding: "0.75rem 1.5rem",
              fontWeight: "bold",
              cursor: "pointer",
              color: "#000",
            }}
          >
            Antwort überprüfen
          </button>
        ) : (
          <button
            onClick={neueRunde}
            style={{
              backgroundColor: "#c2a178",
              border: "2px solid #000",
              borderRadius: "0.5rem",
              padding: "0.75rem 1.5rem",
              fontWeight: "bold",
              cursor: "pointer",
              color: "#000",
            }}
          >
            Nächste Runde
          </button>
        )}
      </div>

      {/* Overlay für Vergrößerung */}
      {vergroessertesBild && (
        <div
          onClick={() => setVergroessertesBild(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            cursor: "zoom-out",
            padding: "1rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "90vw",
              maxWidth: "600px",
              height: "80vh",
              maxHeight: "800px",
              backgroundColor: "#c8a979",
              borderRadius: "1rem",
              padding: "1rem",
              boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setVergroessertesBild(null);
              }}
              style={{
                position: "absolute",
                top: "0.5rem",
                right: "0.5rem",
                background: "rgba(0, 0, 0, 0.6)",
                border: "none",
                borderRadius: "999px",
                width: "32px",
                height: "32px",
                color: "#f5e6d2",
                fontSize: "1.2rem",
                fontWeight: "bold",
                cursor: "pointer",
                lineHeight: "1",
              }}
              aria-label="Schließen"
            >
              ×
            </button>

            <img
              src={vergroessertesBild.pfad}
              alt={vergroessertesBild.title}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                objectPosition: "center",
                display: "block",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
