import * as React from 'react';
import { Stack, Text, DefaultButton, PrimaryButton, Spinner, SpinnerSize, Icon } from '@fluentui/react';
import OfertaDeMaterias from '../../../../core/entities/OfertaDeMaterias';
import CursaEn from '../../../../core/entities/CursaEn';
import Estudiante from '../../../../core/entities/Estudiante';
import ColegasEnComision from './ColegasEnComision';

interface IComisionRowProps {
  oferta: OfertaDeMaterias;
  misCursas: CursaEn[];
  todasLasCursas: CursaEn[];
  ofertasDeEstaMateria: OfertaDeMaterias[];
  estudianteActual: { Id: number } | null;
  estudiantes: Estudiante[];
  onInscribirse: (oferta: OfertaDeMaterias) => Promise<void>;
}

const ComisionRow: React.FC<IComisionRowProps> = ({
  oferta, misCursas, todasLasCursas, ofertasDeEstaMateria, estudianteActual, estudiantes, onInscribirse
}) => {
  const [loading, setLoading] = React.useState(false);
  const [expandColegas, setExpandColegas] = React.useState(false);

  const yaInscripto = misCursas.some(c => c.ofertaId === oferta.Id);
  const ofertaIdsDeEstaMateria = ofertasDeEstaMateria.map(o => o.Id);
  const yaTomaEstaMateria = !yaInscripto && misCursas.some(c => ofertaIdsDeEstaMateria.includes(c.ofertaId));
  const inscriptosCount = todasLasCursas.filter(c => c.ofertaId === oferta.Id).length;

  const handleInscribirse = async (): Promise<void> => {
    setLoading(true);
    try {
      await onInscribirse(oferta);
    } finally {
      setLoading(false);
    }
  };

  const turnoMap: Record<string, string> = { M: 'Mañana', T: 'Tarde', N: 'Noche' };

  return (
    <Stack
      styles={{
        root: {
          borderLeft: '3px solid #0078d4',
          paddingLeft: 12,
          paddingTop: 8,
          paddingBottom: 8,
          marginBottom: 8,
          background: yaInscripto ? '#e6f3e6' : 'white'
        }
      }}
      tokens={{ childrenGap: 6 }}
    >
      <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center" wrap>
        <Stack tokens={{ childrenGap: 2 }} styles={{ root: { minWidth: 120 } }}>
          <Text variant="medium" styles={{ root: { fontWeight: 600 } }}>{oferta.comision.codComision}</Text>
          <Text variant="small" styles={{ root: { color: '#444' } }}>{oferta.comision.descripcion}</Text>
        </Stack>
        <Stack tokens={{ childrenGap: 2 }} styles={{ root: { minWidth: 100 } }}>
          {oferta.comision.diaSemana && (
            <Stack horizontal tokens={{ childrenGap: 4 }} verticalAlign="center">
              <Icon iconName="Calendar" styles={{ root: { color: '#666', fontSize: 12 } }} />
              <Text variant="small">{oferta.comision.diaSemana}</Text>
            </Stack>
          )}
          {oferta.comision.turno && (
            <Text variant="small" styles={{ root: { color: '#666' } }}>
              {turnoMap[oferta.comision.turno] || oferta.comision.turno}
            </Text>
          )}
        </Stack>
        <Stack tokens={{ childrenGap: 2 }} styles={{ root: { minWidth: 120 } }}>
          <Text variant="small" styles={{ root: { color: '#555' } }}>{oferta.modalidad}</Text>
          <DefaultButton
            styles={{ root: { height: 20, padding: 0, border: 'none', minWidth: 'auto' } }}
            text={`${inscriptosCount} inscriptos`}
            onClick={() => setExpandColegas(prev => !prev)}
            iconProps={{ iconName: expandColegas ? 'ChevronUp' : 'ChevronDown' }}
          />
        </Stack>
        <Stack styles={{ root: { marginLeft: 'auto' } }}>
          {loading ? (
            <Spinner size={SpinnerSize.small} />
          ) : yaInscripto ? (
            <DefaultButton
              text="Inscripto ✓"
              disabled
              styles={{ root: { background: '#d4edda', border: 'none', color: '#155724' } }}
            />
          ) : yaTomaEstaMateria ? (
            <DefaultButton text="Ya cursás esta materia" disabled />
          ) : estudianteActual ? (
            <PrimaryButton text="Inscribirse" onClick={handleInscribirse} />
          ) : null}
        </Stack>
      </Stack>
      {expandColegas && (
        <ColegasEnComision
          ofertaId={oferta.Id}
          miEstudianteId={estudianteActual?.Id || 0}
          todasLasCursas={todasLasCursas}
          estudiantes={estudiantes}
        />
      )}
    </Stack>
  );
};

export default ComisionRow;
