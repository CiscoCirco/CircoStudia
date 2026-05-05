import * as React from 'react';
import { Stack, Text, Icon } from '@fluentui/react';
import OfertaDeMaterias from '../../../../core/entities/OfertaDeMaterias';
import CursaEn from '../../../../core/entities/CursaEn';
import Estudiante from '../../../../core/entities/Estudiante';
import ComisionRow from './ComisionRow';

interface IMateriaCardProps {
  ofertas: OfertaDeMaterias[];
  misCursas: CursaEn[];
  todasLasCursas: CursaEn[];
  estudianteActual: { Id: number } | null;
  estudiantes: Estudiante[];
  onInscribirse: (oferta: OfertaDeMaterias) => Promise<void>;
}

const MateriaCard: React.FC<IMateriaCardProps> = ({
  ofertas, misCursas, todasLasCursas, estudianteActual, estudiantes, onInscribirse
}) => {
  const [expanded, setExpanded] = React.useState(false);

  if (ofertas.length === 0) return null;

  const materia = ofertas[0].materia;
  const anioLabel = materia.anio ? `${materia.anio}° año` : '';
  const yaInscriptoEnAlguna = misCursas.some(c => ofertas.map(o => o.Id).includes(c.ofertaId));

  return (
    <Stack
      styles={{
        root: {
          border: `1px solid ${yaInscriptoEnAlguna ? '#28a745' : '#ddd'}`,
          borderRadius: 4,
          marginBottom: 8,
          overflow: 'hidden',
          background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }
      }}
    >
      <Stack
        horizontal
        verticalAlign="center"
        tokens={{ childrenGap: 12, padding: '10px 16px' }}
        styles={{ root: { cursor: 'pointer', userSelect: 'none', background: expanded ? '#f3f9ff' : 'white' } }}
        onClick={() => setExpanded(prev => !prev)}
      >
        <Icon
          iconName={expanded ? 'ChevronDown' : 'ChevronRight'}
          styles={{ root: { color: '#0078d4', fontSize: 12 } }}
        />
        <Stack tokens={{ childrenGap: 2 }} grow>
          <Stack horizontal tokens={{ childrenGap: 12 }} verticalAlign="center">
            <Text variant="medium" styles={{ root: { fontWeight: 600 } }}>{materia.nombre}</Text>
            {anioLabel && (
              <Text variant="small" styles={{ root: { color: '#666', background: '#f0f0f0', padding: '1px 6px', borderRadius: 10 } }}>
                {anioLabel}
              </Text>
            )}
            {yaInscriptoEnAlguna && (
              <Text variant="small" styles={{ root: { color: '#28a745', fontWeight: 600 } }}>✓ Inscripto</Text>
            )}
          </Stack>
          <Text variant="small" styles={{ root: { color: '#888' } }}>
            {materia.codMateria} — {ofertas.length} comisión{ofertas.length !== 1 ? 'es' : ''}
          </Text>
        </Stack>
      </Stack>
      {expanded && (
        <Stack styles={{ root: { padding: '8px 16px 12px 28px', borderTop: '1px solid #eee' } }}>
          {ofertas.map(oferta => (
            <ComisionRow
              key={oferta.Id}
              oferta={oferta}
              misCursas={misCursas}
              todasLasCursas={todasLasCursas}
              ofertasDeEstaMateria={ofertas}
              estudianteActual={estudianteActual}
              estudiantes={estudiantes}
              onInscribirse={onInscribirse}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default MateriaCard;
