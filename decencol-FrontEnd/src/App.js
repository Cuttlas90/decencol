import React, { useEffect, useState } from 'react';
import Landing from './Pages/Landing';
import UserPage from './Pages/UserPage';
import './Styles/Master.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { isLogedIn, selectshowModalwallet, selectUser } from './features/Private/PrivateSlice';
import SetConectWallet from './Pages/Countiners/SetConectWallet';



function App() {
  const showModalwallet = useSelector(selectshowModalwallet);
  const dispatch = useDispatch();
  const UserisLogedIn = useSelector(selectUser).isLogedIn;

  useEffect(()=>{
    var token = localStorage.getItem("token");
    if (token){
      dispatch(isLogedIn(true))
    }
  },[])

  
  return (
    <>
    <BrowserRouter>
      <Routes>
        {
          UserisLogedIn ?
          <Route path='/' element={<UserPage />} />
          :
          <Route path='/' element={<Landing />} />
        }
        <Route path='UserPage' element={<UserPage />} />
      </Routes>
    </BrowserRouter>
    {showModalwallet&&<SetConectWallet></SetConectWallet>}
</>

  );
}

export default App;
