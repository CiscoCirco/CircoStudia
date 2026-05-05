import * as React from 'react';
import { Pivot, PivotItem } from '@fluentui/react';
import Carrera from '../../../../core/entities/Carrera';

interface IFiltroCarreraProps {
  carreras: Carrera[];
  carreraSeleccionada: number | null;
  onCarreraChange: (carreraId: number | null) => void;
}

const FiltroCarrera: React.FC<IFiltroCarreraProps> = ({ carreras, carreraSeleccionada, onCarreraChange }) => {
  const handlePivotChange = (item?: PivotItem): void => {
    if (!item) return;
    const key = item.props.itemKey;
    onCarreraChange(key === 'all' ? null : Number(key));
  };

  const selectedKey = carreraSeleccionada !== null ? String(carreraSeleccionada) : 'all';

  return (
    <Pivot selectedKey={selectedKey} onLinkClick={handlePivotChange}>
      <PivotItem headerText="Todas" itemKey="all" />
      {carreras.map(c => (
        <PivotItem key={c.Id} headerText={c.nombre || c.codCarrera} itemKey={String(c.Id)} />
      ))}
    </Pivot>
  );
};

export default FiltroCarrera;
