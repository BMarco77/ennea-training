import wappen from "../assets/wappen.png";
import LexButton from "./LexButton";
import StatsBox from "./StatsBox";

export default function QuizHeader({
  level,
  setLevel,
  mode,
  setMode,
  setScreen,
  setAntworten,
  setFeedback,
  setGeprueft,
  setZeigeMerkmale,
  starteNeueRunde,
  showStats,
  setShowStats,
  levelStats,
  isNovize,
  isProfi,
  resetCurrentLevel,
  resetAllStats,
}) {
  return (
    <div className="text-center -mt-1 mb-1 md:mb-2">
      <div className="flex justify-start mb-4">
        <LexButton
          onClick={() => {
            setScreen("start");
            setAntworten({});
            setFeedback({});
            setGeprueft(false);
            setZeigeMerkmale({});
          }}
          className="px-3 py-1 text-sm border border-black/60 bg-[#c8a979] hover:bg-[#d2b089]"
        >
          ← Zurück
        </LexButton>
      </div>

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

      <StatsBox
        showStats={showStats}
        levelStats={levelStats}
        isNovize={isNovize}
        isProfi={isProfi}
        resetCurrentLevel={resetCurrentLevel}
        resetAllStats={resetAllStats}
      />
    </div>
  );
}
