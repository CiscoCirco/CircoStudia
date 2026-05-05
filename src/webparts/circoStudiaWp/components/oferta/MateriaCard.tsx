import * as React from 'react';
import OfertaDeMaterias from '../../../../core/entities/OfertaDeMaterias';
import CursaEn from '../../../../core/entities/CursaEn';
import Estudiante from '../../../../core/entities/Estudiante';
import ComisionRow from './ComisionRow';
import Icon from '../shared/Icon';
import styles from '../CircoStudiaWp.module.scss';

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
  const enMiInscripcion = misCursas.some(c => ofertas.map(o => o.Id).includes(c.ofertaId));

  const totalColegas = ofertas.reduce((sum, o) => {
    const count = todasLasCursas.filter(c => c.ofertaId === o.Id).length;
    return sum + count;
  }, 0);

  const cls = [
    styles.materiaGroup,
    expanded ? styles.materiaGroupOpen : '',
    enMiInscripcion ? styles.materiaGroupEnrolled : '',
  ].filter(Boolean).join(' ');

  const chevronCls = [styles.mgChevron, expanded ? styles.mgChevronOpen : ''].join(' ');

  return (
    <div className={cls}>
      {/* Header */}
      <div className={styles.mgHead} onClick={() => setExpanded(prev => !prev)}>
        <div className={styles.mgCode}>#{materia.codMateria}</div>
        <div>
          <div className={styles.mgTitle}>{materia.nombre}</div>
          <div className={styles.mgTitleSub}>
            {anioLabel && `${anioLabel} · `}
            {ofertas.length} {ofertas.length === 1 ? 'comisión' : 'comisiones'}
            {totalColegas > 0 && ` · ${totalColegas} colega${totalColegas !== 1 ? 's' : ''} inscripto${totalColegas !== 1 ? 's' : ''}`}
          </div>
        </div>
        <div className={styles.mgChips}>
          {/* Carrera chip if available — shown as year chip */}
          {anioLabel && (
            <span className={styles.chip}>{anioLabel}</span>
          )}
        </div>
        <div>
          {enMiInscripcion && (
            <span className={`${styles.chip} ${styles.chipMatch}`}>
              <Icon name="check" size={10} />
              En tu inscripción
            </span>
          )}
        </div>
        <div className={chevronCls}>
          <Icon name="chevronRight" size={18} />
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className={styles.mgBody}>
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
        </div>
      )}
    </div>
  );
};

export default MateriaCard;
