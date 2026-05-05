import * as React from 'react';
import {
  Panel, PanelType, Stack, Dropdown, IDropdownOption,
  PrimaryButton, DefaultButton, Spinner, SpinnerSize, MessageBar, MessageBarType
} from '@fluentui/react';
import Materia from '../../../../../core/entities/Materia';
import Comision from '../../../../../core/entities/Comision';
import OfertaDeMaterias from '../../../../../core/entities/OfertaDeMaterias';
import { CUATRIMESTRE_ACTUAL } from '../../../../../core/utils/Constants';

interface IFormOfertaMateriaProps {
  isOpen: boolean;
  materias: Materia[];
  comisiones: Comision[];
  existentes: OfertaDeMaterias[];
  onDismiss: () => void;
  onCreated: (oferta: OfertaDeMaterias) => void;
  onSave: (materiaId: number, comisionId: number, modalidad: string) => Promise<OfertaDeMaterias>;
}

const MODALIDADES: IDropdownOption[] = [
  { key: 'Presencial', text: 'Presencial' },
  { key: 'Virtual', text: 'Virtual' },
  { key: 'Híbrida', text: 'Híbrida' }
];

const FormOfertaMateria: React.FC<IFormOfertaMateriaProps> = ({
  isOpen, materias, comisiones, existentes, onDismiss, onCreated, onSave
}) => {
  const [materiaId, setMateriaId] = React.useState<number | undefined>(undefined);
  const [comisionId, setComisionId] = React.useState<number | undefined>(undefined);
  const [modalidad, setModalidad] = React.useState<string>('Presencial');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const reset = (): void => {
    setMateriaId(undefined);
    setComisionId(undefined);
    setModalidad('Presencial');
    setError(null);
  };

  const handleDismiss = (): void => {
    reset();
    onDismiss();
  };

  const materiaOptions: IDropdownOption[] = materias
    .sort((a, b) => (a.anio || 0) - (b.anio || 0) || a.nombre.localeCompare(b.nombre))
    .map(m => ({ key: m.Id, text: `${m.codMateria} — ${m.nombre}` + (m.anio ? ` (${m.anio}° año)` : '') }));

  const comisionOptions: IDropdownOption[] = comisiones
    .sort((a, b) => a.codComision.localeCompare(b.codComision))
    .map(c => ({ key: c.Id, text: `${c.codComision} — ${c.descripcion || ''}${c.diaSemana ? ' · ' + c.diaSemana : ''}${c.turno ? ' ' + c.turno : ''}` }));

  const handleGuardar = async (): Promise<void> => {
    if (!materiaId || !comisionId || !modalidad) {
      setError('Completá todos los campos.');
      return;
    }
    const yaExiste = existentes.some(o => o.codMateriaId === materiaId && o.codComisionId === comisionId);
    if (yaExiste) {
      setError('Ya existe una oferta con esta materia y comisión en el cuatrimestre actual.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const nueva = await onSave(materiaId, comisionId, modalidad);
      reset();
      onCreated(nueva);
    } catch (err) {
      setError('Error al guardar. Intentá de nuevo.');
      console.error('[FormOfertaMateria]', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel
      isOpen={isOpen}
      type={PanelType.medium}
      headerText={`Nueva oferta — ${CUATRIMESTRE_ACTUAL}° Cuatrimestre`}
      onDismiss={handleDismiss}
      isFooterAtBottom
      onRenderFooterContent={() => (
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          {saving ? (
            <Spinner size={SpinnerSize.small} />
          ) : (
            <>
              <PrimaryButton text="Guardar" onClick={handleGuardar} />
              <DefaultButton text="Cancelar" onClick={handleDismiss} />
            </>
          )}
        </Stack>
      )}
    >
      <Stack tokens={{ childrenGap: 16, padding: '16px 0' }}>
        {error && (
          <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setError(null)}>
            {error}
          </MessageBar>
        )}
        <Dropdown
          label="Materia"
          required
          placeholder="Seleccioná una materia"
          options={materiaOptions}
          selectedKey={materiaId}
          onChange={(_, opt) => setMateriaId(opt ? Number(opt.key) : undefined)}
        />
        <Dropdown
          label="Comisión"
          required
          placeholder="Seleccioná una comisión"
          options={comisionOptions}
          selectedKey={comisionId}
          onChange={(_, opt) => setComisionId(opt ? Number(opt.key) : undefined)}
        />
        <Dropdown
          label="Modalidad"
          required
          options={MODALIDADES}
          selectedKey={modalidad}
          onChange={(_, opt) => setModalidad(opt ? String(opt.key) : 'Presencial')}
        />
      </Stack>
    </Panel>
  );
};

export default FormOfertaMateria;
