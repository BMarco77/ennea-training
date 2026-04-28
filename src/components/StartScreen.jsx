import LexButton from "./LexButton";
import wappen from "../assets/wappen.png";

export default function StartScreen({
  setMode,
  setLevel,
  setScreen,
  setQuickguessStarted,
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#ead0aa] font-lexSerif text-black px-6">
      <div className="text-center mb-3">
        <img
          src={wappen}
          alt="Wappen"
          className="mx-auto mb-2 max-w-[90px] h-auto"
        />
      </div>

      <div className="flex items-center justify-center gap-3 mb-5">
        <span className="flex-1 max-w-[150px] h-px bg-black"></span>
        <span className="text-[1.2rem]">❦</span>
        <span className="flex-1 max-w-[150px] h-px bg-black"></span>
      </div>

      <h1 className="text-3xl md:text-5xl font-bold mb-10 text-center">
        Typisierungsübungen
      </h1>

      <div className="flex flex-col gap-6 w-full max-w-[420px]">
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

        <div className="h-px bg-black/30 my-2" />

        <div className="flex items-center justify-between gap-3">
          <div className="w-[90px] font-semibold">Quickguess</div>

          <LexButton
            onClick={() => {
              setLevel("anfaenger");
              setMode("quickguess");
              setQuickguessStarted(false);
              setScreen("quiz");
            }}
            className="flex-1"
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
            className="flex-1"
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
            className="flex-1"
          >
            Experte
          </LexButton>
        </div>
      </div>
    </div>
  );
}
