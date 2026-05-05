import * as React from 'react';
import { Stack, Text, Icon, MessageBar, MessageBarType } from '@fluentui/react';
import { useUser } from '../../contexts/UserContext';

const SinPerfil: React.FC = () => {
  const { user } = useUser();

  return (
    <Stack
      horizontalAlign="center"
      verticalAlign="center"
      tokens={{ padding: 48, childrenGap: 16 }}
      styles={{ root: { minHeight: 300 } }}
    >
      <Icon iconName="Contact" styles={{ root: { fontSize: 48, color: '#d32f2f' } }} />
      <Text variant="xxLarge" styles={{ root: { fontWeight: 600 } }}>Sin perfil de estudiante</Text>
      <Text variant="medium" styles={{ root: { color: '#555', textAlign: 'center', maxWidth: 480 } }}>
        Tu cuenta{user ? ` (${user.Email})` : ''} no tiene un perfil registrado en el sistema CircoStudia.
      </Text>
      <MessageBar
        messageBarType={MessageBarType.info}
        styles={{ root: { maxWidth: 480 } }}
      >
        Contactá al administrador para que registren tu perfil en el sistema.
      </MessageBar>
    </Stack>
  );
};

export default SinPerfil;
