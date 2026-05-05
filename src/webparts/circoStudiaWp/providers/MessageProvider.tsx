import * as React from 'react';
import { useState, useCallback, useRef } from 'react';
import { MessageContext } from '../contexts/MessageContext/MessageContext';
import Message from '../contexts/MessageContext/Message';
import { MessagesTypes } from '../../../core/utils/Constants';

interface IMessageData {
  type: MessagesTypes;
  message: string;
}

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messageData, setMessageData] = useState<IMessageData | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearMessage = useCallback(() => {
    setMessageData(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const setMessage = useCallback((type: MessagesTypes, message: string, duration?: number) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setMessageData({ type, message });
    const ms = duration ?? 4000;
    if (ms > 0) {
      timerRef.current = window.setTimeout(() => {
        setMessageData(null);
        timerRef.current = null;
      }, ms);
    }
  }, []);

  return (
    <MessageContext.Provider value={{ messageData, setMessage, clearMessage }}>
      {children}
      {messageData && <Message type={messageData.type} message={messageData.message} />}
    </MessageContext.Provider>
  );
};
