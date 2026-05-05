import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { useUser } from '../../contexts/UserContext';
import { CUATRIMESTRE_ACTUAL } from '../../../../core/utils/Constants';
import OfertaDeMateriaDatasource from '../../../../core/api/ofertaDeMaterias/OfertaDeMateriaDatasource';
import CursaEnDatasource from '../../../../core/api/cursaEn/CursaEnDatasource';
import EstudianteDatasource from '../../../../core/api/estudiante/EstudianteDatasource';
import OfertaDeMaterias from '../../../../core/entities/OfertaDeMaterias';
import CursaEn from '../../../../core/entities/CursaEn';
import Estudiante from '../../../../core/entities/Estudiante';
import Icon, { avatarColor, getInitials, parseDiasToIndices, turnoToSlotIndex, turnoLabel } from '../shared/Icon';
import styles from '../CircoStudiaWp.module.scss';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const SLOTS = [
  { label: '08–12', turno: 'M' },
  { label: '14–18', turno: 'T' },
  { label: '19–23', turno: 'N' },
];

interface IScheduleEvent {
  oferta: OfertaDeMaterias;
  dayIdx: number;
  slotIdx: number;
}

function buildScheduleEvents(cursas: CursaEn[], ofertaMap: Record<number, OfertaDeMaterias>): IScheduleEvent[] {
  const events: IScheduleEvent[] = [];
  cursas.forEach(c => {
    const oferta = ofertaMap[c.ofertaId];
    if (!oferta) return;
    const dias = parseDiasToIndices(oferta.comision.diaSemana || '');
    const slotIdx = turnoToSlotIndex(oferta.comision.turno || '');
    console.log('[Schedule]', oferta.materia.nombre, '| diaSemana:', JSON.stringify(oferta.comision.diaSemana), '| turno:', JSON.stringify(oferta.comision.turno), '| dias:', dias, '| slot:', slotIdx);
    if (slotIdx < 0) return;
    dias.forEach(dayIdx => {
      events.push({ oferta, dayIdx, slotIdx });
    });
  });
  return events;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { estudianteActual, isInitialLoading: userLoading } = useUser();

  const [misCursas, setMisCursas] = useState<CursaEn[]>([]);
  const [ofertaMap, setOfertaMap] = useState<Record<number, OfertaDeMaterias>>({});
  const [todasLasCursas, setTodasLasCursas] = useState<CursaEn[]>([]);
  const [totalOfertas, setTotalOfertas] = useState(0);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);

  const ofertaDS = React.useMemo(() => new OfertaDeMateriaDatasource(), []);
  const cursaEnDS = React.useMemo(() => new CursaEnDatasource(), []);
  const estudianteDS = React.useMemo(() => new EstudianteDatasource(), []);

  const loadData = useCallback(async (): Promise<void> => {
    if (userLoading || !estudianteActual) return;
    try {
      const [mis, ofertas, todasCursas, ests] = await Promise.all([
        cursaEnDS.getByEstudianteId(estudianteActual.Id),
        ofertaDS.getByCuatrimestre(CUATRIMESTRE_ACTUAL),
        cursaEnDS.getAllFlat(),
        estudianteDS.getItems(),
      ]);

      const map: Record<number, OfertaDeMaterias> = {};
      ofertas.forEach(o => { map[o.Id] = o; });

      const ofertaIds = new Set(ofertas.map(o => o.Id));
      const cursasActuales = todasCursas.filter(c => ofertaIds.has(c.ofertaId));

      setMisCursas(mis.filter(c => map[c.ofertaId]));
      setOfertaMap(map);
      setTodasLasCursas(cursasActuales);
      setTotalOfertas(ofertas.length);
      setEstudiantes(ests);
    } catch (err) {
      console.error('[Home] Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  }, [userLoading, estudianteActual]);

  useEffect(() => { loadData().catch(console.error); }, [loadData]);

  const nombre = estudianteActual?.Title || 'estudiante';
  const firstName = nombre.split(' ')[0];

  const colegasUnicos = React.useMemo(() => {
    const set = new Set<number>();
    misCursas.forEach(c => {
      todasLasCursas
        .filter(tc => tc.ofertaId === c.ofertaId && tc.estudianteId !== estudianteActual?.Id)
        .forEach(tc => set.add(tc.estudianteId));
    });
    return set;
  }, [misCursas, todasLasCursas, estudianteActual]);

  const topCoinc = React.useMemo(() => {
    return misCursas
      .map(c => {
        const oferta = ofertaMap[c.ofertaId];
        if (!oferta) return null;
        const peers = todasLasCursas
          .filter(tc => tc.ofertaId === c.ofertaId && tc.estudianteId !== estudianteActual?.Id)
          .map(tc => estudiantes.find(e => e.Id === tc.estudianteId))
          .filter((e): e is Estudiante => e !== undefined);
        return { oferta, peers };
      })
      .filter((x): x is { oferta: OfertaDeMaterias; peers: Estudiante[] } => x !== null && x.peers.length > 0)
      .sort((a, b) => b.peers.length - a.peers.length)
      .slice(0, 3);
  }, [misCursas, ofertaMap, todasLasCursas, estudiantes, estudianteActual]);

  const scheduleEvents = React.useMemo(() => buildScheduleEvents(misCursas, ofertaMap), [misCursas, ofertaMap]);

  const eventAt = (dayIdx: number, slotIdx: number): OfertaDeMaterias | undefined =>
    scheduleEvents.find(e => e.dayIdx === dayIdx && e.slotIdx === slotIdx)?.oferta;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Spinner size={SpinnerSize.large} label="Cargando..." />
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div style={{ fontSize: 12, opacity: .8, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>
            {CUATRIMESTRE_ACTUAL}° Cuatrimestre 2025
          </div>
          <h1 className={styles.heroTitle}>¡Hola, {firstName}!</h1>
          <p className={styles.heroSub}>
            La inscripción está abierta.
            {colegasUnicos.size > 0
              ? ` Ya hay ${colegasUnicos.size} colega${colegasUnicos.size !== 1 ? 's' : ''} cursando materias que podés compartir.`
              : ' Inscribite a materias para ver con qué colegas coincidís.'}
          </p>
          <div className={styles.heroStats}>
            <div>
              <div className={styles.heroStatN}>{misCursas.length}</div>
              <div className={styles.heroStatL}>Inscripciones</div>
            </div>
            <div>
              <div className={styles.heroStatN}>{colegasUnicos.size}</div>
              <div className={styles.heroStatL}>Colegas en común</div>
            </div>
            <div>
              <div className={styles.heroStatN}>{CUATRIMESTRE_ACTUAL}</div>
              <div className={styles.heroStatL}>Cuatrimestre</div>
            </div>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <button
            className={`${styles.btn} ${styles.btnWhite} ${styles.btnLg}`}
            onClick={() => navigate('/mis-inscripciones')}
          >
            <Icon name="plus" size={16} />
            Mis inscripciones
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpi}>
          <div className={styles.kpiIcon} style={{ background: '#E6F6EF', color: '#066B4C' }}>
            <Icon name="book" size={18} />
          </div>
          <div className={styles.kpiLabel}>Comisiones disponibles</div>
          <div className={styles.kpiValue}>{totalOfertas}</div>
          <div className={styles.kpiTrend}>en la oferta actual</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiIcon} style={{ background: '#EFE8FA', color: '#7C5AC9' }}>
            <Icon name="users" size={18} />
          </div>
          <div className={styles.kpiLabel}>Colegas de Circo</div>
          <div className={styles.kpiValue}>{estudiantes.length}</div>
          <div className={styles.kpiTrend}>estudiantes registrados</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiIcon} style={{ background: '#FDF1DE', color: '#A1640D' }}>
            <Icon name="calendar" size={18} />
          </div>
          <div className={styles.kpiLabel}>Mis materias</div>
          <div className={styles.kpiValue}>{misCursas.length}</div>
          <div className={styles.kpiTrend}>inscripciones activas</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiIcon} style={{ background: '#E6E9FB', color: '#3E4CC8' }}>
            <Icon name="sparkle" size={18} />
          </div>
          <div className={styles.kpiLabel}>Coincidencias</div>
          <div className={styles.kpiValue}>{colegasUnicos.size}</div>
          <div className={styles.kpiTrend}>con tu inscripción actual</div>
        </div>
      </div>

      {/* Schedule + Top coincidencias */}
      <div className={styles.twoCol}>
        {/* Schedule grid */}
        <div>
          <h3 className={styles.sectionTitle}>Tu horario semanal</h3>
          <div className={styles.schedule}>
            <div className={styles.scheduleHead} />
            {DAYS.map(d => (
              <div key={d} className={styles.scheduleHead}>{d.slice(0, 3)}</div>
            ))}
            {SLOTS.map((slot, slotIdx) => (
              <React.Fragment key={slot.turno}>
                <div className={styles.scheduleTimeCell}>{slot.label}</div>
                {[0, 1, 2, 3, 4, 5].map(dayIdx => {
                  const ev = eventAt(dayIdx, slotIdx);
                  return (
                    <div key={dayIdx} className={styles.scheduleCell}>
                      {ev && (
                        <div className={styles.scheduleEvent}>
                          <div>{ev.materia.nombre}</div>
                          <small>{ev.comision.codComision} · {ev.modalidad.split(' ')[0]}</small>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Top coincidencias */}
        <div>
          <h3 className={styles.sectionTitle}>Top coincidencias</h3>
          {topCoinc.length === 0 ? (
            <div className={styles.card}>
              <div className={styles.cardBody}>
                <div className={styles.empty}>
                  <div className={styles.emptyIcon}>🔍</div>
                  <div>Inscribite a materias para ver con qué colegas coincidís.</div>
                  <div style={{ marginTop: 14 }}>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => navigate('/oferta')}>
                      Ver oferta
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            topCoinc.map(({ oferta, peers }) => (
              <div key={oferta.Id} className={styles.coincCard} style={{ marginBottom: 12 }}>
                <div className={styles.coincCardHead}>
                  <div className={styles.coincCardTitle}>{oferta.materia.nombre}</div>
                  <div className={styles.coincCardCount}>{peers.length}</div>
                </div>
                <div style={{ fontSize: 12, color: '#5B6B82', marginBottom: 10 }}>
                  {oferta.comision.codComision} · {turnoLabel(oferta.comision.turno)} · {oferta.modalidad}
                </div>
                <div className={styles.coincPeople}>
                  {peers.slice(0, 3).map(p => (
                    <div key={p.Id} className={styles.coincPerson}>
                      <div
                        className={`${styles.avatar} ${styles.avatarLg}`}
                        style={{ background: avatarColor(p.Id) }}
                      >
                        {getInitials(p.usuarioNombre || p.emailPersonal)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className={styles.coincPersonName}>{p.usuarioNombre || p.emailPersonal}</div>
                        <div className={styles.coincPersonMeta}>{p.emailPersonal}</div>
                      </div>
                    </div>
                  ))}
                  {peers.length > 3 && (
                    <div style={{ fontSize: 12, color: '#5B6B82', textAlign: 'center', paddingTop: 4 }}>
                      +{peers.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {topCoinc.length > 0 && (
            <button
              className={`${styles.btn} ${styles.btnGhost}`}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              onClick={() => navigate('/coincidencias')}
            >
              <Icon name="users" size={14} />
              Ver todas las coincidencias
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
