import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { useUser } from '../../contexts/UserContext';
import { CUATRIMESTRE_ACTUAL } from '../../../../core/utils/Constants';
import CursaEnDatasource from '../../../../core/api/cursaEn/CursaEnDatasource';
import OfertaDeMateriaDatasource from '../../../../core/api/ofertaDeMaterias/OfertaDeMateriaDatasource';
import EstudianteDatasource from '../../../../core/api/estudiante/EstudianteDatasource';
import CursaEn from '../../../../core/entities/CursaEn';
import OfertaDeMaterias from '../../../../core/entities/OfertaDeMaterias';
import Estudiante from '../../../../core/entities/Estudiante';
import Icon, { avatarColor, getInitials, turnoLabel } from '../shared/Icon';
import styles from '../CircoStudiaWp.module.scss';

interface IProfileRow {
  label: string;
  value: string | number | React.ReactNode;
}

function ProfileRow({ label, value }: IProfileRow): React.ReactElement {
  return (
    <div className={styles.profileRow}>
      <span className={styles.profileRowLabel}>{label}</span>
      <span className={styles.profileRowValue}>{value}</span>
    </div>
  );
}

const Perfil: React.FC = () => {
  const { estudianteActual, user, isInitialLoading: userLoading } = useUser();

  const [misCursas, setMisCursas] = useState<CursaEn[]>([]);
  const [ofertaMap, setOfertaMap] = useState<Record<number, OfertaDeMaterias>>({});
  const [estudianteDetalle, setEstudianteDetalle] = useState<Estudiante | null>(null);
  const [todasLasCursas, setTodasLasCursas] = useState<CursaEn[]>([]);
  const [loading, setLoading] = useState(true);

  const cursaEnDS = React.useMemo(() => new CursaEnDatasource(), []);
  const ofertaDS = React.useMemo(() => new OfertaDeMateriaDatasource(), []);
  const estudianteDS = React.useMemo(() => new EstudianteDatasource(), []);

  const loadData = useCallback(async (): Promise<void> => {
    if (userLoading || !estudianteActual) return;
    try {
      setLoading(true);
      const [mis, ofertas, todas, ests] = await Promise.all([
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
      setTodasLasCursas(todas.filter(c => ofertaIds.has(c.ofertaId)));

      const detalle = ests.find(e => e.Id === estudianteActual.Id) || null;
      setEstudianteDetalle(detalle);
    } catch (err) {
      console.error('[Perfil] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [userLoading, estudianteActual]);

  useEffect(() => { loadData().catch(console.error); }, [loadData]);

  const colegasUnicos = React.useMemo(() => {
    const set = new Set<number>();
    misCursas.forEach(c => {
      todasLasCursas
        .filter(tc => tc.ofertaId === c.ofertaId && tc.estudianteId !== estudianteActual?.Id)
        .forEach(tc => set.add(tc.estudianteId));
    });
    return set.size;
  }, [misCursas, todasLasCursas, estudianteActual]);

  if (loading || userLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Spinner size={SpinnerSize.large} label="Cargando perfil..." />
      </div>
    );
  }

  if (!estudianteActual) {
    return (
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔒</div>
            <div>No tenés un perfil de estudiante registrado en CircoStudia.</div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = estudianteActual.Title || user?.Title || estudianteActual.emailPersonal || '';
  const email = estudianteActual.emailPersonal || user?.Email || '';
  const initials = getInitials(displayName);
  const color = avatarColor(estudianteActual.Id);

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Mi perfil</h1>
        <p className={styles.pageSub}>Tu información académica y actividad en CircoStudia.</p>
      </div>

      {/* Profile hero card */}
      <div className={styles.profileCard} style={{ marginBottom: 20 }}>
        <div
          className={`${styles.avatar} ${styles.avatarXl}`}
          style={{ background: color }}
        >
          {initials}
        </div>
        <div className={styles.profileCardInfo}>
          <div className={styles.profileCardName}>{displayName}</div>
          <div className={styles.profileCardMeta}>{email}</div>
          <div className={styles.profileCardTags}>
            <span className={`${styles.chip} ${styles.chipAmb}`}>
              <Icon name="user" size={10} /> Estudiante
            </span>
            {estudianteActual.preset && (
              <span className={`${styles.chip} ${styles.chipIng}`}>
                <Icon name="check" size={10} /> Perfil configurado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.kpiGrid3} style={{ marginBottom: 20 }}>
        <div className={styles.kpi}>
          <div className={styles.kpiIcon} style={{ background: '#E6F6EF', color: '#066B4C' }}>
            <Icon name="book" size={18} />
          </div>
          <div className={styles.kpiLabel}>Mis materias</div>
          <div className={styles.kpiValue}>{misCursas.length}</div>
          <div className={styles.kpiTrend}>inscriptas este cuatrimestre</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiIcon} style={{ background: '#EFE8FA', color: '#7C5AC9' }}>
            <Icon name="users" size={18} />
          </div>
          <div className={styles.kpiLabel}>Colegas en común</div>
          <div className={styles.kpiValue}>{colegasUnicos}</div>
          <div className={styles.kpiTrend}>comparten al menos 1 materia</div>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Datos de cuenta */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <Icon name="user" size={16} />
            <span className={styles.cardTitle}>Datos de cuenta</span>
          </div>
          <div className={styles.cardBody}>
            <ProfileRow label="Nombre" value={displayName} />
            <ProfileRow label="Email personal" value={email || '—'} />
            <ProfileRow label="ID Estudiante" value={`#${estudianteActual.Id}`} />
            <ProfileRow
              label="Estado"
              value={
                <span className={`${styles.chip} ${styles.chipAmb}`} style={{ fontSize: 11 }}>
                  Activo
                </span>
              }
            />
          </div>
        </div>

        {/* Mis inscripciones */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <Icon name="book" size={16} />
            <span className={styles.cardTitle}>Mis inscripciones</span>
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: '#5B6B82' }}>{CUATRIMESTRE_ACTUAL}° Cuatrimestre</span>
          </div>
          <div className={styles.cardBody}>
            {misCursas.length === 0 ? (
              <div className={styles.empty} style={{ padding: '24px 0' }}>
                <div className={styles.emptyIcon}>📚</div>
                <div>Sin inscripciones aún.</div>
              </div>
            ) : (
              misCursas.map(c => {
                const oferta = ofertaMap[c.ofertaId];
                if (!oferta) return null;
                return (
                  <div key={c.Id} className={styles.profileRow}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{oferta.materia.nombre}</div>
                      <div style={{ fontSize: 11, color: '#5B6B82', marginTop: 2 }}>
                        {oferta.comision.codComision}
                        {oferta.comision.turno && ` · ${turnoLabel(oferta.comision.turno)}`}
                        {oferta.modalidad && ` · ${oferta.modalidad}`}
                      </div>
                    </div>
                    {oferta.materia.anio ? (
                      <span className={styles.chip} style={{ fontSize: 11 }}>{oferta.materia.anio}° año</span>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Perfil;
