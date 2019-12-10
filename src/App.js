import React, { useState, useEffect } from 'react';
import './App.css';
import Nav from './components/Nav';
import Routing from './components/Routes'
function App() {
 
  return (
    <div>
      <Nav />
      <Routing />
      {/* <Features /> */}
    </div>
  );
}

export default App;
