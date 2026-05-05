import * as React from 'react';
import { Spinner, SpinnerSize } from '@fluentui/react';
import OfertaDeMaterias from '../../../../core/entities/OfertaDeMaterias';
import CursaEn from '../../../../core/entities/CursaEn';
import Estudiante from '../../../../core/entities/Estudiante';
import Icon, { avatarColor, getInitials, turnoLabel } from '../shared/Icon';
import styles from '../CircoStudiaWp.module.scss';

interface IComisionRowProps {
  oferta: OfertaDeMaterias;
  misCursas: CursaEn[];
  todasLasCursas: CursaEn[];
  ofertasDeEstaMateria: OfertaDeMaterias[];
  estudianteActual: { Id: number } | null;
  estudiantes: Estudiante[];
  onInscribirse: (oferta: OfertaDeMaterias) => Promise<void>;
}

function TurnoChip({ turno }: { turno: string }): React.ReactElement {
  const cls =
    turno === 'M' ? styles.chipTurnoM :
    turno === 'T' ? styles.chipTurnoT :
    turno === 'N' ? styles.chipTurnoN :
    styles.chip;
  return <span className={`${styles.chip} ${cls}`}>{turnoLabel(turno)}</span>;
}

function ModalidadChip({ modalidad }: { modalidad: string }): React.ReactElement {
  return <span className={`${styles.chip} ${styles.chipModalidad}`}>{modalidad}</span>;
}

const ComisionRow: React.FC<IComisionRowProps> = ({
  oferta, misCursas, todasLasCursas, ofertasDeEstaMateria, estudianteActual, estudiantes, onInscribirse
}) => {
  const [loading, setLoading] = React.useState(false);

  const yaInscripto = misCursas.some(c => c.ofertaId === oferta.Id);
  const ofertaIdsDeEstaMateria = ofertasDeEstaMateria.map(o => o.Id);
  const yaTomaEstaMateria = !yaInscripto && misCursas.some(c => ofertaIdsDeEstaMateria.includes(c.ofertaId));

  const inscriptosEnComision = todasLasCursas.filter(c => c.ofertaId === oferta.Id);
  const colegasEnComision = inscriptosEnComision
    .map(c => estudiantes.find(e => e.Id === c.estudianteId))
    .filter((e): e is Estudiante => e !== undefined && e.Id !== estudianteActual?.Id);

  const handleInscribirse = async (): Promise<void> => {
    setLoading(true);
    try { await onInscribirse(oferta); }
    finally { setLoading(false); }
  };

  const comisionCls = [
    styles.comision,
    yaInscripto ? styles.comisionSelected : '',
  ].filter(Boolean).join(' ');

  const horarioText = oferta.comision.diaSemana
    ? `${oferta.comision.diaSemana} · ${turnoLabel(oferta.comision.turno)}`
    : oferta.comision.descripcion;

  return (
    <div className={comisionCls}>
      {/* Commission ID */}
      <div className={styles.comisionId}>{oferta.comision.codComision}</div>

      {/* Schedule */}
      <div className={styles.comisionSchedule}>
        {horarioText}
        <small>{oferta.modalidad}{oferta.comision.turno ? ` · Turno ${turnoLabel(oferta.comision.turno)}` : ''}</small>
      </div>

      {/* Turno chip */}
      <div>
        {oferta.comision.turno && <TurnoChip turno={oferta.comision.turno} />}
        {!oferta.comision.turno && <ModalidadChip modalidad={oferta.modalidad} />}
      </div>

      {/* Colegas avatars */}
      <div className={styles.comisionColegas}>
        {colegasEnComision.length > 0 ? (
          <>
            <div className={styles.avatarStack}>
              {colegasEnComision.slice(0, 4).map(e => (
                <div
                  key={e.Id}
                  className={`${styles.avatar} ${styles.avatarSm}`}
                  style={{ background: avatarColor(e.Id) }}
                  title={e.usuarioNombre || e.emailPersonal}
                >
                  {getInitials(e.usuarioNombre || e.emailPersonal)}
                </div>
              ))}
              {colegasEnComision.length > 4 && (
                <div className={`${styles.avatar} ${styles.avatarSm}`} style={{ background: '#6B7280' }}>
                  +{colegasEnComision.length - 4}
                </div>
              )}
            </div>
            <span className={styles.comisionColegasLabel}>{colegasEnComision.length} de Circo</span>
          </>
        ) : (
          <span className={styles.comisionColegasLabel} style={{ opacity: .6 }}>Sin colegas aún</span>
        )}
      </div>

      {/* Action button */}
      <div>
        {loading ? (
          <Spinner size={SpinnerSize.small} />
        ) : yaInscripto ? (
          <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm} ${styles.comisionAction}`} disabled>
            <Icon name="check" size={12} /> Inscripto
          </button>
        ) : yaTomaEstaMateria ? (
          <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm} ${styles.comisionAction}`} disabled>
            Ya cursás esta materia
          </button>
        ) : estudianteActual ? (
          <button
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm} ${styles.comisionAction}`}
            onClick={handleInscribirse}
          >
            <Icon name="plus" size={12} /> Inscribirme
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ComisionRow;
