import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, SpinnerSize, MessageBar, MessageBarType } from '@fluentui/react';
import { useUser } from '../../contexts/UserContext';
import { CUATRIMESTRE_ACTUAL } from '../../../../core/utils/Constants';
import OfertaDeMaterias from '../../../../core/entities/OfertaDeMaterias';
import CursaEn from '../../../../core/entities/CursaEn';
import Estudiante from '../../../../core/entities/Estudiante';
import OfertaDeMateriaDatasource from '../../../../core/api/ofertaDeMaterias/OfertaDeMateriaDatasource';
import CursaEnDatasource from '../../../../core/api/cursaEn/CursaEnDatasource';
import EstudianteDatasource from '../../../../core/api/estudiante/EstudianteDatasource';
import Icon, { avatarColor, getInitials, parseDiasToIndices, turnoToSlotIndex } from '../shared/Icon';
import styles from '../CircoStudiaWp.module.scss';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const SLOTS = [
  { label: '08–12', turno: 'M' },
  { label: '14–18', turno: 'T' },
  { label: '19–23', turno: 'N' },
];

const MisInscripciones: React.FC = () => {
  const navigate = useNavigate();
  const { estudianteActual, isInitialLoading: userLoading } = useUser();

  const [misCursas, setMisCursas] = useState<CursaEn[]>([]);
  const [ofertaMap, setOfertaMap] = useState<Record<number, OfertaDeMaterias>>({});
  const [todasLasCursas, setTodasLasCursas] = useState<CursaEn[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ofertaDS = React.useMemo(() => new OfertaDeMateriaDatasource(), []);
  const cursaEnDS = React.useMemo(() => new CursaEnDatasource(), []);
  const estudianteDS = React.useMemo(() => new EstudianteDatasource(), []);

  const showToast = (msg: string): void => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const loadData = useCallback(async (): Promise<void> => {
    if (userLoading || !estudianteActual) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const [mis, ofertas, todasCursas, ests] = await Promise.all([
        cursaEnDS.getByEstudianteId(estudianteActual.Id),
        ofertaDS.getByCuatrimestre(CUATRIMESTRE_ACTUAL),
        cursaEnDS.getAllFlat(),
        estudianteDS.getItems(),
      ]);
      const map: Record<number, OfertaDeMaterias> = {};
      ofertas.forEach(o => { map[o.Id] = o; });
      const ofertaIds = new Set(ofertas.map(o => o.Id));
      setMisCursas(mis.filter(c => map[c.ofertaId]));
      setOfertaMap(map);
      setTodasLasCursas(todasCursas.filter(c => ofertaIds.has(c.ofertaId)));
      setEstudiantes(ests);
    } catch {
      setError('Error al cargar tus inscripciones. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [userLoading, estudianteActual]);

  useEffect(() => { loadData().catch(console.error); }, [loadData]);

  const handleCancelar = async (cursaId: number): Promise<void> => {
    await cursaEnDS.delete(cursaId);
    setMisCursas(prev => prev.filter(c => c.Id !== cursaId));
    setTodasLasCursas(prev => prev.filter(c => c.Id !== cursaId));
    showToast('Materia dada de baja');
  };

  const scheduleEvents = React.useMemo(() => {
    const events: Array<{ oferta: OfertaDeMaterias; dayIdx: number; slotIdx: number }> = [];
    misCursas.forEach(c => {
      const oferta = ofertaMap[c.ofertaId];
      if (!oferta) return;
      const dias = parseDiasToIndices(oferta.comision.diaSemana || '');
      const slotIdx = turnoToSlotIndex(oferta.comision.turno || '');
      if (slotIdx < 0) return;
      dias.forEach(dayIdx => events.push({ oferta, dayIdx, slotIdx }));
    });
    return events;
  }, [misCursas, ofertaMap]);

  const eventAt = (dayIdx: number, slotIdx: number): OfertaDeMaterias | undefined =>
    scheduleEvents.find(e => e.dayIdx === dayIdx && e.slotIdx === slotIdx)?.oferta;

  const totalColegasUnicos = React.useMemo(() => {
    const set = new Set<number>();
    misCursas.forEach(c => {
      todasLasCursas
        .filter(tc => tc.ofertaId === c.ofertaId && tc.estudianteId !== estudianteActual?.Id)
        .forEach(tc => set.add(tc.estudianteId));
    });
    return set.size;
  }, [misCursas, todasLasCursas, estudianteActual]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <Spinner size={SpinnerSize.large} label="Cargando tus inscripciones..." />
      </div>
    );
  }

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Mi inscripción</h1>
        <p className={styles.pageSub}>{CUATRIMESTRE_ACTUAL}° Cuatrimestre 2025 · Revisá tus materias y descubrí con qué colegas de Circo coincidís.</p>
      </div>

      {error && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setError(null)} style={{ marginBottom: 16 }}>
          {error}
        </MessageBar>
      )}

      {misCursas.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📚</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0F1B2D', marginBottom: 4 }}>
                Todavía no elegiste materias
              </div>
              <div style={{ fontSize: 13 }}>
                Explorá la oferta y agregá las comisiones que te queden bien de horario.
              </div>
              <div style={{ marginTop: 18 }}>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => navigate('/oferta')}>
                  <Icon name="plus" size={14} /> Ver oferta de materias
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className={styles.kpiGrid3}>
            <div className={styles.kpi}>
              <div className={styles.kpiIcon} style={{ background: '#E6F6EF', color: '#066B4C' }}>
                <Icon name="book" size={18} />
              </div>
              <div className={styles.kpiLabel}>Materias</div>
              <div className={styles.kpiValue}>{misCursas.length}</div>
              <div className={styles.kpiTrend}>inscriptas este cuatrimestre</div>
            </div>
            <div className={styles.kpi}>
              <div className={styles.kpiIcon} style={{ background: '#EFE8FA', color: '#7C5AC9' }}>
                <Icon name="users" size={18} />
              </div>
              <div className={styles.kpiLabel}>Colegas en común</div>
              <div className={styles.kpiValue}>{totalColegasUnicos}</div>
              <div className={styles.kpiTrend}>compartís al menos 1 materia</div>
            </div>
            <div className={styles.kpi}>
              <div className={styles.kpiIcon} style={{ background: '#FDF1DE', color: '#A1640D' }}>
                <Icon name="calendar" size={18} />
              </div>
              <div className={styles.kpiLabel}>Cuatrimestre</div>
              <div className={styles.kpiValue}>{CUATRIMESTRE_ACTUAL}°</div>
              <div className={styles.kpiTrend}>período activo 2025</div>
            </div>
          </div>

          {/* Schedule */}
          <h3 className={styles.sectionTitle}>Horario semanal</h3>
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

          {/* Materias inscriptas */}
          <h3 className={styles.sectionTitle}>Materias inscriptas</h3>
          {misCursas.map(cursa => {
            const oferta = ofertaMap[cursa.ofertaId];
            if (!oferta) return null;
            const peers = todasLasCursas
              .filter(tc => tc.ofertaId === cursa.ofertaId && tc.estudianteId !== estudianteActual?.Id)
              .map(tc => estudiantes.find(e => e.Id === tc.estudianteId))
              .filter((e): e is Estudiante => e !== undefined);

            return (
              <div key={cursa.Id} className={styles.materiaGroup} style={{ marginBottom: 12 }}>
                <div className={styles.mgHead} style={{ gridTemplateColumns: '60px 1fr auto auto', cursor: 'default' }}>
                  <div className={styles.mgCode}>#{oferta.materia.codMateria}</div>
                  <div>
                    <div className={styles.mgTitle}>{oferta.materia.nombre}</div>
                    <div className={styles.mgTitleSub}>
                      {oferta.comision.codComision} · {oferta.comision.diaSemana || oferta.comision.descripcion} · {oferta.modalidad}
                    </div>
                  </div>
                  <div>
                    {peers.length > 0 ? (
                      <span className={`${styles.chip} ${styles.chipAmb}`}>
                        <Icon name="users" size={10} /> {peers.length} colega{peers.length !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className={styles.chip}>Sin colegas</span>
                    )}
                  </div>
                  <button
                    className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                    onClick={() => handleCancelar(cursa.Id)}
                  >
                    <Icon name="x" size={12} /> Dar de baja
                  </button>
                </div>

                {peers.length > 0 && (
                  <div className={styles.mgBody} style={{ padding: '14px 20px' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#5B6B82', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
                      {peers.length} colega{peers.length > 1 ? 's' : ''} de Circo en esta comisión
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
                      {peers.map(p => (
                        <div key={p.Id} className={styles.coincPerson} style={{ background: '#fff', border: '1px solid #E6EAF0' }}>
                          <div className={`${styles.avatar} ${styles.avatarLg}`} style={{ background: avatarColor(p.Id) }}>
                            {getInitials(p.usuarioNombre || p.emailPersonal)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className={styles.coincPersonName}>{p.usuarioNombre || p.emailPersonal}</div>
                            <div className={styles.coincPersonMeta}>{p.emailPersonal}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Summary bar */}
          <div className={styles.summaryBar}>
            <div>
              <div className={styles.summaryBarCount}>
                {misCursas.length} {misCursas.length === 1 ? 'materia' : 'materias'} · {totalColegasUnicos} colegas en común
              </div>
              <div className={styles.summaryBarMeta}>Podés modificar tu inscripción hasta el cierre del cuatrimestre</div>
            </div>
            <div style={{ flex: 1 }} />
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => navigate('/oferta')}>
              <Icon name="plus" size={14} /> Agregar materia
            </button>
          </div>
        </>
      )}

      {toast && <div className={styles.toast}>✓ {toast}</div>}
    </>
  );
};

export default MisInscripciones;
