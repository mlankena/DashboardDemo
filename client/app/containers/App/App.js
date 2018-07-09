import React, { Component } from 'react';

// import Header from '../Header/Header';
// import Footer from '../Footer/Footer';

const App = ({ children }) => (
  <>
    <main>
    <p><a href="/">Go Home</a></p>
      {children}
    </main>
  </>
);

export default App;
