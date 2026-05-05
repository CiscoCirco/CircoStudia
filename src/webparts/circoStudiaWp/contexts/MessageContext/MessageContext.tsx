import { createContext, useContext } from 'react';
import { MessagesTypes } from '../../../../core/utils/Constants';

interface IMessageData {
  type: MessagesTypes;
  message: string;
}

interface MessageContextProps {
  messageData: IMessageData | null;
  setMessage: (type: MessagesTypes, message: string, duration?: number) => void;
  clearMessage: () => void;
}

export const MessageContext = createContext<MessageContextProps | undefined>(undefined);

export const useMessage = (): MessageContextProps => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage debe usarse dentro de un MessageProvider');
  }
  return context;
};
