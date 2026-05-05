import * as React from 'react';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stack, Text, DefaultButton, PrimaryButton, Spinner, SpinnerSize,
  MessageBar, MessageBarType, ProgressIndicator, Icon
} from '@fluentui/react';
import { CUATRIMESTRE_ACTUAL } from '../../../../../core/utils/Constants';
import OfertaDeMaterias from '../../../../../core/entities/OfertaDeMaterias';
import MateriaDatasource from '../../../../../core/api/materia/MateriaDatasource';
import ComisionDatasource from '../../../../../core/api/comision/ComisionDatasource';
import OfertaDeMateriaDatasource from '../../../../../core/api/ofertaDeMaterias/OfertaDeMateriaDatasource';
import { parseCSV, IImportRow } from './importParser';

type Step = 'upload' | 'preview' | 'done';

const ImportarOferta: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('upload');
  const [rows, setRows] = useState<IImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [creados, setCreados] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const materiaDS = React.useMemo(() => new MateriaDatasource(), []);
  const comisionDS = React.useMemo(() => new ComisionDatasource(), []);
  const ofertaDS = React.useMemo(() => new OfertaDeMateriaDatasource(), []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setError(null);

    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = ev => resolve((ev.target as FileReader).result as string);
      reader.onerror = reject;
      reader.readAsText(file, 'utf-8');
    });

    const parsed = parseCSV(text);
    if (parsed.length === 0) {
      setError('El archivo no tiene datos válidos o no tiene las columnas esperadas (codMateria, codComision, modalidad).');
      return;
    }

    // Validate against SP: load Materia and Comision lists
    setImporting(true);
    try {
      const [mats, coms, existentes] = await Promise.all([
        materiaDS.getItems(),
        comisionDS.getItems(),
        ofertaDS.getByCuatrimestre(CUATRIMESTRE_ACTUAL)
      ]);

      const matMap: Record<string, number> = {};
      mats.forEach((m: any) => { matMap[m.codMateria] = m.Id; });

      const comMap: Record<string, number> = {};
      coms.forEach((c: any) => { comMap[c.codComision] = c.Id; });

      const existenteSet = new Set(existentes.map(o => `${o.codMateriaId}_${o.codComisionId}`));

      const validated = parsed.map(row => {
        if (!row.valid) return row;
        const mid = matMap[row.codMateria];
        const cid = comMap[row.codComision];
        if (!mid) return { ...row, valid: false, error: `Materia '${row.codMateria}' no encontrada` };
        if (!cid) return { ...row, valid: false, error: `Comisión '${row.codComision}' no encontrada` };
        if (existenteSet.has(`${mid}_${cid}`)) return { ...row, valid: false, error: 'Ya existe en este cuatrimestre' };
        return { ...row, materiaId: mid, comisionId: cid, valid: true, error: '' };
      });

      setRows(validated);
      setStep('preview');
    } catch (err) {
      console.error('[ImportarOferta]', err);
      setError('Error al validar los datos contra SharePoint.');
    } finally {
      setImporting(false);
    }
  }, []);

  const handleConfirmar = async (): Promise<void> => {
    const validas = rows.filter(r => r.valid);
    if (validas.length === 0) return;

    setImporting(true);
    setProgress(0);
    let count = 0;

    try {
      for (let i = 0; i < validas.length; i++) {
        const row = validas[i];
        const nueva = new OfertaDeMaterias({
          codMateriaId: row.materiaId,
          codComisionId: row.comisionId,
          modalidad: row.modalidad,
          Cuatrimestre: CUATRIMESTRE_ACTUAL
        });
        await ofertaDS.add(nueva);
        count++;
        setProgress((i + 1) / validas.length);
      }
      setCreados(count);
      setStep('done');
    } catch (err) {
      console.error('[ImportarOferta] error al crear', err);
      setError(`Error al crear ofertas. Se crearon ${count} de ${validas.length}.`);
    } finally {
      setImporting(false);
    }
  };

  const handleReset = (): void => {
    setStep('upload');
    setRows([]);
    setError(null);
    setProgress(0);
    setCreados(0);
  };

  const validCount = rows.filter(r => r.valid).length;
  const invalidCount = rows.filter(r => !r.valid).length;

  return (
    <Stack tokens={{ padding: 24, childrenGap: 16 }}>
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }}>
        <DefaultButton iconProps={{ iconName: 'Back' }} text="Admin" onClick={() => navigate('/admin')} />
        <Text variant="xLarge">Importar Oferta desde CSV</Text>
      </Stack>

      {error && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setError(null)}>{error}</MessageBar>
      )}

      {step === 'upload' && (
        <Stack tokens={{ childrenGap: 16 }}>
          <MessageBar messageBarType={MessageBarType.info}>
            El archivo CSV debe tener una fila de encabezado con las columnas: <strong>codMateria, codComision, modalidad</strong>
          </MessageBar>
          <Text variant="small" styles={{ root: { color: '#555' } }}>
            Ejemplo de contenido:
          </Text>
          <Stack styles={{ root: { background: '#f5f5f5', padding: 12, borderRadius: 4, fontFamily: 'monospace', fontSize: 12 } }}>
            <Text>codMateria,codComision,modalidad</Text>
            <Text>PROG1,COM-A,Presencial</Text>
            <Text>MATH2,COM-B,Virtual</Text>
          </Stack>
          {importing ? (
            <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign="center">
              <Spinner size={SpinnerSize.small} />
              <Text variant="small">Validando contra SharePoint...</Text>
            </Stack>
          ) : (
            <Stack horizontal tokens={{ childrenGap: 12 }} verticalAlign="center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <PrimaryButton
                iconProps={{ iconName: 'Upload' }}
                text="Seleccionar archivo CSV"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              />
            </Stack>
          )}
        </Stack>
      )}

      {step === 'preview' && (
        <Stack tokens={{ childrenGap: 16 }}>
          <Stack horizontal tokens={{ childrenGap: 16 }}>
            <Text variant="medium" styles={{ root: { color: '#28a745' } }}>✓ {validCount} filas válidas</Text>
            {invalidCount > 0 && (
              <Text variant="medium" styles={{ root: { color: '#d32f2f' } }}>✗ {invalidCount} filas con error</Text>
            )}
          </Stack>

          <Stack styles={{ root: { maxHeight: 400, overflow: 'auto', border: '1px solid #ddd', borderRadius: 4 } }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f0f0f0', position: 'sticky', top: 0 }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>codMateria</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>codComision</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Modalidad</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} style={{ background: row.valid ? 'white' : '#fff5f5' }}>
                    <td style={{ padding: '6px 12px', borderBottom: '1px solid #f0f0f0' }}>{row.codMateria}</td>
                    <td style={{ padding: '6px 12px', borderBottom: '1px solid #f0f0f0' }}>{row.codComision}</td>
                    <td style={{ padding: '6px 12px', borderBottom: '1px solid #f0f0f0' }}>{row.modalidad}</td>
                    <td style={{ padding: '6px 12px', borderBottom: '1px solid #f0f0f0' }}>
                      {row.valid
                        ? <Icon iconName="CheckMark" styles={{ root: { color: '#28a745' } }} />
                        : <Text variant="small" styles={{ root: { color: '#d32f2f' } }}>✗ {row.error}</Text>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Stack>

          {importing && (
            <ProgressIndicator
              label={`Creando ofertas... ${Math.round(progress * 100)}%`}
              percentComplete={progress}
            />
          )}

          <Stack horizontal tokens={{ childrenGap: 12 }}>
            {!importing && (
              <>
                <PrimaryButton
                  iconProps={{ iconName: 'Save' }}
                  text={`Confirmar e importar ${validCount} oferta${validCount !== 1 ? 's' : ''}`}
                  disabled={validCount === 0}
                  onClick={handleConfirmar}
                />
                <DefaultButton text="Volver a cargar" onClick={handleReset} />
              </>
            )}
          </Stack>
        </Stack>
      )}

      {step === 'done' && (
        <Stack horizontalAlign="center" tokens={{ childrenGap: 16, padding: 32 }}>
          <Icon iconName="CheckMark" styles={{ root: { fontSize: 40, color: '#28a745' } }} />
          <Text variant="xLarge" styles={{ root: { color: '#28a745' } }}>
            ¡Importación completada!
          </Text>
          <Text variant="medium">{creados} oferta{creados !== 1 ? 's' : ''} creada{creados !== 1 ? 's' : ''} correctamente.</Text>
          <Stack horizontal tokens={{ childrenGap: 12 }}>
            <PrimaryButton text="Importar otro archivo" onClick={handleReset} />
            <DefaultButton text="Ver Gestión de Oferta" onClick={() => navigate('/admin/oferta')} />
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

export default ImportarOferta;
