import { useEffect, useState } from "react";
import wappen from "./assets/wappen.png";
import merkmale from "./data/merkmale.json";

const LOCALSTORAGE_KEY = "geseheneBilder";

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

export default function QuizModul() {
  const [alleBilder, setAlleBilder] = useState([]); // kompletter Pool aus JSON
  const [rundeBilder, setRundeBilder] = useState([]);
  const [antworten, setAntworten] = useState({});
  const [feedback, setFeedback] = useState({});
  const [geprueft, setGeprueft] = useState(false);
  const [vergroessertesBild, setVergroessertesBild] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Level: anfaenger | fortgeschritten | expert
  const [level, setLevel] = useState("fortgeschritten");

  // JSON vom Lexikon laden
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(QUIZ_BILDER_URL);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        const bilder = data.bilder || [];
        // mit geparsten Infos anreichern
        const enriched = bilder.map((bild) => ({
          ...bild,
          ...parseBildInfo(bild.pfad),
        }));
        setAlleBilder(enriched);
        // erste Runde setzen
        starteNeueRunde(enriched);
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

  const starteNeueRunde = (pool = alleBilder) => {
    if (!pool || pool.length === 0) {
      setRundeBilder([]);
      return;
    }

    const gesehen = ladeGeseheneBilder();
    let nochNichtGesehen = pool.filter((bild) => !gesehen.includes(bild.datei));

    // Wenn zu wenige übrig sind, reset und wieder von vorn
    if (nochNichtGesehen.length < 2) {
      resetGezeigteBilder();
      nochNichtGesehen = [...pool];
    }

    const neue = [...nochNichtGesehen]
      .sort(() => 0.5 - Math.random())
      .slice(0, 2) // <<< NUR 2 BILDER
      .map((bild) => ({
        ...bild,
      }));

    setRundeBilder(neue);
    setAntworten({});
    setFeedback({});
    setGeprueft(false);

    speichereGezeigteBilder(neue.map((b) => b.datei));
  };

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
      <div
        style={{
          textAlign: "center",
          marginBottom: "1.5rem",
        }}
      >
        {[
          { key: "anfaenger", label: "Anfänger" },
          { key: "fortgeschritten", label: "Fortgeschritten" },
          { key: "expert", label: "Expert" },
        ].map((lvl) => (
       <button
  key={lvl.key}
  onClick={() => setLevel(lvl.key)}
  style={{
    marginRight: "0.5rem",
    padding: "0.4rem 0.8rem",
    borderRadius: "0.5rem",
    border: level === lvl.key ? "2px solid #000" : "1px solid #555",
    backgroundColor: level === lvl.key ? "#c2a178" : "#c8a979",
    color: level === lvl.key ? "#000" : "#222",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: level === lvl.key
      ? "0 0 0 2px rgba(0,0,0,0.3)"
      : "none",
  }}
>
  {lvl.label}
</button>
        ))}
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

          // Bild-URL vom Lexikon
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
  const userTyp = userAntwort.typ ? parseInt(userAntwort.typ, 10) : null;

  return (
    level === "expert" &&
    bild.wing != null &&
    userTyp && ( // Wing-Dropdown nur, wenn Typ gewählt wurde
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
              {/* Merkmale */}
              {(() => {
                const key = `${bild.subtyp}${bild.typ}`; // z.B. "Se4"
                const merkm = merkmale[key];

                return (
                  merkm && (
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
                  )
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

                      // Teilrichtig einfärben in Fortgeschritten/Expert
                      if (
                        (fb.typRichtig || fb.subtypRichtig || fb.wingRichtig) &&
                        level !== "anfaenger"
                      ) {
                        return "#a65e00"; // orange
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

                    // Fortgeschritten / Expert differenziert
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
              width: "600px",
              height: "800px",
              backgroundColor: "#c8a979",
              borderRadius: "1rem",
              padding: "1rem",
              boxShadow: "0 0 20px rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
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
