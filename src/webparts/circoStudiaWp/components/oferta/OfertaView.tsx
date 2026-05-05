import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Spinner, SpinnerSize, MessageBar, MessageBarType } from '@fluentui/react';
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
import MateriaCarrera from '../../../../core/entities/MateriaCarrera';
import MateriaCard from './MateriaCard';
import Icon from '../shared/Icon';
import styles from '../CircoStudiaWp.module.scss';

const OfertaView: React.FC = () => {
  const { estudianteActual, isInitialLoading: userLoading } = useUser();

  const [ofertaMaterias, setOfertaMaterias] = useState<OfertaDeMaterias[]>([]);
  const [todasLasCursas, setTodasLasCursas] = useState<CursaEn[]>([]);
  const [misCursas, setMisCursas] = useState<CursaEn[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [materiaCarreras, setMateriaCarreras] = useState<MateriaCarrera[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState<number | null>(null);
  const [filtroTurno, setFiltroTurno] = useState('all');
  const [filtroModalidad, setFiltroModalidad] = useState('all');
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
        estudianteDS.getItems(),
      ]);
      const ofertaIds = new Set(ofertas.map(o => o.Id));
      setOfertaMaterias(ofertas);
      setTodasLasCursas(todasCursas.filter(c => ofertaIds.has(c.ofertaId)));
      setMisCursas(mis);
      setCarreras(cars);
      setMateriaCarreras(matCars);
      setEstudiantes(ests);
    } catch (err) {
      console.error('[OfertaView] Error:', err);
      setError('Error al cargar la oferta. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [userLoading, estudianteActual]);

  useEffect(() => { loadData().catch(console.error); }, [loadData]);

  const handleInscribirse = async (oferta: OfertaDeMaterias): Promise<void> => {
    if (!estudianteActual) return;
    const nuevaCursa = new CursaEn({ idEstudianteId: estudianteActual.Id, idOfertaId: oferta.Id });
    const result = await cursaEnDS.add(nuevaCursa) as CursaEn;
    setMisCursas(prev => [...prev, result]);
    setTodasLasCursas(prev => [...prev, result]);
  };

  // Group ofertas by materiaId
  const materiaEntries = React.useMemo((): Array<[number, OfertaDeMaterias[]]> => {
    const map: Record<number, OfertaDeMaterias[]> = {};
    ofertaMaterias.forEach(o => {
      const mid = o.materia.Id || o.codMateriaId;
      if (!map[mid]) map[mid] = [];
      map[mid].push(o);
    });
    return Object.keys(map).map(k => [Number(k), map[Number(k)]]);
  }, [ofertaMaterias]);

  const materiaIdsFiltrados = React.useMemo((): number[] | null => {
    if (carreraSeleccionada === null) return null;
    return materiaCarreras
      .filter(mc => mc.carreraId === carreraSeleccionada)
      .map(mc => mc.materiaId);
  }, [carreraSeleccionada, materiaCarreras]);

  const materiasAMostrar = React.useMemo((): Array<[number, OfertaDeMaterias[]]> => {
    return materiaEntries
      .filter(([materiaId, ofertas]) => {
        if (materiaIdsFiltrados !== null && !materiaIdsFiltrados.includes(materiaId)) return false;
        if (busqueda.trim()) {
          const q = busqueda.toLowerCase();
          const m = ofertas[0].materia;
          if (!m.nombre.toLowerCase().includes(q) && !m.codMateria.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const anioA = a[1][0].materia.anio || 99;
        const anioB = b[1][0].materia.anio || 99;
        if (anioA !== anioB) return anioA - anioB;
        return (a[1][0].materia.codMateria || '').localeCompare(b[1][0].materia.codMateria || '');
      });
  }, [materiaEntries, materiaIdsFiltrados, busqueda]);

  // Count for each carrera tab
  const countAll = materiaEntries.length;
  const countByCarrera = (carreraId: number): number => {
    const ids = materiaCarreras.filter(mc => mc.carreraId === carreraId).map(mc => mc.materiaId);
    return materiaEntries.filter(([mid]) => ids.includes(mid)).length;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <Spinner size={SpinnerSize.large} label="Cargando oferta de materias..." />
      </div>
    );
  }

  if (!loading && !error && ofertaMaterias.length === 0) {
    return <NoOfertaActiva />;
  }

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Oferta de materias</h1>
        <p className={styles.pageSub}>
          {CUATRIMESTRE_ACTUAL}° Cuatrimestre 2025 · Elegí carrera, filtrá por año y turno, y revisá comisiones.
        </p>
      </div>

      {error && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setError(null)} style={{ marginBottom: 16 }}>
          {error}
        </MessageBar>
      )}

      {/* Tabs + search */}
      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${carreraSeleccionada === null ? styles.tabActive : ''}`}
            onClick={() => setCarreraSeleccionada(null)}
          >
            Todas
            <span className={styles.tabCount}>{countAll}</span>
          </button>
          {carreras.map(c => (
            <button
              key={c.Id}
              className={`${styles.tab} ${carreraSeleccionada === c.Id ? styles.tabActive : ''}`}
              onClick={() => setCarreraSeleccionada(c.Id)}
            >
              {c.nombre || c.codCarrera}
              <span className={styles.tabCount}>{countByCarrera(c.Id)}</span>
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#5B6B82' }}>
          {materiasAMostrar.length} materia{materiasAMostrar.length !== 1 ? 's' : ''}
          {misCursas.length > 0 && ` · ${misCursas.length} inscripta${misCursas.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', borderRight: '1px solid #E6EAF0' }}>
          <Icon name="filter" size={14} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#5B6B82' }}>Filtros</span>
        </div>
        <select
          className={styles.select}
          value={filtroTurno}
          onChange={e => setFiltroTurno(e.target.value)}
        >
          <option value="all">Todos los turnos</option>
          <option value="M">Mañana</option>
          <option value="T">Tarde</option>
          <option value="N">Noche</option>
        </select>
        <select
          className={styles.select}
          value={filtroModalidad}
          onChange={e => setFiltroModalidad(e.target.value)}
        >
          <option value="all">Toda modalidad</option>
          <option value="Presencial">Presencial</option>
          <option value="Virtual">Virtual</option>
          <option value="Híbrida">Híbrida</option>
          <option value="Semipresencial">Semipresencial</option>
        </select>
        <div style={{ flex: 1 }} />
        <input
          className={styles.input}
          placeholder="Buscar materia o código…"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ minWidth: 220 }}
        />
      </div>

      {/* Materia groups */}
      <div>
        {materiasAMostrar.length === 0 ? (
          <div className={styles.card}>
            <div className={styles.cardBody}>
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🔍</div>
                No hay materias que coincidan con los filtros.
              </div>
            </div>
          </div>
        ) : (
          materiasAMostrar.map(([materiaId, ofertas]) => {
            const filteredOfertas = ofertas.filter(o => {
              if (filtroTurno !== 'all' && o.comision.turno !== filtroTurno) return false;
              if (filtroModalidad !== 'all' && o.modalidad !== filtroModalidad) return false;
              return true;
            });
            if (filteredOfertas.length === 0) return null;
            return (
              <MateriaCard
                key={materiaId}
                ofertas={filteredOfertas}
                misCursas={misCursas}
                todasLasCursas={todasLasCursas}
                estudianteActual={estudianteActual}
                estudiantes={estudiantes}
                onInscribirse={handleInscribirse}
              />
            );
          })
        )}
      </div>
    </>
  );
};

export default OfertaView;
