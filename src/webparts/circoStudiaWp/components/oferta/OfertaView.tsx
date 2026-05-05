import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Text, Spinner, SpinnerSize, MessageBar, MessageBarType, DefaultButton, SearchBox } from '@fluentui/react';
import NoOfertaActiva from '../noOfertaActiva/NoOfertaActiva';
import { useUser } from '../../contexts/UserContext';
import { CUATRIMESTRE_ACTUAL } from '../../../../core/utils/Constants';
import OfertaDeMaterias from '../../../../core/entities/OfertaDeMaterias';
import CursaEn from '../../../../core/entities/CursaEn';
import Carrera from '../../../../core/entities/Carrera';
import Estudiante from '../../../../core/entities/Estudiante';
import OfertaDeMateriaDatasource from '../../../../core/api/ofertaDeMaterias/OfertaDeMateriaDatasource';
import CursaEnDatasource from '../../../../core/api/cursaEn/CursaEnDatasource';
import CarreraDatasource from '../../../../core/api/carrera/CarreraDatasource';
import MateriaCarreraDatasource from '../../../../core/api/materiaCarrera/MateriaCarreraDatasource';
import EstudianteDatasource from '../../../../core/api/estudiante/EstudianteDatasource';
import FiltroCarrera from './FiltroCarrera';
import MateriaCard from './MateriaCard';
import MateriaCarrera from '../../../../core/entities/MateriaCarrera';

const OfertaView: React.FC = () => {
  const navigate = useNavigate();
  const { estudianteActual, isInitialLoading: userLoading } = useUser();

  const [ofertaMaterias, setOfertaMaterias] = useState<OfertaDeMaterias[]>([]);
  const [todasLasCursas, setTodasLasCursas] = useState<CursaEn[]>([]);
  const [misCursas, setMisCursas] = useState<CursaEn[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [materiaCarreras, setMateriaCarreras] = useState<MateriaCarrera[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ofertaDS = React.useMemo(() => new OfertaDeMateriaDatasource(), []);
  const cursaEnDS = React.useMemo(() => new CursaEnDatasource(), []);
  const carreraDS = React.useMemo(() => new CarreraDatasource(), []);
  const materiaCarreraDS = React.useMemo(() => new MateriaCarreraDatasource(), []);
  const estudianteDS = React.useMemo(() => new EstudianteDatasource(), []);

  const loadData = useCallback(async (): Promise<void> => {
    if (userLoading) return;
    try {
      setLoading(true);
      setError(null);

      const [ofertas, todasCursas, mis, cars, matCars, ests] = await Promise.all([
        ofertaDS.getByCuatrimestre(CUATRIMESTRE_ACTUAL),
        cursaEnDS.getAllFlat(),
        estudianteActual ? cursaEnDS.getByEstudianteId(estudianteActual.Id) : Promise.resolve([]),
        carreraDS.getItems(),
        materiaCarreraDS.getItems(),
        estudianteDS.getItems()
      ]);

      // Filter todasCursas to only those belonging to current cuatrimestre offerings
      const ofertaIds = new Set(ofertas.map(o => o.Id));
      const cursasDeEsteC = todasCursas.filter(c => ofertaIds.has(c.ofertaId));

      setOfertaMaterias(ofertas);
      setTodasLasCursas(cursasDeEsteC);
      setMisCursas(mis);
      setCarreras(cars);
      setMateriaCarreras(matCars);
      setEstudiantes(ests);
    } catch (err) {
      console.error('[OfertaView] Error al cargar datos:', err);
      setError('Error al cargar la oferta. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [userLoading, estudianteActual]);

  useEffect(() => {
    loadData().catch(console.error);
  }, [loadData]);

  const handleInscribirse = async (oferta: OfertaDeMaterias): Promise<void> => {
    if (!estudianteActual) return;
    const nuevaCursa = new CursaEn({ idEstudianteId: estudianteActual.Id, idOfertaId: oferta.Id });
    const result = await cursaEnDS.add(nuevaCursa) as CursaEn;
    setMisCursas(prev => [...prev, result]);
    setTodasLasCursas(prev => [...prev, result]);
  };

  // Group ofertas by materiaId → array of [materiaId, OfertaDeMaterias[]]
  const materiaEntries = React.useMemo((): Array<[number, OfertaDeMaterias[]]> => {
    const map: Record<number, OfertaDeMaterias[]> = {};
    ofertaMaterias.forEach(o => {
      const mid = o.materia.Id || o.codMateriaId;
      if (!map[mid]) map[mid] = [];
      map[mid].push(o);
    });
    return Object.keys(map).map(k => [Number(k), map[Number(k)]]);
  }, [ofertaMaterias]);

  // Get materia IDs for selected carrera
  const materiaIdsFiltrados = React.useMemo((): number[] | null => {
    if (carreraSeleccionada === null) return null;
    return materiaCarreras
      .filter(mc => mc.carreraId === carreraSeleccionada)
      .map(mc => mc.materiaId);
  }, [carreraSeleccionada, materiaCarreras]);

  // Apply filters
  const materiasAMostrar = React.useMemo((): Array<[number, OfertaDeMaterias[]]> => {
    return materiaEntries.filter(([materiaId, ofertas]) => {
      if (materiaIdsFiltrados !== null && !materiaIdsFiltrados.includes(materiaId)) return false;
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        const m = ofertas[0].materia;
        return m.nombre.toLowerCase().includes(q) || m.codMateria.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => {
      const anioA = a[1][0].materia.anio || 99;
      const anioB = b[1][0].materia.anio || 99;
      if (anioA !== anioB) return anioA - anioB;
      return (a[1][0].materia.codMateria || '').localeCompare(b[1][0].materia.codMateria || '');
    });
  }, [materiaEntries, materiaIdsFiltrados, busqueda]);

  if (loading) {
    return (
      <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { height: 200 } }}>
        <Spinner size={SpinnerSize.large} label="Cargando oferta de materias..." />
      </Stack>
    );
  }

  if (!loading && !error && ofertaMaterias.length === 0) {
    return <NoOfertaActiva />;
  }

  return (
    <Stack tokens={{ padding: 24, childrenGap: 16 }}>
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }}>
        <DefaultButton iconProps={{ iconName: 'Back' }} text="Inicio" onClick={() => navigate('/')} />
        <Text variant="xLarge">Oferta de Materias — {CUATRIMESTRE_ACTUAL}° Cuatrimestre</Text>
      </Stack>

      {error && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setError(null)}>
          {error}
        </MessageBar>
      )}

      <FiltroCarrera
        carreras={carreras}
        carreraSeleccionada={carreraSeleccionada}
        onCarreraChange={setCarreraSeleccionada}
      />

      <SearchBox
        placeholder="Buscar por nombre o código de materia..."
        value={busqueda}
        onChange={(_, v) => setBusqueda(v || '')}
        styles={{ root: { maxWidth: 400 } }}
      />

      <Text variant="small" styles={{ root: { color: '#666' } }}>
        {materiasAMostrar.length} materia{materiasAMostrar.length !== 1 ? 's' : ''} encontrada{materiasAMostrar.length !== 1 ? 's' : ''}
        {misCursas.length > 0 && ` · ${misCursas.length} inscripción${misCursas.length !== 1 ? 'es' : ''} activa${misCursas.length !== 1 ? 's' : ''}`}
      </Text>

      <Stack>
        {materiasAMostrar.map(([materiaId, ofertas]) => (
          <MateriaCard
            key={materiaId}
            ofertas={ofertas}
            misCursas={misCursas}
            todasLasCursas={todasLasCursas}
            estudianteActual={estudianteActual}
            estudiantes={estudiantes}
            onInscribirse={handleInscribirse}
          />
        ))}
        {materiasAMostrar.length === 0 && (busqueda.trim() || carreraSeleccionada !== null) && (
          <Text styles={{ root: { color: '#888', textAlign: 'center', paddingTop: 32 } }}>
            No hay materias que coincidan con el filtro.
          </Text>
        )}
      </Stack>
    </Stack>
  );
};

export default OfertaView;
