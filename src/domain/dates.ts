import { Opportunity } from "./opportunity";

/** Return the nearest relevant deadline (early-bird → registration → start). */
export function nearestDeadline(opp: Opportunity): string | null {
  const candidates = [
    opp.dates.earlyBirdDeadline,
    opp.dates.registrationDeadline,
    opp.dates.startDate,
  ].filter(Boolean) as string[];
  if (!candidates.length) return null;
  return [...candidates].sort()[0];
}

export function deadlineLabel(opp: Opportunity): string | null {
  const d = nearestDeadline(opp);
  if (!d) return null;
  if (opp.dates.earlyBirdDeadline === d) return `Early bird ${d}`;
  if (opp.dates.registrationDeadline === d) return `Registration closes ${d}`;
  return `Starts ${d}`;
}

/** Simple ICS download for the opportunity window. */
export function buildIcs(opp: Opportunity): string {
  const start = (opp.dates.startDate || opp.dates.registrationDeadline || "").replace(/-/g, "");
  const end = (opp.dates.endDate || opp.dates.startDate || start).replace(/-/g, "");
  const uid = `${opp.id}@newtechradar`;
  const summary = opp.name.replace(/\n/g, " ");
  const desc = (opp.summary || "").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//New Tech Radar//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    start ? `DTSTART;VALUE=DATE:${start}` : "",
    end ? `DTEND;VALUE=DATE:${end}` : "",
    `SUMMARY:${summary}`,
    `DESCRIPTION:${desc}`,
    `URL:${opp.links.official}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

export function downloadIcs(opp: Opportunity) {
  const ics = buildIcs(opp);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${opp.slug || opp.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
