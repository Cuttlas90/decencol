import { conectWallet, selectUser, selectWallet } from '../features/Private/PrivateSlice';
import '../Styles/Landing.css'
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingAPI from './Countiners/LoadingAPI';



export default function Landing(){
    
    const dispatch = useDispatch();
	const signWallet = useSelector(selectWallet).signMetamask;
	const wallet = useSelector(selectWallet);
	const navigate = useNavigate();
	const isLogedIn = useSelector(selectUser).isLogedIn;
    const token = localStorage.getItem('token'); 
    useEffect(() => {
		if (isLogedIn) {
			navigate('/userPage');
		}
	}, [isLogedIn]);


	const [onboarding,setOnboarding] = useState(false)

    const ConnectWallet = (e) => {
		e.preventDefault();
		setTimeout(()=>{
			setOnboarding(false);
		},2000)
		if (signWallet.Status !== "loading" && wallet.Status !== "loading" && !onboarding){
			dispatch(conectWallet());
		}
		setOnboarding(true);
	};

    return(
        <div className='Landing'>
            <h3 className='py-4'>Please Connect to Wallet</h3>
            <button style={{minWidth:"195px"}} className='btn btn-primary bg-gradient d-flex align-items-center justify-content-center' onClick={(e) => ConnectWallet(e)}>
				<span>Connect to wallet</span>
				{
					wallet.signMetamask.Status === "loading" && <LoadingAPI color="white small" />
				}
			</button>
        </div>
    )
}