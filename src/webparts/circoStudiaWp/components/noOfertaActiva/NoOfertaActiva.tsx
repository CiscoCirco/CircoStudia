import * as React from 'react';
import { Stack, Text, Icon, PrimaryButton, DefaultButton } from '@fluentui/react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { CUATRIMESTRE_ACTUAL } from '../../../../core/utils/Constants';

const NoOfertaActiva: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useUser();

  return (
    <Stack
      horizontalAlign="center"
      verticalAlign="center"
      tokens={{ padding: 48, childrenGap: 16 }}
      styles={{ root: { minHeight: 300 } }}
    >
      <Icon iconName="Education" styles={{ root: { fontSize: 48, color: '#aaa' } }} />
      <Text variant="xxLarge" styles={{ root: { fontWeight: 600, color: '#555' } }}>
        Sin oferta disponible
      </Text>
      <Text variant="medium" styles={{ root: { color: '#777', textAlign: 'center', maxWidth: 480 } }}>
        {isAdmin
          ? `No hay materias cargadas para el ${CUATRIMESTRE_ACTUAL}° cuatrimestre. Podés agregarlas desde el Panel de Administración.`
          : `Todavía no hay materias disponibles para el ${CUATRIMESTRE_ACTUAL}° cuatrimestre. Volvé a revisar pronto.`
        }
      </Text>
      <Stack horizontal tokens={{ childrenGap: 12 }}>
        <DefaultButton iconProps={{ iconName: 'Back' }} text="Inicio" onClick={() => navigate('/')} />
        {isAdmin && (
          <PrimaryButton
            iconProps={{ iconName: 'Settings' }}
            text="Gestionar oferta"
            onClick={() => navigate('/admin/oferta')}
          />
        )}
      </Stack>
    </Stack>
  );
};

export default NoOfertaActiva;
