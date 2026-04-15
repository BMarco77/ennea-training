export function parseBildInfo(pfad) {
  const typMatch = pfad.match(/\d+/);
  const wingMatch = pfad.match(/w(\d)/i);

  return {
    typ: typMatch ? parseInt(typMatch[0], 10) : null,
    subtyp: pfad.slice(0, 2),
    wing: wingMatch ? parseInt(wingMatch[1], 10) : null,
  };
}

export function getWingsForType(typ) {
  if (!typ) return [];

  const left = typ === 1 ? 9 : typ - 1;
  const right = typ === 9 ? 1 : typ + 1;

  return [left, right];
}

export function zieheAusgewogenesBild(
  weiblich,
  maennlich,
  neutral,
  gesehen,
  verboteneTypen = []
) {
  const w = 0.4;
  const m = 0.4;
  const n = 0.2;

  const r = Math.random();
  let pool = r < w ? weiblich : r < w + m ? maennlich : neutral;

  let unge = pool.filter((b) => !gesehen.includes(b.datei));
  if (unge.length === 0) unge = [...pool];

  const gefiltert = unge.filter(
    (b) => b.typ != null && !verboteneTypen.includes(b.typ)
  );

  if (gefiltert.length > 0) {
    unge = gefiltert;
  }

  return unge[Math.floor(Math.random() * unge.length)];
}
