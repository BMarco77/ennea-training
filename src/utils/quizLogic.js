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
  function zieheGewichtetesBild(pool, gesehen, verboteneTypen = [], letzteTypen = []) {
  let kandidaten = pool.filter((b) => !gesehen.includes(b.datei));

  if (kandidaten.length === 0) {
    kandidaten = [...pool];
  }

  kandidaten = kandidaten.filter(
    (b) => b.typ != null && !verboteneTypen.includes(b.typ)
  );

  if (kandidaten.length === 0) return null;

  const typeCounts = {};

  pool.forEach((bild) => {
    if (!bild.typ) return;
    typeCounts[bild.typ] = (typeCounts[bild.typ] || 0) + 1;
  });

  const gewichteteKandidaten = kandidaten.map((bild) => {
    const count = typeCounts[bild.typ] || 1;

    // Weiche Gewichtung: seltene Typen etwas stärker, aber nicht extrem
    let weight = 1 / Math.sqrt(count);

    // Letzte Typen nur dämpfen, nicht verbieten
    if (letzteTypen.includes(bild.typ)) {
      weight *= 0.45;
    }

    return { bild, weight };
  });

  const totalWeight = gewichteteKandidaten.reduce(
    (sum, item) => sum + item.weight,
    0
  );

  let random = Math.random() * totalWeight;

  for (const item of gewichteteKandidaten) {
    random -= item.weight;
    if (random <= 0) return item.bild;
  }

  return gewichteteKandidaten[0]?.bild ?? null;
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

export function pruefeRunde(rundeBilder, antworten, level) {
  const result = {};

  let overallInc = 0;
  let typInc = 0;
  let subtypInc = 0;
  let wingInc = 0;

  let subtypTotalInc = 0;
  let wingTotalInc = 0;

  rundeBilder.forEach((bild, index) => {
    const antwort = antworten[index] || {};

    const { typRichtig, subtypRichtig, wingRichtig, istRichtig } =
      pruefeBildAntwort(bild, antwort, level);

    result[index] = { typRichtig, subtypRichtig, wingRichtig, istRichtig };

    if (istRichtig) overallInc++;
    if (typRichtig) typInc++;

    if (level !== "anfaenger") {
      subtypTotalInc++;
      if (subtypRichtig) subtypInc++;
    }

    if (level === "expert" && bild.wing != null) {
      wingTotalInc++;
      if (wingRichtig) wingInc++;
    }
  });

  return {
    result,
    counters: {
      overallInc,
      typInc,
      subtypInc,
      wingInc,
      subtypTotalInc,
      wingTotalInc,
    },
  };
}

export function berechneNeueStats(stats, level, rundeBilder, counters, emptyStats) {
  const {
    overallInc,
    typInc,
    subtypInc,
    wingInc,
    subtypTotalInc,
    wingTotalInc,
  } = counters;

  const levelKey = level;

  const nextOverall = {
    imagesTotal: stats.overall.imagesTotal + rundeBilder.length,
    overallCorrect: stats.overall.overallCorrect + overallInc,
    typCorrect: stats.overall.typCorrect + typInc,
    subtypTotal: stats.overall.subtypTotal + subtypTotalInc,
    subtypCorrect: stats.overall.subtypCorrect + subtypInc,
    wingTotal: stats.overall.wingTotal + wingTotalInc,
    wingCorrect: stats.overall.wingCorrect + wingInc,
  };

  const prevLevelStats = stats[levelKey] || { ...emptyStats };

  const nextLevel = {
    imagesTotal: prevLevelStats.imagesTotal + rundeBilder.length,
    overallCorrect: prevLevelStats.overallCorrect + overallInc,
    typCorrect: prevLevelStats.typCorrect + typInc,
    subtypTotal: prevLevelStats.subtypTotal + subtypTotalInc,
    subtypCorrect: prevLevelStats.subtypCorrect + subtypInc,
    wingTotal: prevLevelStats.wingTotal + wingTotalInc,
    wingCorrect: prevLevelStats.wingCorrect + wingInc,
  };

  return {
    ...stats,
    overall: nextOverall,
    [levelKey]: nextLevel,
  };
}

export function pickNaechsteBilder(
  pool,
  weiblichArg,
  maennlichArg,
  neutralArg,
  gesehen,
  mode,
  letzteTypen = []
) {
  if (!pool || pool.length === 0) return [];

  let nochNichtGesehen = pool.filter((bild) => !gesehen.includes(bild.datei));

  if (nochNichtGesehen.length < 2) {
    nochNichtGesehen = [...pool];
  }

  const bild1 = zieheGewichtetesBild(
    pool,
    gesehen,
    [],
    letzteTypen
  );

  if (!bild1) return [];

  if (mode === "single" || mode === "quickguess") {
    return [bild1];
  }

  const bild2 = zieheGewichtetesBild(
    pool,
    [...gesehen, bild1.datei],
    [bild1.typ],
    letzteTypen
  );

  if (!bild2) return [bild1];

  return [bild1, bild2];
}
