export interface IImportRow {
  codMateria: string;
  codComision: string;
  modalidad: string;
  // filled during validation
  materiaId: number;
  comisionId: number;
  valid: boolean;
  error: string;
}

export function parseCSV(text: string): IImportRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const idxMateria = headers.indexOf('codmateria');
  const idxComision = headers.indexOf('codcomision');
  const idxModalidad = headers.indexOf('modalidad');

  if (idxMateria === -1 || idxComision === -1 || idxModalidad === -1) {
    return [];
  }

  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim());
    const codMateria = cols[idxMateria] || '';
    const codComision = cols[idxComision] || '';
    const modalidad = cols[idxModalidad] || '';

    if (!codMateria || !codComision || !modalidad) {
      return { codMateria, codComision, modalidad, materiaId: 0, comisionId: 0, valid: false, error: 'Faltan campos obligatorios' };
    }

    return { codMateria, codComision, modalidad, materiaId: 0, comisionId: 0, valid: true, error: '' };
  });
}
