import * as React from 'react';
import { Stack, Text, Persona, PersonaSize } from '@fluentui/react';
import CursaEn from '../../../../core/entities/CursaEn';
import Estudiante from '../../../../core/entities/Estudiante';

interface IColegasEnComisionProps {
  ofertaId: number;
  miEstudianteId: number;
  todasLasCursas: CursaEn[];
  estudiantes: Estudiante[];
}

const ColegasEnComision: React.FC<IColegasEnComisionProps> = ({ ofertaId, miEstudianteId, todasLasCursas, estudiantes }) => {
  const colegas = todasLasCursas
    .filter(c => c.ofertaId === ofertaId && c.estudianteId !== miEstudianteId)
    .map(c => estudiantes.find(e => e.Id === c.estudianteId))
    .filter((e): e is Estudiante => e !== undefined);

  if (colegas.length === 0) {
    return <Text variant="small" styles={{ root: { color: '#666', paddingTop: 4 } }}>Sin compañeros inscriptos aún.</Text>;
  }

  return (
    <Stack tokens={{ childrenGap: 6 }}>
      <Text variant="small" styles={{ root: { color: '#666' } }}>Compañeros inscriptos ({colegas.length}):</Text>
      <Stack horizontal wrap tokens={{ childrenGap: 8 }}>
        {colegas.map(e => (
          <Persona
            key={e.Id}
            text={e.usuarioNombre || e.emailPersonal}
            secondaryText={e.emailPersonal}
            size={PersonaSize.size24}
            styles={{ root: { maxWidth: 180 } }}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export default ColegasEnComision;
