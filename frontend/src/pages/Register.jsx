import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    // GSAP Entry Animation
    const ctx = gsap.context(() => {
      gsap.from(imageRef.current, {
        x: 50,
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
      await register(nom, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\\'inscription');
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
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row-reverse">
        
        {/* Right Side - Image/Branding */}
        <div ref={imageRef} className="md:w-1/2 bg-brand-600 p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="0,100 100,0 100,100" fill="white" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-4">Rejoignez-nous !</h1>
            <p className="text-brand-100 text-lg mb-8">Créez votre compte en quelques secondes et commencez à vendre ou acheter des produits autour de vous.</p>
            
            <ul className="space-y-4">
              <li className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">✓</div>
                <span>Annonces 100% gratuites</span>
              </li>
              <li className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">✓</div>
                <span>Paiement à la livraison sécurisé</span>
              </li>
              <li className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">✓</div>
                <span>Négociation directe via WhatsApp</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Left Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div ref={formRef} className="max-w-md w-full mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Créer un compte</h2>
              <p className="text-slate-500 mt-2">Remplissez le formulaire ci-dessous.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="pl-10 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="flex items-center">Création...</span>
                ) : (
                  <span className="flex items-center">S'inscrire <ArrowRight className="ml-2 h-4 w-4" /></span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-600">
                Vous avez déjà un compte ?{' '}
                <Link to="/login" className="font-bold text-brand-600 hover:text-brand-500 transition-colors">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
