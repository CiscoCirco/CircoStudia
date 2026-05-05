import * as React from 'react';
import {
  Stack, Text, Icon, DefaultButton, Spinner, SpinnerSize,
  Dialog, DialogType, DialogFooter, PrimaryButton
} from '@fluentui/react';
import OfertaDeMaterias from '../../../../core/entities/OfertaDeMaterias';
import CursaEn from '../../../../core/entities/CursaEn';
import Estudiante from '../../../../core/entities/Estudiante';
import ColegasEnComision from '../oferta/ColegasEnComision';

interface IInscripcionCardProps {
  cursa: CursaEn;
  oferta: OfertaDeMaterias;
  todasLasCursas: CursaEn[];
  miEstudianteId: number;
  estudiantes: Estudiante[];
  onCancelar: (cursaId: number) => Promise<void>;
}

const InscripcionCard: React.FC<IInscripcionCardProps> = ({
  cursa, oferta, todasLasCursas, miEstudianteId, estudiantes, onCancelar
}) => {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [expandColegas, setExpandColegas] = React.useState(false);

  const { materia, comision, modalidad } = oferta;
  const turnoMap: Record<string, string> = { M: 'Mañana', T: 'Tarde', N: 'Noche' };
  const inscriptosCount = todasLasCursas.filter(c => c.ofertaId === oferta.Id).length;

  const handleConfirmCancelar = async (): Promise<void> => {
    setLoading(true);
    setConfirmOpen(false);
    try {
      await onCancelar(cursa.Id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack
      styles={{
        root: {
          border: '1px solid #28a745',
          borderRadius: 4,
          marginBottom: 8,
          background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }
      }}
    >
      <Stack tokens={{ padding: '12px 16px', childrenGap: 8 }}>
        {/* Header: materia */}
        <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 10 }}>
          <Icon iconName="Education" styles={{ root: { color: '#28a745', fontSize: 16 } }} />
          <Stack tokens={{ childrenGap: 2 }} grow>
            <Stack horizontal tokens={{ childrenGap: 10 }} verticalAlign="center">
              <Text variant="medium" styles={{ root: { fontWeight: 600 } }}>{materia.nombre}</Text>
              {materia.anio > 0 && (
                <Text variant="small" styles={{ root: { color: '#666', background: '#f0f0f0', padding: '1px 6px', borderRadius: 10 } }}>
                  {materia.anio}° año
                </Text>
              )}
            </Stack>
            <Text variant="small" styles={{ root: { color: '#888' } }}>{materia.codMateria}</Text>
          </Stack>
        </Stack>

        {/* Comision details */}
        <Stack
          horizontal wrap
          tokens={{ childrenGap: 16 }}
          styles={{ root: { paddingLeft: 26, borderLeft: '3px solid #0078d4', marginLeft: 8 } }}
        >
          <Stack tokens={{ childrenGap: 2 }}>
            <Text variant="small" styles={{ root: { fontWeight: 600 } }}>{comision.codComision}</Text>
            <Text variant="small" styles={{ root: { color: '#555' } }}>{comision.descripcion}</Text>
          </Stack>
          {comision.diaSemana && (
            <Stack horizontal tokens={{ childrenGap: 4 }} verticalAlign="center">
              <Icon iconName="Calendar" styles={{ root: { color: '#666', fontSize: 12 } }} />
              <Text variant="small">{comision.diaSemana}</Text>
            </Stack>
          )}
          {comision.turno && (
            <Text variant="small" styles={{ root: { color: '#666' } }}>
              {turnoMap[comision.turno] || comision.turno}
            </Text>
          )}
          <Text variant="small" styles={{ root: { color: '#555' } }}>{modalidad}</Text>
        </Stack>

        {/* Colegas toggle + cancel button */}
        <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }} styles={{ root: { paddingTop: 4 } }}>
          <DefaultButton
            styles={{ root: { height: 24, padding: '0 8px', border: 'none', minWidth: 'auto' } }}
            text={`${inscriptosCount} inscriptos`}
            onClick={() => setExpandColegas(prev => !prev)}
            iconProps={{ iconName: expandColegas ? 'ChevronUp' : 'ChevronDown' }}
          />
          <Stack styles={{ root: { marginLeft: 'auto' } }}>
            {loading ? (
              <Spinner size={SpinnerSize.small} />
            ) : (
              <DefaultButton
                text="Cancelar inscripción"
                iconProps={{ iconName: 'Cancel' }}
                styles={{ root: { color: '#d32f2f', borderColor: '#d32f2f' } }}
                onClick={() => setConfirmOpen(true)}
              />
            )}
          </Stack>
        </Stack>

        {expandColegas && (
          <Stack styles={{ root: { paddingLeft: 4 } }}>
            <ColegasEnComision
              ofertaId={oferta.Id}
              miEstudianteId={miEstudianteId}
              todasLasCursas={todasLasCursas}
              estudiantes={estudiantes}
            />
          </Stack>
        )}
      </Stack>

      <Dialog
        hidden={!confirmOpen}
        onDismiss={() => setConfirmOpen(false)}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Cancelar inscripción',
          subText: `¿Confirmás que querés cancelar tu inscripción a ${materia.nombre} — Comisión ${comision.codComision}?`
        }}
      >
        <DialogFooter>
          <PrimaryButton
            text="Sí, cancelar"
            styles={{ root: { background: '#d32f2f', border: 'none' } }}
            onClick={handleConfirmCancelar}
          />
          <DefaultButton text="No, volver" onClick={() => setConfirmOpen(false)} />
        </DialogFooter>
      </Dialog>
    </Stack>
  );
};

export default InscripcionCard;
