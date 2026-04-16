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

export function pruefeBildAntwort(bild, antwort, level) {
  const typRichtig =
    antwort.typ != null && parseInt(antwort.typ, 10) === bild.typ;

  const subtypRichtig = antwort.subtyp === bild.subtyp;

  const wingRichtig =
    bild.wing == null
      ? true
      : antwort.wing != null &&
        parseInt(antwort.wing, 10) === bild.wing;

  let istRichtig = false;

  if (level === "anfaenger") istRichtig = typRichtig;
  else if (level === "fortgeschritten")
    istRichtig = typRichtig && subtypRichtig;
  else if (level === "expert")
    istRichtig = typRichtig && subtypRichtig && wingRichtig;

  return { typRichtig, subtypRichtig, wingRichtig, istRichtig };
}
