import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { useUser } from '../../contexts/UserContext';
import { CUATRIMESTRE_ACTUAL } from '../../../../core/utils/Constants';
import OfertaDeMateriaDatasource from '../../../../core/api/ofertaDeMaterias/OfertaDeMateriaDatasource';
import CursaEnDatasource from '../../../../core/api/cursaEn/CursaEnDatasource';
import EstudianteDatasource from '../../../../core/api/estudiante/EstudianteDatasource';
import OfertaDeMaterias from '../../../../core/entities/OfertaDeMaterias';
import CursaEn from '../../../../core/entities/CursaEn';
import Estudiante from '../../../../core/entities/Estudiante';
import Icon, { avatarColor, getInitials, turnoLabel } from '../shared/Icon';
import styles from '../CircoStudiaWp.module.scss';

interface IColegaData {
  estudiante: Estudiante;
  materias: OfertaDeMaterias[];
  count: number;
}

const Coincidencias: React.FC = () => {
  const { estudianteActual, isInitialLoading: userLoading } = useUser();

  const [colegas, setColegas] = useState<IColegaData[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  const ofertaDS = React.useMemo(() => new OfertaDeMateriaDatasource(), []);
  const cursaEnDS = React.useMemo(() => new CursaEnDatasource(), []);
  const estudianteDS = React.useMemo(() => new EstudianteDatasource(), []);

  const loadData = useCallback(async (): Promise<void> => {
    if (userLoading || !estudianteActual) return;
    try {
      setLoading(true);
      const [mis, ofertas, todasCursas, ests] = await Promise.all([
        cursaEnDS.getByEstudianteId(estudianteActual.Id),
        ofertaDS.getByCuatrimestre(CUATRIMESTRE_ACTUAL),
        cursaEnDS.getAllFlat(),
        estudianteDS.getItems(),
      ]);

      const ofertaMap: Record<number, OfertaDeMaterias> = {};
      ofertas.forEach(o => { ofertaMap[o.Id] = o; });

      const misOfertaIds = new Set(mis.map(c => c.ofertaId));

      // Group by colega: count shared ofertas
      const colegaMap: Record<number, Set<number>> = {};
      todasCursas.forEach(c => {
        if (c.estudianteId === estudianteActual.Id) return;
        if (!misOfertaIds.has(c.ofertaId)) return;
        if (!colegaMap[c.estudianteId]) colegaMap[c.estudianteId] = new Set();
        colegaMap[c.estudianteId].add(c.ofertaId);
      });

      const result: IColegaData[] = Object.entries(colegaMap)
        .map(([idStr, ofertaIds]) => {
          const estId = Number(idStr);
          const est = ests.find(e => e.Id === estId);
          if (!est) return null;
          const materias = Array.from(ofertaIds).map(oid => ofertaMap[oid]).filter(Boolean);
          return { estudiante: est, materias, count: materias.length };
        })
        .filter((x): x is IColegaData => x !== null)
        .sort((a, b) => b.count - a.count);

      setColegas(result);
    } catch (err) {
      console.error('[Coincidencias] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [userLoading, estudianteActual]);

  useEffect(() => { loadData().catch(console.error); }, [loadData]);

  const colegasFiltrados = React.useMemo(() => {
    if (!busqueda.trim()) return colegas;
    const q = busqueda.toLowerCase();
    return colegas.filter(({ estudiante }) => {
      const name = (estudiante.usuarioNombre || estudiante.emailPersonal || '').toLowerCase();
      return name.includes(q);
    });
  }, [colegas, busqueda]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Spinner size={SpinnerSize.large} label="Cargando coincidencias..." />
      </div>
    );
  }

  if (!estudianteActual) {
    return (
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔒</div>
            <div>Necesitás estar registrado como estudiante para ver coincidencias.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Coincidencias</h1>
        <p className={styles.pageSub}>
          Colegas de Circo inscriptos en las mismas materias que vos — ordenados por mayor coincidencia.
        </p>
      </div>

      {/* Stats bar */}
      <div className={styles.kpiGrid3} style={{ marginBottom: 20 }}>
        <div className={styles.kpi}>
          <div className={styles.kpiIcon} style={{ background: '#E6F6EF', color: '#066B4C' }}>
            <Icon name="users" size={18} />
          </div>
          <div className={styles.kpiLabel}>Colegas con coincidencia</div>
          <div className={styles.kpiValue}>{colegas.length}</div>
          <div className={styles.kpiTrend}>comparten al menos 1 materia</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiIcon} style={{ background: '#EFE8FA', color: '#7C5AC9' }}>
            <Icon name="sparkle" size={18} />
          </div>
          <div className={styles.kpiLabel}>Mayor coincidencia</div>
          <div className={styles.kpiValue}>{colegas.length > 0 ? colegas[0].count : 0}</div>
          <div className={styles.kpiTrend}>{colegas.length > 0 ? `con ${colegas[0].estudiante.usuarioNombre || colegas[0].estudiante.emailPersonal}` : 'sin inscripciones aún'}</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiIcon} style={{ background: '#FDF1DE', color: '#A1640D' }}>
            <Icon name="book" size={18} />
          </div>
          <div className={styles.kpiLabel}>Promedio de materias</div>
          <div className={styles.kpiValue}>
            {colegas.length > 0 ? (colegas.reduce((s, c) => s + c.count, 0) / colegas.length).toFixed(1) : '—'}
          </div>
          <div className={styles.kpiTrend}>por colega con coincidencia</div>
        </div>
      </div>

      {/* Search bar */}
      <div className={styles.toolbar}>
        <input
          className={styles.input}
          placeholder="Buscar colega…"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ minWidth: 240 }}
        />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#5B6B82' }}>
          {colegasFiltrados.length} colega{colegasFiltrados.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Colegas list */}
      {colegasFiltrados.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🔍</div>
              <div>
                {colegas.length === 0
                  ? 'Inscribite a materias para ver con qué colegas coincidís.'
                  : 'No hay colegas que coincidan con la búsqueda.'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {colegasFiltrados.map(({ estudiante, materias, count }) => (
            <ColegaCard key={estudiante.Id} estudiante={estudiante} materias={materias} count={count} />
          ))}
        </div>
      )}
    </>
  );
};

interface IColegaCardProps {
  estudiante: Estudiante;
  materias: OfertaDeMaterias[];
  count: number;
}

const ColegaCard: React.FC<IColegaCardProps> = ({ estudiante, materias, count }) => {
  const [expanded, setExpanded] = useState(false);
  const displayName = estudiante.usuarioNombre || estudiante.emailPersonal || `Est. #${estudiante.Id}`;

  return (
    <div className={styles.coincCard}>
      <div className={styles.coincCardHead}>
        <div
          className={`${styles.avatar} ${styles.avatarLg}`}
          style={{ background: avatarColor(estudiante.Id) }}
        >
          {getInitials(displayName)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className={styles.coincCardTitle}>{displayName}</div>
          <div className={styles.coincPersonMeta}>{estudiante.emailPersonal}</div>
        </div>
        <div className={styles.coincCardCount}>{count} materia{count !== 1 ? 's' : ''}</div>
        <button
          className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
          onClick={() => setExpanded(prev => !prev)}
          aria-expanded={expanded}
        >
          <Icon name="chevronRight" size={14} />
        </button>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #E6EAF0', paddingTop: 12, marginTop: 4 }}>
          <div className={styles.coincPeople}>
            {materias.map(oferta => (
              <div key={oferta.Id} className={styles.coincPerson}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={styles.coincPersonName}>{oferta.materia.nombre}</div>
                  <div className={styles.coincPersonMeta}>
                    {oferta.comision.codComision}
                    {oferta.comision.turno && ` · ${turnoLabel(oferta.comision.turno)}`}
                    {oferta.modalidad && ` · ${oferta.modalidad}`}
                  </div>
                </div>
                {oferta.materia.anio ? (
                  <span className={styles.chip}>{oferta.materia.anio}° año</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Coincidencias;
