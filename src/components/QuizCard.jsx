import { getWingsForType } from "../utils/quizLogic";
import merkmale from "../data/merkmale.json";
import LexButton from "./LexButton";

export default function QuizCard({
  bild,
  index,
  pfad,
  userAntwort,
  fb,
  level,
  mode,
  geprueft,
  imgLoaded,
  setImgLoaded,
  setTimer,
  setIsTimeUp,
  setIsTimerActive,
  setVergroessertesBild,
  handleAntwort,
  dropdownStyle,
  typen,
  subtypen,
  zeigeMerkmale,
  setZeigeMerkmale,
  neueRunde,
  pruefeAntworten,
  skipRunde,
  skipEinzelBild,
  isTimeUp,
}) {
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

      {mode === "quickguess" && !isTimeUp && (
        <div className="text-center text-sm mb-1">⏱ 10s</div>
      )}

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
            onChange={(e) => handleAntwort(index, "subtyp", e.target.value)}
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
        const userTyp = userAntwort.typ ? parseInt(userAntwort.typ, 10) : null;

        return (
          level === "expert" &&
          bild.wing != null &&
          userTyp && (
            <div className="mb-1 md:mb-1.5">
              <select
                value={userAntwort.wing || ""}
                onChange={(e) => handleAntwort(index, "wing", e.target.value)}
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
            onClick={mode === "single" ? skipRunde : () => skipEinzelBild(index)}
            className="px-4 py-2 text-sm"
          >
            Überspringen
          </LexButton>
        )}
      </div>
    </div>
  );
}
