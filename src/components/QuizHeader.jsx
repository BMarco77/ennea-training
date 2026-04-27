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
<div>
        </div>
     
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
