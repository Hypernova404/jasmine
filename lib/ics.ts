export function buatICS({
  judul,
  deskripsi,
  tanggalMulai,
  tanggalSelesai,
}: {
  judul: string;
  deskripsi: string;
  tanggalMulai: Date;
  tanggalSelesai?: Date;
}): string {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = tanggalSelesai ?? new Date(tanggalMulai.getTime() + 3600000);
  const uid = `jasmine-${tanggalMulai.getTime()}-${Math.random().toString(36).slice(2, 8)}@jasmine`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Jasmine//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(tanggalMulai)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${escapeICS(judul)}`,
    `DESCRIPTION:${escapeICS(deskripsi)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeICS(judul)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function escapeICS(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function downloadFile(filename: string, content: string, mime = "text/calendar") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
