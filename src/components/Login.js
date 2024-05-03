import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/Dashboard');
      toast.success('Login successful!', { autoClose: 2000 });
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <section className="h-screen flex flex-col md:flex-row justify-center space-y-10 md:space-y-0 md:space-x-16 items-center my-2 mx-5 md:mx-0 md:my-0">
      <div className="md:w-1/3 max-w-sm">
        <img src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp" alt="Sample image" />
      </div>
      <div className="md:w-1/3 max-w-sm">
        <div className="text-center md:text-left py-4">
          <label className="mr-1 p-4">Sign in with</label>
        </div>
        <input className="text-sm w-full px-4 py-2 border border-solid border-gray-300 rounded" type="text" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="text-sm w-full px-4 py-2 border border-solid border-gray-300 rounded mt-4" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        
        <div className="text-center md:text-left">
          <button onClick={signIn} className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white uppercase rounded text-xs tracking-wider" type="button">
            Login
          </button>
        </div>
      </div>
      <ToastContainer /> 
    </section>
  );
};

export default Login;
