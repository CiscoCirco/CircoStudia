import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Text, Spinner, SpinnerSize, MessageBar, MessageBarType, DefaultButton, PrimaryButton } from '@fluentui/react';
import { useUser } from '../../contexts/UserContext';
import { CUATRIMESTRE_ACTUAL } from '../../../../core/utils/Constants';
import OfertaDeMaterias from '../../../../core/entities/OfertaDeMaterias';
import CursaEn from '../../../../core/entities/CursaEn';
import Estudiante from '../../../../core/entities/Estudiante';
import OfertaDeMateriaDatasource from '../../../../core/api/ofertaDeMaterias/OfertaDeMateriaDatasource';
import CursaEnDatasource from '../../../../core/api/cursaEn/CursaEnDatasource';
import EstudianteDatasource from '../../../../core/api/estudiante/EstudianteDatasource';
import InscripcionCard from './InscripcionCard';

const MisInscripciones: React.FC = () => {
  const navigate = useNavigate();
  const { estudianteActual, isInitialLoading: userLoading } = useUser();

  const [misCursas, setMisCursas] = useState<CursaEn[]>([]);
  const [ofertaMap, setOfertaMap] = useState<Record<number, OfertaDeMaterias>>({});
  const [todasLasCursas, setTodasLasCursas] = useState<CursaEn[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ofertaDS = React.useMemo(() => new OfertaDeMateriaDatasource(), []);
  const cursaEnDS = React.useMemo(() => new CursaEnDatasource(), []);
  const estudianteDS = React.useMemo(() => new EstudianteDatasource(), []);

  const loadData = useCallback(async (): Promise<void> => {
    if (userLoading) return;
    if (!estudianteActual) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const [mis, ofertas, todasCursas, ests] = await Promise.all([
        cursaEnDS.getByEstudianteId(estudianteActual.Id),
        ofertaDS.getByCuatrimestre(CUATRIMESTRE_ACTUAL),
        cursaEnDS.getAllFlat(),
        estudianteDS.getItems()
      ]);

      // Build a map ofertaId → OfertaDeMaterias for quick lookup
      const map: Record<number, OfertaDeMaterias> = {};
      ofertas.forEach(o => { map[o.Id] = o; });

      // Keep only cursas that belong to current cuatrimestre offerings
      const misActuales = mis.filter(c => map[c.ofertaId] !== undefined);

      // Filter todasCursas to only current cuatrimestre offerings
      const ofertaIds = new Set(ofertas.map(o => o.Id));
      const cursasDeEsteC = todasCursas.filter(c => ofertaIds.has(c.ofertaId));

      setMisCursas(misActuales);
      setOfertaMap(map);
      setTodasLasCursas(cursasDeEsteC);
      setEstudiantes(ests);
    } catch (err) {
      console.error('[MisInscripciones] Error al cargar datos:', err);
      setError('Error al cargar tus inscripciones. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [userLoading, estudianteActual]);

  useEffect(() => {
    loadData().catch(console.error);
  }, [loadData]);

  const handleCancelar = async (cursaId: number): Promise<void> => {
    await cursaEnDS.delete(cursaId);
    setMisCursas(prev => prev.filter(c => c.Id !== cursaId));
    setTodasLasCursas(prev => prev.filter(c => c.Id !== cursaId));
  };

  if (loading) {
    return (
      <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { height: 200 } }}>
        <Spinner size={SpinnerSize.large} label="Cargando tus inscripciones..." />
      </Stack>
    );
  }

  return (
    <Stack tokens={{ padding: 24, childrenGap: 16 }}>
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }}>
        <DefaultButton iconProps={{ iconName: 'Back' }} text="Inicio" onClick={() => navigate('/')} />
        <Text variant="xLarge">Mis Inscripciones — {CUATRIMESTRE_ACTUAL}° Cuatrimestre</Text>
      </Stack>

      {error && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setError(null)}>
          {error}
        </MessageBar>
      )}

      {!estudianteActual ? (
        <MessageBar messageBarType={MessageBarType.warning}>
          No se encontró tu perfil de estudiante. Contactá al administrador.
        </MessageBar>
      ) : misCursas.length === 0 ? (
        <Stack horizontalAlign="center" tokens={{ childrenGap: 16, padding: 32 }}>
          <Text variant="large" styles={{ root: { color: '#555' } }}>No tenés inscripciones activas este cuatrimestre.</Text>
          <PrimaryButton
            iconProps={{ iconName: 'Education' }}
            text="Ver Oferta de Materias"
            onClick={() => navigate('/oferta')}
          />
        </Stack>
      ) : (
        <>
          <Text variant="small" styles={{ root: { color: '#666' } }}>
            {misCursas.length} inscripción{misCursas.length !== 1 ? 'es' : ''} activa{misCursas.length !== 1 ? 's' : ''}
          </Text>
          <Stack>
            {misCursas.map(cursa => {
              const oferta = ofertaMap[cursa.ofertaId];
              if (!oferta) return null;
              return (
                <InscripcionCard
                  key={cursa.Id}
                  cursa={cursa}
                  oferta={oferta}
                  todasLasCursas={todasLasCursas}
                  miEstudianteId={estudianteActual.Id}
                  estudiantes={estudiantes}
                  onCancelar={handleCancelar}
                />
              );
            })}
          </Stack>
        </>
      )}
    </Stack>
  );
};

export default MisInscripciones;
