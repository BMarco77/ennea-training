import LexButton from "./LexButton";
import wappen from "../assets/wappen.png";
export default function StartScreen({ setMode, setLevel, setScreen, setQuickguessStarted,}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#ead0aa] font-lexSerif text-black px-6">

   <div className="text-center mb-3">
  <img
    src={wappen}
    alt="Wappen"
    className="mx-auto mb-2 max-w-[70px] h-auto"
  />
</div>

<div className="flex items-center justify-center gap-3 mb-5">
  <span className="flex-1 max-w-[150px] h-px bg-black"></span>
  <span className="text-[1.2rem]">❦</span>
  <span className="flex-1 max-w-[150px] h-px bg-black"></span>
</div>

<h1 className="text-2xl md:text-4xl font-bold mb-6 text-center">
  Typisierungsübungen
</h1>
     
      {/* LEVEL + MODUS MATRIX */}
      <div className="flex flex-col gap-6 w-full max-w-[420px]">

        {/* NOVIZE */}
        <div className="flex items-center justify-between gap-3">
          <div className="w-[90px] font-semibold">Novize</div>

          <LexButton
            onClick={() => {
              setLevel("anfaenger");
              setMode("single");
              setScreen("quiz");
            }}
            className="flex-1"
          >
            Einzelbild
          </LexButton>

          <LexButton
            onClick={() => {
              setLevel("anfaenger");
              setMode("compare");
              setScreen("quiz");
            }}
            className="flex-1"
          >
            Vergleich
          </LexButton>
        </div>

        {/* PROFI */}
        <div className="flex items-center justify-between gap-3">
          <div className="w-[90px] font-semibold">Profi</div>

          <LexButton
            onClick={() => {
              setLevel("fortgeschritten");
              setMode("single");
              setScreen("quiz");
            }}
            className="flex-1"
          >
            Einzelbild
          </LexButton>

          <LexButton
            onClick={() => {
              setLevel("fortgeschritten");
              setMode("compare");
              setScreen("quiz");
            }}
            className="flex-1"
          >
            Vergleich
          </LexButton>
        </div>

        {/* EXPERTE */}
        <div className="flex items-center justify-between gap-3">
          <div className="w-[90px] font-semibold">Experte</div>

          <LexButton
            onClick={() => {
              setLevel("expert");
              setMode("single");
              setScreen("quiz");
            }}
            className="flex-1"
          >
            Einzelbild
          </LexButton>

          <LexButton
            onClick={() => {
              setLevel("expert");
              setMode("compare");
              setScreen("quiz");
            }}
            className="flex-1"
          >
            Vergleich
          </LexButton>
        </div>

        {/* TRENNLINIE */}
        <div className="h-px bg-black/30 my-2" />

        {/* QUICKGUESS */}
       <LexButton
  onClick={() => {
    setMode("quickguess");
    setQuickguessStarted(false);
    setScreen("quiz");
  }}
  className="mt-2"
>
  Quickguess ⚡
</LexButton>

      </div>
    </div>
  );
}
