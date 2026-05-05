import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, DefaultButton, Stack, Text } from '@fluentui/react';
import { useUser } from '../../contexts/UserContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { estudianteActual, isAdmin } = useUser();

  return (
    <Stack tokens={{ padding: 32, childrenGap: 24 }}>
      <Text variant="xxLarge">CircoStudia</Text>
      {estudianteActual && (
        <Text variant="large">Bienvenido/a, {estudianteActual.Title || estudianteActual.emailPersonal || 'estudiante'}</Text>
      )}
      <Stack horizontal tokens={{ childrenGap: 16 }} wrap>
        <PrimaryButton
          iconProps={{ iconName: 'Education' }}
          text="Ver Oferta de Materias"
          onClick={() => navigate('/oferta')}
          styles={{ root: { minWidth: 200, height: 48 } }}
        />
        <DefaultButton
          iconProps={{ iconName: 'BulletedList' }}
          text="Mis Inscripciones"
          onClick={() => navigate('/mis-inscripciones')}
          styles={{ root: { minWidth: 200, height: 48 } }}
        />
        {isAdmin && (
          <DefaultButton
            iconProps={{ iconName: 'Settings' }}
            text="Panel de Administración"
            onClick={() => navigate('/admin')}
            styles={{ root: { minWidth: 200, height: 48 } }}
          />
        )}
      </Stack>
    </Stack>
  );
};

export default Home;
