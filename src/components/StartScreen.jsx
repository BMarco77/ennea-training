import LexButton from "./LexButton";
import wappen from "../assets/wappen.png";

export default function StartScreen({
  setMode,
  setLevel,
  setScreen,
  setQuickguessStarted,
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ead0aa] font-lexSerif text-black px-4">

      {/* CARD */}
      <div className="w-full max-w-[420px] bg-[#c8a979] rounded-2xl p-5 border border-black shadow-[0_4px_12px_rgba(0,0,0,0.4)]">

        {/* HEADER */}
        <div className="text-center mb-5">
          <img
            src={wappen}
            alt="Wappen"
            className="mx-auto mb-2 max-w-[70px]"
          />

          <h1 className="text-2xl md:text-3xl font-bold">
            Profiling
          </h1>

          <p className="text-sm text-black/70 mt-1">
            Wähle deinen Trainingsmodus
          </p>
        </div>

        {/* TRENNER */}
        <div className="h-px bg-black/30 mb-4" />

        {/* TRAINING */}
        <div className="mb-5">
          <div className="text-sm font-semibold text-black/70 mb-2">
            Training
          </div>

          {/* NOVIZE */}
         <div className="mb-4">
  <div className="text-sm font-semibold mb-1 tracking-wide">Novize</div>

  <div className="flex gap-2">
    <LexButton
      onClick={() => {
        setLevel("anfaenger");
        setMode("single");
        setScreen("quiz");
      }}
     className="flex-1 py-2 text-sm""
    >
      Einzel
    </LexButton>

    <LexButton
      onClick={() => {
        setLevel("anfaenger");
        setMode("compare");
        setScreen("quiz");
      }}
      className="flex-1 py-2"
    >
      Vergleich
    </LexButton>
  </div>
</div>

          {/* PROFI */}
         <div className="mb-4">
  <div className="text-sm font-semibold mb-1">Profi</div>

  <div className="flex gap-2">
    <LexButton
      onClick={() => {
        setLevel("anfaenger");
        setMode("single");
        setScreen("quiz");
      }}
      className="flex-1 py-2 text-sm""
    >
      Einzel
    </LexButton>

    <LexButton
      onClick={() => {
        setLevel("anfaenger");
        setMode("compare");
        setScreen("quiz");
      }}
      className="flex-1 py-2"
    >
      Vergleich
    </LexButton>
  </div>
</div>

          {/* EXPERTE */}
         <div className="mb-4">
  <div className="text-sm font-semibold mb-1">Experte</div>

  <div className="flex gap-2">
    <LexButton
      onClick={() => {
        setLevel("anfaenger");
        setMode("single");
        setScreen("quiz");
      }}
     className="flex-1 py-2 text-sm""
    >
      Einzel
    </LexButton>

    <LexButton
      onClick={() => {
        setLevel("anfaenger");
        setMode("compare");
        setScreen("quiz");
      }}
      className="flex-1 py-2"
    >
      Vergleich
    </LexButton>
  </div>
         </div>
</div>
        {/* TRENNER */}
        <div className="h-px bg-black/30 my-4" />

        {/* QUICKGUESS */}
        <div>
          <div className="text-sm font-semibold text-black/70 mb-1">
            Quickguess ⚡
          </div>

          <div className="text-xs text-black/60 mb-3">
            10 Sekunden · Intuition · Erstblick
          </div>

          <div className="flex gap-2">
            <LexButton
              onClick={() => {
                setLevel("anfaenger");
                setMode("quickguess");
                setQuickguessStarted(false);
                setScreen("quiz");
              }}
              className="flex-1 py-2"
            >
              Novize
            </LexButton>

            <LexButton
              onClick={() => {
                setLevel("fortgeschritten");
                setMode("quickguess");
                setQuickguessStarted(false);
                setScreen("quiz");
              }}
              className="flex-1 py-2"
            >
              Profi
            </LexButton>

            <LexButton
              onClick={() => {
                setLevel("expert");
                setMode("quickguess");
                setQuickguessStarted(false);
                setScreen("quiz");
              }}
              className="flex-1 py-2"
            >
              Experte
            </LexButton>
          </div>
        </div>
      </div>
    </div>
  );
}
