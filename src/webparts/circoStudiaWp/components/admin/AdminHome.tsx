import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Text, DefaultButton, Icon } from '@fluentui/react';

interface IAdminCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}

const AdminCard: React.FC<IAdminCardProps> = ({ icon, title, description, onClick }) => (
  <Stack
    styles={{
      root: {
        border: '1px solid #ddd',
        borderRadius: 4,
        padding: '20px 24px',
        minWidth: 220,
        maxWidth: 260,
        background: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
        selectors: { ':hover': { boxShadow: '0 3px 8px rgba(0,0,0,0.15)', borderColor: '#0078d4' } }
      }
    }}
    tokens={{ childrenGap: 10 }}
    onClick={onClick}
  >
    <Icon iconName={icon} styles={{ root: { fontSize: 28, color: '#0078d4' } }} />
    <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>{title}</Text>
    <Text variant="small" styles={{ root: { color: '#666' } }}>{description}</Text>
  </Stack>
);

const AdminHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Stack tokens={{ padding: 32, childrenGap: 24 }}>
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }}>
        <DefaultButton iconProps={{ iconName: 'Back' }} text="Inicio" onClick={() => navigate('/')} />
        <Text variant="xxLarge">Panel de Administración</Text>
      </Stack>

      <Stack horizontal wrap tokens={{ childrenGap: 16 }}>
        <AdminCard
          icon="Education"
          title="Gestión de Oferta"
          description="Ver, agregar y eliminar materias de la oferta del cuatrimestre actual."
          onClick={() => navigate('/admin/oferta')}
        />
        <AdminCard
          icon="Upload"
          title="Importar desde CSV"
          description="Cargar masivamente ofertas de materias desde un archivo CSV."
          onClick={() => navigate('/admin/importar')}
        />
        <AdminCard
          icon="ReportDocument"
          title="Reporte de Inscriptos"
          description="Ver todos los estudiantes inscriptos por materia y comisión."
          onClick={() => navigate('/admin/reporte')}
        />
      </Stack>
    </Stack>
  );
};

export default AdminHome;
