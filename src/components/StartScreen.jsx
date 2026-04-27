export default function StartScreen({ setMode, setLevel, setScreen }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#ead0aa] font-lexSerif text-black px-6">

      <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center">
        Typisierungsübungen
      </h1>

      <div className="flex flex-col gap-4 w-full max-w-[300px]">

        <button onClick={() => {
          setMode("single");
          setLevel("anfaenger");
          setScreen("quiz");
        }}>
          Novize
        </button>

        <button onClick={() => {
          setMode("single");
          setLevel("fortgeschritten");
          setScreen("quiz");
        }}>
          Profi
        </button>

        <button onClick={() => {
          setMode("single");
          setLevel("expert");
          setScreen("quiz");
        }}>
          Experte
        </button>

        <button onClick={() => {
          setMode("quickguess");
          setScreen("quiz");
        }}>
          Quickguess ⚡
        </button>

      </div>
    </div>
  );
}
