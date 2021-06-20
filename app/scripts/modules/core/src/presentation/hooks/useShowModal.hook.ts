import React from 'react';
import { IModalProps, showModal } from '../modal';
import { IModalComponentProps } from '../modal/showModal';
import { useApplicationContext } from './useApplicationContext.hook';

export const useShowModal = () => {
  const app = useApplicationContext();
  const showModalWithApp = React.useCallback(
    <P, C = any, D = any>(
      ModalComponent: React.ComponentType<P & IModalComponentProps<C, D>>,
      componentProps?: P,
      modalProps?: Omit<IModalProps, 'isOpen' | 'onRequestClose' | 'onAfterClose' | 'children'>,
    ) => {
      showModal(ModalComponent, componentProps, modalProps, app);
    },
    [showModal, app],
  );
  return showModalWithApp;
};
