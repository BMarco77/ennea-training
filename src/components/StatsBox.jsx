import LexButton from "./LexButton";

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

export default function StatsBox({
  showStats,
  levelStats,
  isNovize,
  isProfi,
  resetCurrentLevel,
  resetAllStats,
}) {
  if (!showStats) return null;

  return (
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
                  ? (levelStats.overallCorrect / levelStats.imagesTotal) * 100
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
                  ? (levelStats.subtypCorrect / levelStats.subtypTotal) * 100
                  : 0
              }
            />
            <StatBar
              label="Gesamt korrekt"
              value={
                levelStats.imagesTotal
                  ? (levelStats.overallCorrect / levelStats.imagesTotal) * 100
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
                  ? (levelStats.subtypCorrect / levelStats.subtypTotal) * 100
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
                  ? (levelStats.overallCorrect / levelStats.imagesTotal) * 100
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
  );
}
