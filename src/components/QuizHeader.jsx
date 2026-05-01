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
    <div className="w-full mb-3">
     <div className="flex items-start justify-between gap-3 mb-4">
  <div>
    <LexButton
      onClick={() => {
        setScreen("start");
        setAntworten({});
        setFeedback({});
        setGeprueft(false);
        setZeigeMerkmale({});
      }}
      className="px-3 py-1 text-xs opacity-85 hover:opacity-100 mb-2"
    >
      ← Hauptmenü
    </LexButton>

    <div className="text-left">
      <div className="text-sm font-bold">
        {levelLabel} · {modeLabel}
      </div>
      <div className="text-xs text-black/60">
        {description}
      </div>
    </div>
  </div>
</div>
      
    </div>
  );
}
