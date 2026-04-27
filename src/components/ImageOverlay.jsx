export default function ImageOverlay({
  vergroessertesBild,
  setVergroessertesBild,
  mode,
  isTimeUp,
}) {
  if (!vergroessertesBild) return null;

  return (
    <div
      onClick={() => setVergroessertesBild(null)}
      className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] cursor-zoom-out p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[90vw] max-w-[600px] h-[80vh] max-h-[800px] bg-[#c8a979] rounded-2xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setVergroessertesBild(null);
          }}
          className="absolute top-2 right-2 bg-black/60 text-[#f5e6d2] w-8 h-8 rounded-full font-bold text-xl flex items-center justify-center"
        >
          ×
        </button>

        <div className="relative w-full h-full">
          <img
            src={vergroessertesBild.pfad}
            alt={vergroessertesBild.title}
            className="w-full h-full object-contain object-center block"
          />

          {mode === "quickguess" && isTimeUp && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center text-[#f5e6d2] text-sm tracking-wide rounded-xl">
              Zeit abgelaufen
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
