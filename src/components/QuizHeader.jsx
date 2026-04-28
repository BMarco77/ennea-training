import LexButton from "./LexButton";
import StatsBox from "./StatsBox";

export default function QuizHeader({
  level,
  mode,
  setScreen,
  setAntworten,
  setFeedback,
  setGeprueft,
  setZeigeMerkmale,
  showStats,
  setShowStats,
  levelStats,
  isNovize,
  isProfi,
  resetCurrentLevel,
  resetAllStats,
}) {
  const levelLabel =
    level === "anfaenger"
      ? "Novize"
      : level === "fortgeschritten"
      ? "Profi"
      : "Experte";

  const modeLabel =
    mode === "compare"
      ? "Vergleich"
      : mode === "quickguess"
      ? "Quickguess"
      : "Einzelbild";

  const description =
    level === "anfaenger"
      ? "Bestimme den Haupttyp"
      : level === "fortgeschritten"
      ? "Bestimme Haupttyp und Subtyp"
      : "Bestimme Haupttyp, Subtyp und Wing";

  return (
    <div className="w-full max-w-[760px] mx-auto mb-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <LexButton
          onClick={() => {
            setScreen("start");
            setAntworten({});
            setFeedback({});
            setGeprueft(false);
            setZeigeMerkmale({});
          }}
          className="px-3 py-1 text-sm"
        >
          ← Zurück
        </LexButton>

        <div className="text-right">
          <div className="text-sm font-bold">
            {levelLabel} · {modeLabel}
          </div>
          <div className="text-xs text-black/60">{description}</div>
        </div>
      </div>

    {mode !== "quickguess" && (
  <>
    <div className="flex justify-center mb-4">
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
    </>
    )}
  </div>
);
}
