import React, { forwardRef } from 'react';
import './Header.css';
import headerImg from '../assets/head.png';

const Header = forwardRef<HTMLElement>((_props, ref) => {
  return (
    <header ref={ref}>
      <img src={headerImg} alt="Header" />
    </header>
  );
});

export default Header;
