import {
  parseBildInfo,
  getWingsForType,
  zieheAusgewogenesBild,
  pruefeRunde,
  berechneNeueStats,
  pickNaechsteBilder,
} from "./utils/quizLogic";

import { useEffect, useState } from "react";
import merkmale from "./data/merkmale.json";
import LexButton from "./components/LexButton.jsx";
import StartScreen from "./components/StartScreen";
import ImageOverlay from "./components/ImageOverlay";
import StatsBox from "./components/StatsBox";
import QuizHeader from "./components/QuizHeader";
import QuizCard from "./components/QuizCard";

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
  const [letzteTypen, setLetzteTypen] = useState([]);
  
  const [rundeBilder, setRundeBilder] = useState([]);
  const [antworten, setAntworten] = useState({});
  const [feedback, setFeedback] = useState({});
  const [geprueft, setGeprueft] = useState(false);
  const [zeigeMerkmale, setZeigeMerkmale] = useState({});
  const [vergroessertesBild, setVergroessertesBild] = useState(null);
  const [mode, setMode] = useState("single");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [screen, setScreen] = useState("start");

  const [level, setLevel] = useState("fortgeschritten");
  const [isFading, setIsFading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState({});

  const [quickguessStarted, setQuickguessStarted] = useState(false);  
  const [timer, setTimer] = useState(10);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [quickStats, setQuickStats] = useState({
  anfaenger: { streak: 0, bestStreak: 0, score: 0 },
  fortgeschritten: { streak: 0, bestStreak: 0, score: 0 },
  expert: { streak: 0, bestStreak: 0, score: 0 },
});
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
  alleBilder,
  weiblichPool,
  maennlichPool,
  neutralPool,
  ladeGeseheneBilder(),
  mode,
  letzteTypen
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
  if (screen === "quiz" && alleBilder.length > 0) {
    starteNeueRunde();
  }
}, [screen, mode]);
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

  if (mode === "quickguess") {
  const richtig = Object.values(result).every((r) => r.istRichtig);

  if (richtig) {
    setQuickStats((prev) => {
  const newStreak = prev[level].streak + 1;

  return {
    ...prev,
    [level]: {
      ...prev[level],
      streak: newStreak,
      bestStreak: Math.max(prev[level].bestStreak, newStreak),
      score: prev[level].score + 10,
    },
  };
});
  } else {
    setQuickStats((prev) => ({
  ...prev,
  [level]: {
    ...prev[level],
    streak: 0,
  },
}));
  }
}
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
  mode,
  letzteTypen
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
      setLetzteTypen((prev) => {
  const neueTypen = neue.map((b) => b.typ).filter(Boolean);
  return [...neueTypen, ...prev].slice(0, 3);
});      setAntworten({});
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
if (screen === "start") {
  return (
    <StartScreen
      setMode={setMode}
      setLevel={setLevel}
      setScreen={setScreen}
      setQuickguessStarted={setQuickguessStarted}
      />
  );
}
if (screen === "quiz" && mode === "quickguess" && !quickguessStarted) {
  return (
    <div className="min-h-screen bg-[#ead0aa] text-black font-lexSerif px-4 py-8 flex flex-col items-center justify-center">
      <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
        Quickguess ⚡
      </h1>

      <p className="text-center text-black/70 max-w-[340px] mb-8">
        Du hast 10 Sekunden Zeit, dir einen ersten Eindruck vom Bild zu machen.
        Danach wird das Bild verdeckt.
      </p>

      <LexButton
        onClick={() => {
          setQuickguessStarted(true);
          starteNeueRunde();
        }}
        className="px-6 py-3 text-base"
      >
        Quickguess starten
      </LexButton>

      <button
        onClick={() => setScreen("start")}
        className="mt-5 text-sm text-black/60 hover:text-black underline"
      >
        Zurück zur Auswahl
      </button>
 </div>
    );
  }
  return (
     <div className="min-h-screen bg-[#ead0aa] text-black font-lexSerif px-4 py-8 overflow-x-hidden">
  
<div
  className={[
    "w-full mx-auto mt-4 bg-[#c8a979] border border-black rounded-2xl p-4 shadow-[0_4px_10px_rgba(0,0,0,0.35)]",
    mode === "compare" ? "max-w-[860px]" : "max-w-[430px]",
  ].join(" ")}
>
  <QuizHeader
    level={level}
    mode={mode}
    setScreen={setScreen}
    setAntworten={setAntworten}
    setFeedback={setFeedback}
    setGeprueft={setGeprueft}
    setZeigeMerkmale={setZeigeMerkmale}
    showStats={showStats}
    setShowStats={setShowStats}
    levelStats={levelStats}
    isNovize={isNovize}
    isProfi={isProfi}
    resetCurrentLevel={resetCurrentLevel}
    resetAllStats={resetAllStats}
  />

  <div
  className={[
    mode === "compare"
      ? "flex gap-4 flex-wrap justify-center transition-opacity duration-150 ease-in-out"
      : "flex gap-8 flex-wrap justify-center transition-opacity duration-150 ease-in-out",
    isFading ? "opacity-0 pointer-events-none" : "opacity-100",
  ].join(" ")}
>
    {rundeBilder.map((bild, index) => {
      const userAntwort = antworten[index] || {};
      const fb = feedback[index];

      const pfad = `${LEXIKON_BASE_URL}/bilder/${bild.pfad}/${encodeURIComponent(
        bild.datei
      )}`;
  
{mode !== "quickguess" && (
  <div className="w-full max-w-[430px] mx-auto mt-4">

    <div className="flex justify-center mb-3">
      <LexButton
        onClick={() => setShowStats((v) => !v)}
        className="px-4 py-2 text-sm"
      >
        {showStats
          ? "Trefferquote ausblenden"
          : "Trefferquote anzeigen"}
      </LexButton>
    </div>

    <StatsBox
      showStats={showStats}
      levelStats={levelStats}
      isNovize={isNovize}
      isProfi={isProfi}
      resetCurrentLevel={resetCurrentLevel}
      resetAllStats={resetAllStats}
    />

  </div>
)}      return (
        <QuizCard
          key={bild.pfad + "-" + bild.datei}
          bild={bild}
          index={index}
          pfad={pfad}
          userAntwort={userAntwort}
          fb={fb}
          level={level}
          mode={mode}
          geprueft={geprueft}
          imgLoaded={imgLoaded}
          setImgLoaded={setImgLoaded}
          setTimer={setTimer}
          setIsTimeUp={setIsTimeUp}
          setIsTimerActive={setIsTimerActive}
          setVergroessertesBild={setVergroessertesBild}
          handleAntwort={handleAntwort}
          dropdownStyle={dropdownStyle}
          typen={typen}
          subtypen={subtypen}
          zeigeMerkmale={zeigeMerkmale}
          setZeigeMerkmale={setZeigeMerkmale}
          neueRunde={neueRunde}
          pruefeAntworten={pruefeAntworten}
          skipRunde={skipRunde}
          skipEinzelBild={skipEinzelBild}
          isTimeUp={isTimeUp}
          timer={timer}
          streak={quickStats[level]?.streak ?? 0}
          bestStreak={quickStats[level]?.bestStreak ?? 0}
          score={quickStats[level]?.score ?? 0}
        />
      );
    })}
  </div>
</div>

<ImageOverlay
  vergroessertesBild={vergroessertesBild}
  setVergroessertesBild={setVergroessertesBild}
  mode={mode}
  isTimeUp={isTimeUp}
/>
</div>
);
}
