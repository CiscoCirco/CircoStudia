import * as React from 'react';
import { MessageBar, MessageBarType } from '@fluentui/react';
import { MessagesTypes } from '../../../../core/utils/Constants';

interface IMessageProps {
  type: MessagesTypes;
  message: string;
}

const typeMap: Record<MessagesTypes, MessageBarType> = {
  [MessagesTypes.SUCCESS]: MessageBarType.success,
  [MessagesTypes.ERROR]: MessageBarType.error,
  [MessagesTypes.WARNING]: MessageBarType.warning,
  [MessagesTypes.INFO]: MessageBarType.info,
};

const Message: React.FC<IMessageProps> = ({ type, message }) => (
  <MessageBar messageBarType={typeMap[type]}>{message}</MessageBar>
);

export default Message;
