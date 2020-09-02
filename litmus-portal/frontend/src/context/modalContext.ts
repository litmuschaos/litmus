import React from 'react';

interface ModalHandlerContextProps {
  handleModal: () => void;
}

const ModalContext = React.createContext<ModalHandlerContextProps>({
  handleModal: () => {},
});

export default ModalContext;
