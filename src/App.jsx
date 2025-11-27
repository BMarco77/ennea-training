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
  // schlankere Höhe, aber immer noch gut klickbar
  padding: "0.3rem 0.75rem",
  minHeight: "2.3rem", // ~36–37px
  borderRadius: "0.7rem",
  border: "1.5px solid black",
  backgroundColor: "#f5e6d2",
  fontFamily: "inherit",
  fontSize: "0.95rem",
  color: "#111",
  boxSizing: "border-box",
  cursor: "pointer",
  lineHeight: "1.2",

  // native Pfeile ausblenden
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",

  // eigener Pfeil etwas kleiner & näher am Rand
  backgroundImage:
    "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.7rem center",
  backgroundSize: "14px",
};

function parseBildInfo(pfad) {
  const typMatch = pfad.match(/\d+/);
  const wingMatch = pfad.match(/w(\d)/i);
  return {
    typ: typMatch ? parseInt(typMatch[0], 10) : null,
    subtyp: pfad.slice(0, 2),
    wing: wingMatch ? parseInt(wingMatch[1], 10) : null,
  };
}

// --- Ausgewogene Ziehlogik (40 / 40 / 20) ---
function zieheAusgewogenesBild(
  weiblich,
  maennlich,
  neutral,
  gesehen,
  verboteneTypen = []
) {
  const w = 0.4;
  const m = 0.4;
  const n = 0.2;

  const r = Math.random();
  let pool = r < w ? weiblich : r < w + m ? maennlich : neutral;

  // nur Bilder, die noch nicht gesehen wurden
  let unge = pool.filter((b) => !gesehen.includes(b.datei));
  if (unge.length === 0) unge = [...pool];

  // versuche, Typen zu vermeiden, die schon in der Runde sind
  const gefiltert = unge.filter(
    (b) => b.typ != null && !verboteneTypen.includes(b.typ)
  );

  if (gefiltert.length > 0) {
    unge = gefiltert;
  }

  return unge[Math.floor(Math.random() * unge.length)];
}

export default function QuizModul() {
  const [alleBilder, setAlleBilder] = useState([]);
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

  const [level, setLevel] = useState("fortgeschritten");
  const [isFading, setIsFading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState({});

  // --- Trefferquote / Stats ---
  const [showStats, setShowStats] = useState(false);
  const emptyStats = {
    imagesTotal: 0,
    overallCorrect: 0,
    typCorrect: 0,
    subtypTotal: 0,
    subtypCorrect: 0,
    wingTotal: 0,
    wingCorrect: 0,
  };

  const [stats, setStats] = useState({
    overall: { ...emptyStats },
    anfaenger: { ...emptyStats },
    fortgeschritten: { ...emptyStats },
    expert: { ...emptyStats },
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STATS_KEY));

    if (saved) {
      // Falls alte Struktur gefunden wird (ohne overall/anfaenger/...)
      const isOld =
        saved.imagesTotal !== undefined && saved.overall === undefined;

      if (isOld) {
        const migrated = {
          overall: { ...emptyStats, ...saved },
          anfaenger: { ...emptyStats },
          fortgeschritten: { ...emptyStats },
          expert: { ...emptyStats },
        };
        setStats(migrated);
        localStorage.setItem(STATS_KEY, JSON.stringify(migrated));
      } else {
        setStats(saved);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickNaechsteBilder(
    pool = alleBilder,
    weiblichArg = weiblichPool,
    maennlichArg = maennlichPool,
    neutralArg = neutralPool
  ) {
    if (!pool || pool.length === 0) return [];

    const gesehen = ladeGeseheneBilder();

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

    return [bild1, bild2];
  }

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
      [...gesehen, bild1.datei],
      [bild1.typ] // diesen Typ wenn möglich vermeiden
    );

    const neue = pickNaechsteBilder(
      pool,
      weiblichArg,
      maennlichArg,
      neutralArg
    );

    setImgLoaded({}); // reset, neue Bilder müssen erst laden
    setRundeBilder(neue);
    setAntworten({});
    setFeedback({});
    setGeprueft(false);

    speichereGezeigteBilder(neue.map((b) => b.datei));
  };

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

        const weiblich = enriched.filter((b) => b.typ >= 1 && b.typ <= 4);
        const maennlich = enriched.filter((b) => b.typ >= 5 && b.typ <= 8);
        const neutral = enriched.filter((b) => b.typ === 9);

        setWeiblichPool(weiblich);
        setMaennlichPool(maennlich);
        setNeutralPool(neutral);

        setAlleBilder(enriched);
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
      if (level === "anfaenger") istRichtig = typRichtig;
      else if (level === "fortgeschritten")
        istRichtig = typRichtig && subtypRichtig;
      else if (level === "expert")
        istRichtig = typRichtig && subtypRichtig && wingRichtig;

      result[index] = { typRichtig, subtypRichtig, wingRichtig, istRichtig };
    });

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

    const levelKey = level; // "anfaenger" | "fortgeschritten" | "expert"

    const nextOverall = {
      imagesTotal: stats.overall.imagesTotal + rundeBilder.length,
      overallCorrect: stats.overall.overallCorrect + overallInc,
      typCorrect: stats.overall.typCorrect + typInc,
      subtypTotal: stats.overall.subtypTotal + subtypTotalInc,
      subtypCorrect: stats.overall.subtypCorrect + subtypInc,
      wingTotal: stats.overall.wingTotal + wingTotalInc,
      wingCorrect: stats.overall.wingCorrect + wingInc,
    };

    const prevLevelStats = stats[levelKey] || { ...emptyStats };

    const nextLevel = {
      imagesTotal: prevLevelStats.imagesTotal + rundeBilder.length,
      overallCorrect: prevLevelStats.overallCorrect + overallInc,
      typCorrect: prevLevelStats.typCorrect + typInc,
      subtypTotal: prevLevelStats.subtypTotal + subtypTotalInc,
      subtypCorrect: prevLevelStats.subtypCorrect + subtypInc,
      wingTotal: prevLevelStats.wingTotal + wingTotalInc,
      wingCorrect: prevLevelStats.wingCorrect + wingInc,
    };

    const newStats = {
      ...stats,
      overall: nextOverall,
      [levelKey]: nextLevel,
    };

    setStats(newStats);
    localStorage.setItem(STATS_KEY, JSON.stringify(newStats));

    setFeedback(result);
    setGeprueft(true);
  };
  function preloadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve; // auch bei Fehler nicht hängen bleiben
      img.src = src;
    });
  }

  const neueRunde = async () => {
    const neue = pickNaechsteBilder();

    const srcs = neue.map((bild) => {
      return `${LEXIKON_BASE_URL}/bilder/${bild.pfad}/${encodeURIComponent(
        bild.datei
      )}`;
    });

    const preloadPromise = Promise.all(srcs.map(preloadImage));

    // wie lange wir maximal "sauber" preloaden wollen (ms)
    const MAX_WAIT = 300;

    const fullyPreloaded = await Promise.race([
      preloadPromise.then(() => true).catch(() => true),
      new Promise((resolve) => setTimeout(() => resolve(false), MAX_WAIT)),
    ]);

    // Jetzt erst den Fade + Swap machen
    setIsFading(true);

    setTimeout(() => {
      if (fullyPreloaded) {
        // Bilder sind schon im Cache -> wir können sie direkt als "geladen" markieren
        setImgLoaded({ 0: true, 1: true });
      } else {
        // nicht fertig preload -> normaler Weg mit Placeholder
        setImgLoaded({});
        // Preload läuft im Hintergrund weiter
        preloadPromise.catch(() => {});
      }

      setRundeBilder(neue);
      setAntworten({});
      setFeedback({});
      setGeprueft(false);
      speichereGezeigteBilder(neue.map((b) => b.datei));

      setIsFading(false);
    }, 150); // passt zu deiner duration-150
  };

  // ⬇️ GENAU HIER REIN
  function StatBar({ label, value }) {
    const percent = Math.round(value);

    return (
      <div className="flex items-center gap-4 w-full">
        <div className="w-44 text-right font-semibold">{label}</div>
        <div className="flex-1 h-[11px] bg-[#e8dcc8] rounded-full relative overflow-hidden">
          <div
            className="h-full bg-[#8b6b3c] transition-all duration-500"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
        <div className="w-12 text-right font-bold text-sm">{percent}%</div>
      </div>
    );
  }
  const levelStats = stats[level] || emptyStats;
  const isNovize = level === "anfaenger";
  const isProfi = level === "fortgeschritten";

  // ⬆️ BIS HIER

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ead0aa] font-lexSerif">
        Daten werden geladen…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ead0aa] font-lexSerif text-crimson">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ead0aa] text-black font-lexSerif px-4 py-8 overflow-x-hidden">
      {/* Header / Wappen */}
      <div className="text-center -mt-1 mb-1 md:mb-2">
        <img
          src={wappen}
          alt="Wappen"
          className="mx-auto block mb-4 max-w-[120px] h-auto"
        />

        <h1 className="font-lexSerif text-3xl md:text-5xl font-bold text-black text-center">
          Typisierungsübungen
        </h1>

        {/* Trennlinie unter der Überschrift */}
        <div className="flex items-center justify-center gap-3 my-6">
          <span className="flex-1 max-w-[200px] h-px bg-black"></span>
          <span className="text-[1.4rem] text-black">❦</span>
          <span className="flex-1 max-w-[200px] h-px bg-black"></span>
        </div>

        {/* Level-Schalter */}
        <div className="flex justify-center gap-3 md:gap-4 flex-wrap mt-2 mb-5">
          {[
            { key: "anfaenger", label: "Novize" },
            { key: "fortgeschritten", label: "Profi" },
            { key: "expert", label: "Experte" },
          ].map((lvl) => {
            const isActive = level === lvl.key;
            return (
              <LexButton
                key={lvl.key}
                active={isActive}
                onClick={() => setLevel(lvl.key)}
                className={[
                  "px-4 py-2 text-sm w-[132px] md:w-[150px] transition-all duration-150",
                  isActive
                    ? "border-2 border-black bg-[#f5e6d2] shadow-[0_0_0_2px_rgba(0,0,0,0.3)]"
                    : "border border-black/60 bg-[#c8a979] text-black/90 hover:bg-[#d2b089]",
                ].join(" ")}
              >
                {lvl.label}
              </LexButton>
            );
          })}
        </div>

        {/* Stats Toggle */}
        <LexButton
          onClick={() => setShowStats((v) => !v)}
          className={[
            "mt-2 px-4 py-2 text-sm min-w-0",
            showStats
              ? "bg-[#f5e6d2] border-2 border-black shadow-[inset_0_1px_2px_rgba(0,0,0,0.12),0_1px_0_rgba(255,255,255,0.5)]"
              : "border border-black/60 bg-[#c8a979] text-black/90 hover:bg-[#d2b089]",
          ].join(" ")}
        >
          {showStats ? "Trefferquote ausblenden" : "Trefferquote anzeigen"}
        </LexButton>

        {/* Stats Box */}
        {showStats && (
          <div className="mt-4 mx-auto max-w-[480px] bg-[#c8a979] rounded-2xl p-2 border-[1.5px] border-black shadow-[0_3px_8px_rgba(0,0,0,0.35)] text-base text-black">
            <div className="font-extrabold text-lg mb-2 tracking-wide">
              📈 Trefferquote
            </div>

            <div className="bg-[#f5e6d2] p-2.5 rounded-xl flex flex-col gap-2 border border-black/30">
              {/* Bilder gesamt auf aktuellem Level */}
              <div className="text-sm font-semibold">
                Bilder gesamt (Level): {levelStats.imagesTotal}
              </div>

              {/* NOVIZE: nur Typ + Gesamt */}
              {isNovize && (
                <>
                  <StatBar
                    label="Typ richtig"
                    value={
                      levelStats.imagesTotal
                        ? (levelStats.typCorrect / levelStats.imagesTotal) * 100
                        : 0
                    }
                  />

                  <StatBar
                    label="Gesamt korrekt"
                    value={
                      levelStats.imagesTotal
                        ? (levelStats.overallCorrect / levelStats.imagesTotal) *
                          100
                        : 0
                    }
                  />
                </>
              )}

              {/* PROFI: Typ + Subtyp + Gesamt */}
              {isProfi && (
                <>
                  <StatBar
                    label="Typ richtig"
                    value={
                      levelStats.imagesTotal
                        ? (levelStats.typCorrect / levelStats.imagesTotal) * 100
                        : 0
                    }
                  />

                  <StatBar
                    label="Subtyp richtig"
                    value={
                      levelStats.subtypTotal
                        ? (levelStats.subtypCorrect / levelStats.subtypTotal) *
                          100
                        : 0
                    }
                  />

                  <StatBar
                    label="Gesamt korrekt"
                    value={
                      levelStats.imagesTotal
                        ? (levelStats.overallCorrect / levelStats.imagesTotal) *
                          100
                        : 0
                    }
                  />
                </>
              )}

              {/* EXPERTE: Typ + Subtyp + Wing + Gesamt */}
              {!isNovize && !isProfi && (
                <>
                  <StatBar
                    label="Typ richtig"
                    value={
                      levelStats.imagesTotal
                        ? (levelStats.typCorrect / levelStats.imagesTotal) * 100
                        : 0
                    }
                  />

                  <StatBar
                    label="Subtyp richtig"
                    value={
                      levelStats.subtypTotal
                        ? (levelStats.subtypCorrect / levelStats.subtypTotal) *
                          100
                        : 0
                    }
                  />

                  <StatBar
                    label="Wing richtig"
                    value={
                      levelStats.wingTotal
                        ? (levelStats.wingCorrect / levelStats.wingTotal) * 100
                        : 0
                    }
                  />

                  <StatBar
                    label="Gesamt korrekt"
                    value={
                      levelStats.imagesTotal
                        ? (levelStats.overallCorrect / levelStats.imagesTotal) *
                          100
                        : 0
                    }
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Karten */}
      <div
        className={[
          "flex gap-8 flex-wrap justify-center mt-6 transition-opacity duration-150 ease-in-out",
          isFading ? "opacity-0 pointer-events-none" : "opacity-100",
        ].join(" ")}
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
              className="bg-[#c8a979] border border-black rounded-2xl p-3.5 md:p-4 w-full max-w-[320px] shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
            >
              <div className="bg-black rounded-lg mb-1.5 overflow-hidden w-full h-[240px] flex items-center justify-center relative">
                {/* Platzhalter solange Bild nicht geladen ist */}
                {!imgLoaded[index] && (
                  <div className="absolute inset-0 flex items-center justify-center text-[#f5e6d2] text-sm tracking-wide">
                    Bild lädt…
                  </div>
                )}

                <img
                  src={pfad}
                  alt={bild.title}
                  onLoad={() =>
                    setImgLoaded((prev) => ({ ...prev, [index]: true }))
                  }
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
                  className={[
                    "max-w-full max-h-full object-contain block cursor-zoom-in transition-opacity duration-150",
                    imgLoaded[index] ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                />
              </div>

              <div className="text-center font-semibold text-base md:text-lg mb-1.5 leading-tight whitespace-normal break-words">
                {bild.title}
              </div>

              {/* Typ-Auswahl */}
              <div className="mb-1 md:mb-1.5">
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
                <div className="mb-1 md:mb-1.5">
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

              {/* Wing nur im Expert-Modus */}
              {(() => {
                const userTyp = userAntwort.typ
                  ? parseInt(userAntwort.typ, 10)
                  : null;

                return (
                  level === "expert" &&
                  bild.wing != null &&
                  userTyp && (
                    <div className="mb-1 md:mb-1.5">
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

              {/* Merkmale (außer Expert) */}
              {(() => {
                const key = `${bild.subtyp}${bild.typ}`;
                const merkm = merkmale[key];

                if (level === "expert") return null;
                if (!merkm) return null;

                return (
                  <details className="mb-1">
                    <summary
                      className="
    cursor-pointer font-semibold text-[0.95rem]
    flex items-center h-[42px] md:h-[36px] px-3
    rounded-[0.7rem] border-[1.5px] border-black
    bg-[#f5e6d2] text-[#111]
    shadow-[inset_0_1px_2px_rgba(0,0,0,0.12),0_1px_0_rgba(255,255,255,0.5)]
    select-none list-none
    [&::-webkit-details-marker]:hidden
  "
                    >
                      ▶ Typ-Merkmale einblenden
                    </summary>

                    <div className="mt-2 bg-[#f5e6d2] p-3 rounded-xl text-sm border border-[#a68b65] shadow-sm space-y-1">
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
                    </div>
                  </details>
                );
              })()}

              {/* Feedback */}
              {geprueft && fb && (
                <div
                  className="mt-2 font-bold text-center"
                  style={{
                    color: (() => {
                      if (fb.istRichtig) return "green";
                      if (
                        (fb.typRichtig || fb.subtypRichtig || fb.wingRichtig) &&
                        level !== "anfaenger"
                      ) {
                        return "#a65e00";
                      }
                      return "crimson";
                    })(),
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
      <div className="text-center mt-8">
        {!geprueft ? (
          <LexButton onClick={pruefeAntworten} className="px-6 py-3 text-base">
            Antwort überprüfen
          </LexButton>
        ) : (
          <LexButton onClick={neueRunde} className="px-6 py-3 text-base">
            Nächste Runde
          </LexButton>
        )}
      </div>

      {/* Overlay für Vergrößerung */}
      {vergroessertesBild && (
        <div
          onClick={() => setVergroessertesBild(null)}
          className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] cursor-zoom-out p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-[90vw] max-w-[600px] h-[80vh] max-h-[800px] bg-[#c8a979] rounded-2xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setVergroessertesBild(null);
              }}
              className="absolute top-2 right-2 bg-black/60 text-[#f5e6d2] w-8 h-8 rounded-full font-bold text-xl leading-none flex items-center justify-center cursor-pointer"
              aria-label="Schließen"
            >
              ×
            </button>

            <img
              src={vergroessertesBild.pfad}
              alt={vergroessertesBild.title}
              className="w-full h-full object-contain object-center block"
            />
          </div>
        </div>
      )}
    </div>
  );
}
