
import {
  parseBildInfo,
  getWingsForType,
  zieheAusgewogenesBild,
  pruefeRunde,
  berechneNeueStats,
  pickNaechsteBilder,
} from "./utils/quizLogic";

import { useEffect, useState } from "react";
import wappen from "./assets/wappen.png";
import merkmale from "./data/merkmale.json";
import LexButton from "./components/LexButton.jsx";

const LOCALSTORAGE_KEY = "geseheneBilder";
const STATS_KEY = "ennea_quiz_stats";

const LEXIKON_BASE_URL = "https://ennea-lexikon.netlify.app";
const QUIZ_BILDER_URL = `${LEXIKON_BASE_URL}/bilder.json`;

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

const dropdownStyle = {
  width: "100%",
  padding: "0.3rem 0.75rem",
  minHeight: "2.3rem",
  borderRadius: "0.7rem",
  border: "1.5px solid black",
  backgroundColor: "#f5e6d2",
  fontFamily: "inherit",
  fontSize: "0.95rem",
  color: "#111",
  boxSizing: "border-box",
  cursor: "pointer",
  lineHeight: "1.2",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.7rem center",
  backgroundSize: "14px",
};

export default function QuizModul() {
  const [alleBilder, setAlleBilder] = useState([]);
  const [weiblichPool, setWeiblichPool] = useState([]);
  const [maennlichPool, setMaennlichPool] = useState([]);
  const [neutralPool, setNeutralPool] = useState([]);

  const [rundeBilder, setRundeBilder] = useState([]);
  const [antworten, setAntworten] = useState({});
  const [feedback, setFeedback] = useState({});
  const [geprueft, setGeprueft] = useState(false);
  const [zeigeMerkmale, setZeigeMerkmale] = useState({});
  const [vergroessertesBild, setVergroessertesBild] = useState(null);
  const [mode, setMode] = useState("single");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [level, setLevel] = useState("fortgeschritten");
  const [isFading, setIsFading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState({});

  const [timer, setTimer] = useState(10);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
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

    const nochNichtGesehen = pool.filter(
      (bild) => !gesehen.includes(bild.datei)
    );

    if (nochNichtGesehen.length < 2) {
      resetGezeigteBilder();
    }

    const neue = pickNaechsteBilder(
      pool,
      weiblichArg,
      maennlichArg,
      neutralArg,
      ladeGeseheneBilder(),
      mode
    );

    setImgLoaded({});
    setRundeBilder(neue);
    setAntworten({});
    setFeedback({});
    setGeprueft(false);
    setZeigeMerkmale({});

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

  useEffect(() => {
    if (alleBilder.length > 0) {
      starteNeueRunde();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
  if (!isTimerActive) return;

  if (timer <= 0) {
    setIsTimeUp(true);
    setIsTimerActive(false);
    return;
  }

  const interval = setInterval(() => {
    setTimer((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [isTimerActive, timer]);
  const handleAntwort = (index, field, value) => {
    setAntworten((prev) => ({
      ...prev,
      [index]: { ...prev[index], [field]: value },
    }));
  };

  const pruefeAntworten = () => {
    const {
      result,
      counters: {
        overallInc,
        typInc,
        subtypInc,
        wingInc,
        subtypTotalInc,
        wingTotalInc,
      },
    } = pruefeRunde(rundeBilder, antworten, level);

    const newStats = berechneNeueStats(
      stats,
      level,
      rundeBilder,
      {
        overallInc,
        typInc,
        subtypInc,
        wingInc,
        subtypTotalInc,
        wingTotalInc,
      },
      emptyStats
    );

    setStats(newStats);
    localStorage.setItem(STATS_KEY, JSON.stringify(newStats));

    setFeedback(result);
    setGeprueft(true);
  };

  function preloadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
    });
  }

  const neueRunde = async () => {
    const gesehen = ladeGeseheneBilder();

    const nochNichtGesehen = alleBilder.filter(
      (bild) => !gesehen.includes(bild.datei)
    );

    if (nochNichtGesehen.length < 2) {
      resetGezeigteBilder();
    }

    const neue = pickNaechsteBilder(
      alleBilder,
      weiblichPool,
      maennlichPool,
      neutralPool,
      ladeGeseheneBilder(),
      mode
    );

    const srcs = neue.map((bild) => {
      return `${LEXIKON_BASE_URL}/bilder/${bild.pfad}/${encodeURIComponent(
        bild.datei
      )}`;
    });

    const preloadPromise = Promise.all(srcs.map(preloadImage));
    const MAX_WAIT = 300;

    const fullyPreloaded = await Promise.race([
      preloadPromise.then(() => true).catch(() => true),
      new Promise((resolve) => setTimeout(() => resolve(false), MAX_WAIT)),
    ]);

    setIsFading(true);

    setTimeout(() => {
      if (fullyPreloaded) {
        setImgLoaded({ 0: true, 1: true });
      } else {
        setImgLoaded({});
        preloadPromise.catch(() => {});
      }

      setRundeBilder(neue);
      setAntworten({});
      setFeedback({});
      setGeprueft(false);
      setZeigeMerkmale({});
      setTimer(10);
      setIsTimeUp(false);
      setIsTimerActive(false);      
      speichereGezeigteBilder(neue.map((b) => b.datei));

      setIsFading(false);
    }, 150);
  };

    const skipRunde = () => {
    const gesehen = ladeGeseheneBilder();
    const aktuelle = rundeBilder.map((b) => b.datei);
    const neuGefiltert = gesehen.filter((name) => !aktuelle.includes(name));

    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(neuGefiltert));

    neueRunde();
  };

    const skipEinzelBild = (indexToSkip) => {
    if (!rundeBilder[indexToSkip]) return;

    const aktuellesBild = rundeBilder[indexToSkip];

    const andereBilder = rundeBilder.filter((_, i) => i !== indexToSkip);

    const verboteneTypen = andereBilder
      .map((bild) => bild.typ)
      .filter((typ) => typ != null);

    let gesehen = ladeGeseheneBilder();

    gesehen = gesehen.filter((name) => name !== aktuellesBild.datei);

    const verboteneDateien = andereBilder.map((bild) => bild.datei);
    gesehen = [...new Set([...gesehen, ...verboteneDateien])];

    const neuesBild = zieheAusgewogenesBild(
      weiblichPool,
      maennlichPool,
      neutralPool,
      gesehen,
      verboteneTypen
    );

    if (!neuesBild) return;

    setRundeBilder((prev) => {
      const updated = [...prev];
      updated[indexToSkip] = neuesBild;
      return updated;
    });

    setAntworten((prev) => {
      const updated = { ...prev };
      delete updated[indexToSkip];
      return updated;
    });

    setFeedback((prev) => {
      const updated = { ...prev };
      delete updated[indexToSkip];
      return updated;
    });

    setImgLoaded((prev) => ({
      ...prev,
      [indexToSkip]: false,
    }));

    speichereGezeigteBilder([neuesBild.datei]);
  };

    const resetCurrentLevel = () => {
    if (!window.confirm(`Statistiken für "${level}" wirklich zurücksetzen?`)) {
      return;
    }

    const reset = {
      ...stats,
      [level]: { ...emptyStats },
    };

    setStats(reset);
    localStorage.setItem(STATS_KEY, JSON.stringify(reset));
  };

    const resetAllStats = () => {
    if (
      !window.confirm(
        "Wirklich ALLE Statistiken löschen? Das kann nicht rückgängig gemacht werden."
      )
    ) {
      return;
    }

    const reset = {
      overall: { ...emptyStats },
      anfaenger: { ...emptyStats },
      fortgeschritten: { ...emptyStats },
      expert: { ...emptyStats },
    };

    setStats(reset);
    localStorage.setItem(STATS_KEY, JSON.stringify(reset));
  };

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
      <div className="text-center -mt-1 mb-1 md:mb-2">
        <img
          src={wappen}
          alt="Wappen"
          className="mx-auto block mb-4 max-w-[120px] h-auto"
        />

        <h1 className="font-lexSerif text-3xl md:text-5xl font-bold text-black text-center">
          Typisierungsübungen
        </h1>

        <div className="flex items-center justify-center gap-3 my-6">
          <span className="flex-1 max-w-[200px] h-px bg-black"></span>
          <span className="text-[1.4rem] text-black">❦</span>
          <span className="flex-1 max-w-[200px] h-px bg-black"></span>
        </div>

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
                onClick={() => {
                  setLevel(lvl.key);
                  setAntworten({});
                  setFeedback({});
                  setGeprueft(false);
                  setZeigeMerkmale({});
                  setTimer(10);
                  setIsTimeUp(false);
                  setIsTimerActive(false);                  
                  starteNeueRunde();
                }}
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

        {/* Modus-Schalter */}
{mode !== "quickguess" ? (
  <div className="flex justify-center gap-3 mb-5 flex-wrap">
    <LexButton
      active={mode === "compare"}
      onClick={() => setMode("compare")}
      className={[
        "px-4 py-2 text-sm w-[132px] md:w-[150px]",
        mode === "compare"
          ? "border-2 border-black bg-[#f5e6d2]"
          : "border border-black/60 bg-[#c8a979] hover:bg-[#d2b089]",
      ].join(" ")}
    >
      Vergleich
    </LexButton>

    <LexButton
      active={mode === "single"}
      onClick={() => setMode("single")}
      className={[
        "px-4 py-2 text-sm w-[132px] md:w-[150px]",
        mode === "single"
          ? "border-2 border-black bg-[#f5e6d2]"
          : "border border-black/60 bg-[#c8a979] hover:bg-[#d2b089]",
      ].join(" ")}
    >
      Einzelbild
    </LexButton>

    <LexButton
      active={mode === "quickguess"}
      onClick={() => setMode("quickguess")}
      className="px-5 py-2 text-sm w-[160px] border-2 border-black bg-[#c8a979] hover:bg-[#d2b089]"
    >
      Quickguess
    </LexButton>
  </div>
) : (
  <div className="flex flex-col items-center gap-3 mb-5">
    <div className="px-6 py-2 rounded-xl border-2 border-black bg-[#f5e6d2] font-bold shadow-[0_3px_8px_rgba(0,0,0,0.25)]">
      ⚡ Quickguess aktiv
    </div>

    <button
      onClick={() => setMode("single")}
      className="text-sm text-black/60 hover:text-black underline"
    >
      Zurück zum normalen Modus
    </button>
  </div>
)}
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

        {showStats && (
          <div className="mt-4 mx-auto max-w-[480px] bg-[#c8a979] rounded-2xl p-2 border-[1.5px] border-black shadow-[0_3px_8px_rgba(0,0,0,0.35)] text-base text-black">
            <div className="font-extrabold text-lg mb-2 tracking-wide">
              📈 Trefferquote
            </div>

            <div className="bg-[#f5e6d2] p-2.5 rounded-xl flex flex-col gap-2 border border-black/30">
              <div className="text-sm font-semibold">
                Bilder gesamt (Level): {levelStats.imagesTotal}
              </div>

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

            <div className="mt-4 flex flex-col items-center gap-2">
              <LexButton
                onClick={resetCurrentLevel}
                className="px-4 py-2 text-sm border border-black/60 bg-[#c8a979] hover:bg-[#d2b089]"
              >
                Aktuelles Level zurücksetzen
              </LexButton>

              <button
                onClick={resetAllStats}
                className="text-[0.8rem] text-black/60 hover:text-black underline"
              >
                Alle Statistiken löschen
              </button>
            </div>
          </div>
        )}
      </div>

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
  {!imgLoaded[index] && (
    <div className="absolute inset-0 flex items-center justify-center text-[#f5e6d2] text-sm tracking-wide">
      Bild lädt…
    </div>
  )}

  <img
    src={pfad}
    alt={bild.title}
    onLoad={() => {
      setImgLoaded((prev) => ({ ...prev, [index]: true }));

      if (mode === "quickguess") {
        setTimer(10);
        setIsTimeUp(false);
        setIsTimerActive(true);
      }
    }}
    onClick={() => setVergroessertesBild({ pfad, title: bild.title })}
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

  {mode === "quickguess" && isTimeUp && (
    <div className="absolute inset-0 bg-black flex items-center justify-center text-white text-sm">
      Zeit abgelaufen
    </div>
  )}
</div>

              <div className="text-center font-semibold text-base md:text-lg mb-1.5 leading-tight whitespace-normal break-words">
                {bild.title}
              </div>

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

              {(() => {
                const key = `${bild.subtyp}${bild.typ}`;
                const merkm = merkmale[key];

                if (!merkm) return null;
                if (level === "expert") return null;

                if (level === "fortgeschritten") {
                  if (!geprueft) return null;

                  const sichtbar = zeigeMerkmale[index];

                  return (
                    <div className="mb-1">
                      {!sichtbar ? (
                        <button
                          onClick={() =>
                            setZeigeMerkmale((prev) => ({
                              ...prev,
                              [index]: true,
                            }))
                          }
                          className="w-full text-left text-sm font-semibold px-3 py-2 rounded-[0.7rem] border border-black/60 bg-[#f5e6d2]"
                        >
                          ▶ Typ-Merkmale anzeigen
                        </button>
                      ) : (
                        <div className="mt-2 bg-[#f5e6d2] p-3 rounded-xl text-sm border border-[#a68b65] shadow-sm space-y-1">
                          <div>
                            <strong>Seite des Enneagramms:</strong>{" "}
                            {merkm.seite}
                          </div>
                          <div>
                            <strong>Augenausdruck:</strong>{" "}
                            {merkm.augenausdruck}
                          </div>
                          <div>
                            <strong>Körperliche Auffälligkeiten:</strong>{" "}
                            {merkm.koerperlich}
                          </div>
                          <div>
                            <strong>Wirkung:</strong> {merkm.wirkung}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <details className="mb-1">
                    <summary className="cursor-pointer font-semibold text-[0.95rem] flex items-center h-[42px] md:h-[36px] px-3 rounded-[0.7rem] border-[1.5px] border-black bg-[#f5e6d2] text-[#111] shadow-[inset_0_1px_2px_rgba(0,0,0,0.12),0_1px_0_rgba(255,255,255,0.5)] select-none list-none [&::-webkit-details-marker]:hidden">
                      ▶ Typ-Merkmale einblenden
                    </summary>

                    <div className="mt-2 bg-[#f5e6d2] p-3 rounded-xl text-sm border border-[#a68b65] shadow-sm space-y-1">
                      <div>
                        <strong>Seite des Enneagramms:</strong> {merkm.seite}
                      </div>
                      <div>
                        <strong>Augenausdruck:</strong>{" "}
                        {merkm.augenausdruck}
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

              {geprueft && fb && (
                <div
                  className="mt-2 font-bold text-center"
                  style={{
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
                  }}
                >
                  {level === "anfaenger" ? (
                    fb.typRichtig ? (
                      "✔️ Typ richtig"
                    ) : (
                      <>
                        ❌ Typ falsch
                        <div className="text-black font-normal text-sm mt-1">
                          Richtige Antwort: Typ {bild.typ}
                        </div>
                      </>
                    )
                  ) : fb.istRichtig ? (
                    "✔️ Alles korrekt"
                  ) : (
                    <>
                      <div>
                        {[
                          fb.typRichtig ? "Typ ✅" : "Typ ❌",
                          fb.subtypRichtig ? "Subtyp ✅" : "Subtyp ❌",
                          ...(level === "expert" && bild.wing != null
                            ? [fb.wingRichtig ? "Wing ✅" : "Wing ❌"]
                            : []),
                        ].join(" · ")}
                      </div>

                      <div className="text-black font-normal text-sm mt-1">
                        Richtige Antwort: Typ {bild.typ} · {bild.subtyp}
                        {level === "expert" && bild.wing != null
                          ? ` · w${bild.wing}`
                          : ""}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="mt-3 flex gap-2 justify-center">
                <LexButton
                  onClick={geprueft ? neueRunde : pruefeAntworten}
                  className="px-4 py-2 text-sm"
                >
                  {geprueft ? "Nächste Runde" : "Antwort überprüfen"}
                </LexButton>

                {!geprueft && (
                  <LexButton
                    onClick={
                      mode === "single" ? skipRunde : () => skipEinzelBild(index)
                    }
                    className="px-4 py-2 text-sm"
                  >
                    Überspringen
                  </LexButton>
                )}
              </div>
            </div>
          );
        })}
      </div>

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

           <div className="relative w-full h-full">
  <img
    src={vergroessertesBild.pfad}
    alt={vergroessertesBild.title}
    className="w-full h-full object-contain object-center block"
  />

  {mode === "quickguess" && isTimeUp && (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center text-[#f5e6d2] text-sm tracking-wide rounded-xl">
      Zeit abgelaufen
    </div>
  )}
</div>
  );
}
