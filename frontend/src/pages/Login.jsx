import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Mail, Lock, ArrowRight, Github } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    // Modern GSAP Animation
    const ctx = gsap.context(() => {
      gsap.from(imageRef.current, {
        x: -50,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out'
      });
      
      gsap.from(formRef.current.children, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.2
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants invalides');
      
      // Error shake animation
      gsap.fromTo(formRef.current, 
        { x: -10 }, 
        { x: 10, duration: 0.1, yoyo: true, repeat: 5, ease: 'linear', onComplete: () => gsap.set(formRef.current, {x: 0}) }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-brand-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Image/Branding */}
        <div ref={imageRef} className="md:w-1/2 bg-brand-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" />
              <path d="M0,100 C20,50 80,50 100,0" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Marketplace PFE</h1>
            <p className="text-brand-100 text-lg">La meilleure plateforme pour vendre et acheter vos objets d'occasion en toute sécurité.</p>
          </div>
          
          <div className="relative z-10 mt-12 md:mt-0">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <p className="italic font-light">"Une expérience fluide et sécurisée. Le Pay on Delivery m'a donné confiance."</p>
              <div className="mt-4 flex items-center">
                <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center font-bold text-lg">A</div>
                <div className="ml-3">
                  <p className="font-semibold text-sm">Amine B.</p>
                  <p className="text-brand-100 text-xs">Vendeur vérifié</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div ref={formRef} className="max-w-md w-full mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Bon retour ! 👋</h2>
              <p className="text-slate-500 mt-2">Veuillez entrer vos identifiants pour continuer.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    placeholder="vous@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input id="remember-me" type="checkbox" className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">Se souvenir de moi</label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-brand-600 hover:text-brand-500">Mot de passe oublié ?</a>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="flex items-center">Chargement...</span>
                ) : (
                  <span className="flex items-center">Se connecter <ArrowRight className="ml-2 h-4 w-4" /></span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-600">
                Vous n'avez pas de compte ?{' '}
                <Link to="/register" className="font-bold text-brand-600 hover:text-brand-500 transition-colors">
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
