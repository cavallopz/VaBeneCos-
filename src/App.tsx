import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  Zap, 
  Home, 
  CreditCard, 
  Wifi, 
  ShieldCheck, 
  ChevronRight, 
  Star, 
  CheckCircle2, 
  ArrowLeft,
  Menu,
  X,
  Search,
  PhoneCall,
  User,
  Smile,
  ChevronDown,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  Mail
} from 'lucide-react';
import { cn } from './lib/utils';
import { db, auth } from './lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  onSnapshot,
  orderBy,
  serverTimestamp,
  limit,
  startAfter 
} from 'firebase/firestore';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

import { AdminGuard } from './components/AdminGuard';

// --- Types ---
export interface Offer {
  id: string;
  provider: string;
  providerLogo: string;
  name: string;
  price: number;
  period: 'mese' | 'anno';
  features: string[];
  category: string;
  rating: number;
}

// --- Components ---

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isInsuranceFlow = location.pathname.includes('/categoria/');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Hardcoded admin for bootstrap
        if (firebaseUser.email === "carmelolatora310@gmail.com") {
          setIsAdmin(true);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (isInsuranceFlow) {
    return (
      <header className="sticky top-0 z-50 bg-[#00B14F] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-white">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <Link to="/" className="flex items-center space-x-1">
              <div className="bg-white rounded-lg p-1">
                <Smile className="text-[#00B14F] w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight italic">VaBeneCosi</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
              <PhoneCall className="w-5 h-5" />
            </button>
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm font-medium hidden md:block">Ciao, {user.name.split(' ')[0]}</span>
                <button 
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-[#00B14F] rounded-lg flex items-center justify-center">
              <Smile className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight italic">VaBene<span className="text-[#00B14F]">Cosi</span></span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link to="/categoria/auto" className="text-sm font-medium text-gray-600 hover:text-[#00B14F] transition-colors">Assicurazioni</Link>
            <Link to="/categoria/energia" className="text-sm font-medium text-gray-600 hover:text-[#00B14F] transition-colors">Energia</Link>
            <Link to="/categoria/mutui" className="text-sm font-medium text-gray-600 hover:text-[#00B14F] transition-colors">Mutui e Prestiti</Link>
            <Link to="/categoria/internet" className="text-sm font-medium text-gray-600 hover:text-[#00B14F] transition-colors">Internet</Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {isAdmin && (
              <Link to="/admin" className="text-sm font-bold text-orange-600 hover:text-orange-700">Admin Panel</Link>
            )}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Ciao, <span className="text-[#00B14F]">{user.displayName?.split(' ')[0] || user.email}</span></span>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-600 hover:text-red-500 transition-colors"
                >
                  Esci
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-[#00B14F]">Accedi</Link>
            )}
            <button className="bg-[#00B14F] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#009643] transition-all shadow-md hover:shadow-lg">
              Preventivo Rapido
            </button>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <Link to="/categoria/auto" className="block text-lg font-medium text-gray-700" onClick={() => setIsMenuOpen(false)}>Assicurazioni</Link>
              <Link to="/categoria/energia" className="block text-lg font-medium text-gray-700" onClick={() => setIsMenuOpen(false)}>Energia</Link>
              <Link to="/categoria/mutui" className="block text-lg font-medium text-gray-700" onClick={() => setIsMenuOpen(false)}>Mutui e Prestiti</Link>
              <Link to="/categoria/internet" className="block text-lg font-medium text-gray-700" onClick={() => setIsMenuOpen(false)}>Internet</Link>
              <hr />
              {user ? (
                <div className="space-y-4">
                  <p className="font-bold text-gray-900">Ciao, {user.name}</p>
                  <button 
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold"
                  >
                    Esci
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="block w-full bg-[#00B14F] text-white py-3 rounded-xl font-bold text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Accedi
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const CategoryCard = ({ icon: Icon, title, description, to, color }: any) => (
  <Link to={to} className="group">
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#00B14F] transition-colors">{title}</h3>
      <p className="text-sm text-gray-500 flex-grow">{description}</p>
      <div className="mt-4 flex items-center text-[#00B14F] font-semibold text-sm">
        Confronta ora <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  </Link>
);

// --- Pages ---

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-white pt-16 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6"
            >
              Risparmia sulle tue <span className="text-[#00B14F]">spese fisse</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 leading-relaxed"
            >
              Confrontiamo per te le migliori tariffe di assicurazioni, energia, mutui e internet. Semplice, veloce e gratuito.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <CategoryCard 
              icon={Car} 
              title="Assicurazione Auto" 
              description="Risparmia fino a 500€ sulla tua polizza RC Auto confrontando le migliori compagnie."
              to="/categoria/auto"
              color="bg-[#00B14F]"
            />
            <CategoryCard 
              icon={Zap} 
              title="Luce e Gas" 
              description="Trova l'offerta energia più adatta ai tuoi consumi e taglia i costi in bolletta."
              to="/categoria/energia"
              color="bg-[#00B14F]"
            />
            <CategoryCard 
              icon={Home} 
              title="Mutui Casa" 
              description="Che sia per l'acquisto o per una surroga, troviamo il tasso migliore per te."
              to="/categoria/mutui"
              color="bg-[#00B14F]"
            />
            <CategoryCard 
              icon={CreditCard} 
              title="Prestiti Personali" 
              description="Ottieni liquidità immediata con i tassi più bassi del mercato."
              to="/categoria/prestiti"
              color="bg-[#00B14F]"
            />
            <CategoryCard 
              icon={Wifi} 
              title="Internet e Mobile" 
              description="Fibra ottica o tariffe mobile: naviga alla massima velocità al minor prezzo."
              to="/categoria/internet"
              color="bg-[#00B14F]"
            />
            <CategoryCard 
              icon={PhoneCall} 
              title="Consulenza Gratuita" 
              description="I nostri esperti sono a tua disposizione per aiutarti a scegliere."
              to="/contatti"
              color="bg-gray-800"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-around gap-8 text-white text-center">
          <div>
            <div className="text-4xl font-bold mb-1">2M+</div>
            <div className="text-blue-100 text-sm">Utenti ogni mese</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">50+</div>
            <div className="text-blue-100 text-sm">Partner affidabili</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">450€</div>
            <div className="text-blue-100 text-sm">Risparmio medio annuo</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">4.8/5</div>
            <div className="text-blue-100 text-sm">Valutazione Trustpilot</div>
          </div>
        </div>
      </section>
    </div>
  );
};

const CategoryPage = () => {
  const location = useLocation();
  const category = location.pathname.split('/').pop() || 'auto';
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Offer[]>([]);
  const [vehicleDetails, setVehicleDetails] = useState<{brand: string, model: string, regDate: string, trim: string} | null>(null);
  const [formData, setFormData] = useState({
    // Step 1: Vehicle
    procedureType: 'compila', // 'compila' or 'carica'
    isCarOwned: 'si', // 'si' or 'no'
    plate: '',
    brand: '',
    model: '',
    purchaseYear: '',
    trim: '',
    antitheft: 'nessuno',
    towHook: 'no',
    fuel: 'benzina',
    use: 'tempo_libero',
    mileage: '10000',
    // Step 2: Driver
    dob: '',
    maritalStatus: 'celibe_nubile',
    occupation: 'impiegato',
    licenseYear: '2010',
    // Step 3: Insurance
    meritClass: '1',
    expiryDate: '',
    yearsWithoutAccidents: '5',
    // Step 4: Contact
    email: '',
    phone: '',
    privacy: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    if (name === 'plate') {
      const upperPlate = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: upperPlate }));
      
      // Mock lookup
      if (upperPlate.length === 7) {
        setTimeout(() => {
          setVehicleDetails({
            brand: 'OPEL',
            model: 'Astra 3a serie',
            regDate: '10/2009',
            trim: 'Astra 1.7 CDTI 110CV ecoFLEX Station Wagon'
          });
          setFormData(prev => ({ 
            ...prev, 
            brand: 'OPEL', 
            model: 'Astra 3a serie',
            trim: 'Astra 1.7 CDTI 110CV ecoFLEX Station Wagon'
          }));
        }, 600);
      } else if (upperPlate.length < 7) {
        setVehicleDetails(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: val }));
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      if (!formData.privacy) {
        alert("Devi accettare l'informativa sulla privacy per continuare.");
        return;
      }
      startSearch();
    }
  };

  const startSearch = async () => {
    setIsSearching(true);
    try {
      // Send lead to Firestore
      const leadData = {
        category,
        createdAt: serverTimestamp(),
        email: formData.email,
        phone: formData.phone,
        formData: { ...formData },
        status: 'new'
      };
      
      await addDoc(collection(db, 'leads'), leadData);

      // Fetch offers from Firestore
      const q = query(collection(db, 'offers'), where('category', '==', category));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer));
      
      // Simulate network delay for better UX
      setTimeout(() => {
        setResults(data);
        setIsSearching(false);
        setStep(5);
      }, 1500);
    } catch (error) {
      console.error(error);
      setIsSearching(false);
    }
  };

  const RadioOption = ({ label, name, value, checked, onChange }: any) => (
    <label className={cn(
      "flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all",
      checked ? "border-green-500 bg-green-50/30" : "border-gray-200 hover:border-gray-300"
    )}>
      <div className={cn(
        "w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all",
        checked ? "border-green-500" : "border-gray-300"
      )}>
        {checked && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
      </div>
      <input 
        type="radio" 
        name={name} 
        value={value} 
        checked={checked} 
        onChange={onChange} 
        className="hidden" 
      />
      <span className={cn("font-bold", checked ? "text-gray-900" : "text-gray-600")}>{label}</span>
    </label>
  );

  const stepLabels = ["VEICOLO", "ANAGRAFICA", "ASSICURAZIONE", "PREVENTIVI"];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto">
        {step < 5 && (
          <div className="bg-white overflow-hidden">
            {/* Stepper Header */}
            <div className="bg-white border-b border-gray-100">
              <div className="flex px-4 py-6 max-w-2xl mx-auto">
                {stepLabels.map((label, i) => {
                  const s = i + 1;
                  return (
                    <div key={label} className="flex-grow flex flex-col items-center relative">
                      <div className={cn(
                        "h-1 w-full absolute top-2.5 left-1/2 -translate-x-1/2 z-0",
                        s < step ? "bg-green-500" : "bg-gray-200"
                      )} style={{ display: i === stepLabels.length - 1 ? 'none' : 'block' }} />
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 z-10 flex items-center justify-center mb-2 transition-all",
                        s < step ? "bg-green-500 border-green-500" : 
                        s === step ? "bg-white border-green-500" : "bg-white border-gray-200"
                      )}>
                        {s < step && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                        {s === step && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold tracking-wider transition-colors text-center",
                        s === step ? "text-green-600" : "text-gray-400"
                      )}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-4xl font-bold text-gray-900 mb-4">Come vuoi procedere?</h2>
                      <p className="text-lg text-gray-600">Scegli una delle seguenti opzioni per completare il tuo preventivo:</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <RadioOption 
                        label="Compila i dati" 
                        name="procedureType" 
                        value="compila" 
                        checked={formData.procedureType === 'compila'} 
                        onChange={handleInputChange} 
                      />
                      <RadioOption 
                        label="Carica polizza" 
                        name="procedureType" 
                        value="carica" 
                        checked={formData.procedureType === 'carica'} 
                        onChange={handleInputChange} 
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-gray-900">L'auto è già tua?</h3>
                      <div className="space-y-3">
                        <RadioOption 
                          label="Si" 
                          name="isCarOwned" 
                          value="si" 
                          checked={formData.isCarOwned === 'si'} 
                          onChange={handleInputChange} 
                        />
                        <RadioOption 
                          label="No, la comprerò in futuro" 
                          name="isCarOwned" 
                          value="no" 
                          checked={formData.isCarOwned === 'no'} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-gray-900">Targa</h3>
                      <input 
                        type="text" 
                        name="plate"
                        value={formData.plate}
                        onChange={handleInputChange}
                        placeholder="AA123BB" 
                        maxLength={7}
                        className="w-full p-6 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all uppercase text-2xl font-bold tracking-widest placeholder:text-gray-300" 
                      />
                    </div>

                    {vehicleDetails && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8 pt-4"
                      >
                        <div className="space-y-4">
                          <h3 className="text-2xl font-bold text-gray-900">La tua auto</h3>
                          <div className="bg-gray-50 p-6 rounded-2xl flex items-start space-x-4 border border-gray-100">
                            <div className="bg-orange-100 p-3 rounded-xl">
                              <Car className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-lg text-gray-900">Marca e modello: <span className="font-bold">{vehicleDetails.brand} {vehicleDetails.model}</span></p>
                              <p className="text-lg text-gray-900">Data immatricolazione: <span className="font-bold">{vehicleDetails.regDate}</span></p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-2xl font-bold text-gray-900">In che anno l'hai acquistata?</h3>
                          <input 
                            type="text" 
                            name="purchaseYear"
                            value={formData.purchaseYear}
                            onChange={handleInputChange}
                            placeholder="AAAA" 
                            maxLength={4}
                            className="w-full p-6 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-2xl font-bold placeholder:text-gray-300" 
                          />
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-2xl font-bold text-gray-900">Il tuo allestimento</h3>
                          <div className="bg-gray-50 p-6 rounded-2xl flex items-center justify-between border border-gray-100">
                            <p className="text-lg text-gray-500 truncate pr-4">{vehicleDetails.trim}</p>
                            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                          </div>
                          <p className="text-sm text-green-600 font-medium">L'allestimento è verificato da banche dati ufficiali.</p>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-2xl font-bold text-gray-900">Che tipo di antifurto ha?</h3>
                          <div className="relative">
                            <select 
                              name="antitheft"
                              value={formData.antitheft}
                              onChange={handleInputChange}
                              className="w-full p-6 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-xl appearance-none pr-12"
                            >
                              <option value="nessuno">Nessun antifurto</option>
                              <option value="elettronico">Elettronico</option>
                              <option value="meccanico">Meccanico</option>
                              <option value="satellitare">Satellitare</option>
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-2xl font-bold text-gray-900">Ha un gancio di traino?</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <RadioOption 
                              label="No" 
                              name="towHook" 
                              value="no" 
                              checked={formData.towHook === 'no'} 
                              onChange={handleInputChange} 
                            />
                            <RadioOption 
                              label="Si" 
                              name="towHook" 
                              value="si" 
                              checked={formData.towHook === 'si'} 
                              onChange={handleInputChange} 
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <button 
                      onClick={handleNext}
                      disabled={!formData.plate || (formData.plate.length === 7 && !vehicleDetails)}
                      className="w-full bg-[#00B14F] text-white py-5 rounded-2xl text-xl font-bold shadow-lg hover:bg-[#009643] transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continua
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-bold text-gray-900">Dati del Conducente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Data di nascita</label>
                        <input 
                          type="date" 
                          name="dob"
                          value={formData.dob}
                          onChange={handleInputChange}
                          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Stato Civile</label>
                        <select 
                          name="maritalStatus"
                          value={formData.maritalStatus}
                          onChange={handleInputChange}
                          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                          <option value="celibe_nubile">Celibe/Nubile</option>
                          <option value="coniugato">Coniugato/a</option>
                          <option value="divorziato">Divorziato/a</option>
                          <option value="vedovo">Vedovo/a</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Professione</label>
                        <select 
                          name="occupation"
                          value={formData.occupation}
                          onChange={handleInputChange}
                          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                          <option value="impiegato">Impiegato</option>
                          <option value="libero_professionista">Libero Professionista</option>
                          <option value="operaio">Operaio</option>
                          <option value="pensionato">Pensionato</option>
                          <option value="studente">Studente</option>
                          <option value="disoccupato">Disoccupato</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Anno conseguimento patente</label>
                        <input 
                          type="number" 
                          name="licenseYear"
                          value={formData.licenseYear}
                          onChange={handleInputChange}
                          placeholder="Es. 2010" 
                          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-bold text-gray-900">Storia Assicurativa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Classe di merito (CU)</label>
                        <select 
                          name="meritClass"
                          value={formData.meritClass}
                          onChange={handleInputChange}
                          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                          {[...Array(18)].map((_, i) => (
                            <option key={i+1} value={i+1}>{i+1}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Scadenza polizza attuale</label>
                        <input 
                          type="date" 
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-semibold text-gray-700">Anni consecutivi senza sinistri</label>
                        <select 
                          name="yearsWithoutAccidents"
                          value={formData.yearsWithoutAccidents}
                          onChange={handleInputChange}
                          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                          <option value="0">0</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5 o più</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div 
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-bold text-gray-900">Contatti e Privacy</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Email</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="tua@email.it" 
                          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Telefono</label>
                        <input 
                          type="tel" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="333 1234567" 
                          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                        />
                      </div>
                      <div className="flex items-start space-x-3 pt-4">
                        <input 
                          type="checkbox" 
                          name="privacy"
                          checked={formData.privacy}
                          onChange={handleInputChange}
                          id="privacy"
                          className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500" 
                        />
                        <label htmlFor="privacy" className="text-sm text-gray-600">
                          Accetto l'informativa sulla privacy e il trattamento dei dati personali per finalità di preventivazione.
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-12">
                <button 
                  onClick={handleNext}
                  disabled={isSearching}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {isSearching ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      Ricerca in corso...
                    </div>
                  ) : (
                    <>{step === 4 ? 'Calcola Preventivi' : 'Continua'} <ChevronRight className="ml-2 w-5 h-5" /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Abbiamo trovato {results.length} offerte</h2>
                <p className="text-gray-500">Ordinate per prezzo più basso</p>
              </div>
              <div className="hidden md:block">
                <span className="text-sm text-gray-400">Ultimo aggiornamento: Oggi, 12:30</span>
              </div>
            </div>

            <div className="space-y-4">
              {results.length > 0 ? results.map((offer, idx) => (
                <motion.div 
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-xl p-2">
                      <img src={offer.providerLogo} alt={offer.provider} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    
                    <div className="flex-grow text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{offer.provider}</h3>
                        <div className="flex items-center text-yellow-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-xs font-bold text-gray-600 ml-1">{offer.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">{offer.name}</p>
                      
                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        {offer.features.map((f, i) => (
                          <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="w-full md:w-auto text-center md:text-right border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
                      <div className="mb-4">
                        <span className="text-3xl font-black text-gray-900">€{offer.price}</span>
                        <span className="text-gray-400 text-sm ml-1">/{offer.period}</span>
                      </div>
                      <button className="w-full md:w-auto bg-green-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-600 transition-all shadow-md">
                        Vai al sito
                      </button>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300">
                  <p className="text-gray-500">Nessuna offerta trovata per questa categoria.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'offers' | 'leads'>('offers');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastOffer, setLastOffer] = useState<any>(null);
  const [lastLead, setLastLead] = useState<any>(null);
  const PAGE_SIZE = 15;

  const [newOffer, setNewOffer] = useState<Partial<Offer>>({
    provider: '',
    name: '',
    price: 0,
    period: 'mese',
    category: 'auto',
    features: ['Assistenza 24h', 'Prezzo bloccato'],
    rating: 4.5,
    providerLogo: 'https://logo.clearbit.com/prima.it'
  });

  useEffect(() => {
    // Initial fetch for offers
    const qOffers = query(collection(db, 'offers'), limit(PAGE_SIZE));
    const unsubscribeOffers = onSnapshot(qOffers, (snapshot) => {
      setOffers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer)));
      setLastOffer(snapshot.docs[snapshot.docs.length - 1]);
      setLoading(false);
    });

    // Initial fetch for leads
    const qLeads = query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
    const unsubscribeLeads = onSnapshot(qLeads, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLastLead(snapshot.docs[snapshot.docs.length - 1]);
    });

    return () => {
      unsubscribeOffers();
      unsubscribeLeads();
    };
  }, []);

  const loadMoreLeads = async () => {
    if (!lastLead) return;
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'), startAfter(lastLead), limit(PAGE_SIZE));
    const snapshot = await getDocs(q);
    const newLeads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLeads([...leads, ...newLeads]);
    setLastLead(snapshot.docs[snapshot.docs.length - 1]);
  };

  const loadMoreOffers = async () => {
    if (!lastOffer) return;
    const q = query(collection(db, 'offers'), startAfter(lastOffer), limit(PAGE_SIZE));
    const snapshot = await getDocs(q);
    const newOffers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer));
    setOffers([...offers, ...newOffers]);
    setLastOffer(snapshot.docs[snapshot.docs.length - 1]);
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'offers'), {
        ...newOffer,
        price: Number(newOffer.price),
        createdAt: serverTimestamp()
      });
      setNewOffer({ 
        ...newOffer, 
        provider: '', 
        name: '', 
        price: 0,
        providerLogo: 'https://logo.clearbit.com/prima.it'
      });
    } catch (err) {
      console.error("Error adding offer:", err);
      alert("Errore durante l'aggiunta dell'offerta. Controlla i permessi.");
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questa offerta?")) {
      await deleteDoc(doc(db, 'offers', id));
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (confirm("Eliminare questa richiesta?")) {
      await deleteDoc(doc(db, 'leads', id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">Pannello Amministratore</h2>
              <p className="text-gray-400">Gestisci offerte e visualizza le richieste degli utenti</p>
            </div>
            <div className="flex space-x-2 bg-gray-800 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('offers')}
                className={cn("px-6 py-2 rounded-lg font-semibold transition-all", activeTab === 'offers' ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white")}
              >
                Offerte
              </button>
              <button 
                onClick={() => setActiveTab('leads')}
                className={cn("px-6 py-2 rounded-lg font-semibold transition-all", activeTab === 'leads' ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white")}
              >
                Leads ({leads.length})
              </button>
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'offers' ? (
              <div className="space-y-12">
                {/* Add Offer Form */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <h3 className="text-xl font-bold mb-6">Aggiungi Nuova Offerta</h3>
                  <form onSubmit={handleAddOffer} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                      type="text" placeholder="Provider (es. Prima)" 
                      className="p-3 border rounded-xl"
                      value={newOffer.provider}
                      onChange={e => setNewOffer({...newOffer, provider: e.target.value})}
                      required
                    />
                    <input 
                      type="text" placeholder="Nome Offerta" 
                      className="p-3 border rounded-xl"
                      value={newOffer.name}
                      onChange={e => setNewOffer({...newOffer, name: e.target.value})}
                      required
                    />
                    <input 
                      type="number" placeholder="Prezzo" 
                      className="p-3 border rounded-xl"
                      value={newOffer.price}
                      onChange={e => setNewOffer({...newOffer, price: Number(e.target.value)})}
                      required
                    />
                    <select 
                      className="p-3 border rounded-xl"
                      value={newOffer.category}
                      onChange={e => setNewOffer({...newOffer, category: e.target.value})}
                    >
                      <option value="auto">Auto</option>
                      <option value="energia">Energia</option>
                      <option value="mutui">Mutui</option>
                      <option value="internet">Internet</option>
                    </select>
                    <select 
                      className="p-3 border rounded-xl"
                      value={newOffer.period}
                      onChange={e => setNewOffer({...newOffer, period: e.target.value as any})}
                    >
                      <option value="mese">Mese</option>
                      <option value="anno">Anno</option>
                    </select>
                    <button type="submit" className="bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
                      Aggiungi Offerta
                    </button>
                  </form>
                </div>

                {/* Offers List */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 text-sm uppercase tracking-wider">
                        <th className="pb-4 font-semibold">Provider</th>
                        <th className="pb-4 font-semibold">Nome</th>
                        <th className="pb-4 font-semibold">Categoria</th>
                        <th className="pb-4 font-semibold">Prezzo</th>
                        <th className="pb-4 font-semibold text-right">Azioni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {offers.map(offer => (
                        <tr key={offer.id} className="group hover:bg-gray-50 transition-colors">
                          <td className="py-4 font-bold text-gray-900">{offer.provider}</td>
                          <td className="py-4 text-gray-600">{offer.name}</td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-md uppercase">{offer.category}</span>
                          </td>
                          <td className="py-4 font-bold">€{offer.price}/{offer.period}</td>
                          <td className="py-4 text-right">
                            <button 
                              onClick={() => handleDeleteOffer(offer.id)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Elimina"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {lastOffer && (
                  <div className="flex justify-center mt-8">
                    <button 
                      onClick={loadMoreOffers}
                      className="px-8 py-3 bg-white border-2 border-gray-100 text-gray-600 rounded-xl font-bold hover:border-[#00B14F] hover:text-[#00B14F] transition-all"
                    >
                      Carica Altre Offerte
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-xl font-bold">Richieste Preventivo Ricevute</h3>
                {leads.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-3xl">
                    Nessuna richiesta ricevuta finora.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {leads.map(lead => (
                      <div key={lead.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex justify-between items-center group hover:border-[#00B14F] transition-all">
                        <div className="flex items-center space-x-4">
                          <div className={cn(
                            "p-3 rounded-xl",
                            lead.category === 'auto' ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                          )}>
                            {lead.category === 'auto' ? <Car className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs font-bold bg-[#00B14F] text-white px-2 py-0.5 rounded uppercase tracking-tighter">
                                {lead.category}
                              </span>
                              <span className="text-xs text-gray-400">
                                {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleString() : 'Data non disponibile'}
                              </span>
                            </div>
                            <p className="font-bold text-gray-900 flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {lead.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setSelectedLead(lead)}
                            className="bg-white text-[#00B14F] border border-[#00B14F] p-2 rounded-xl hover:bg-[#00B14F] hover:text-white transition-all shadow-sm"
                            title="Visualizza Dettagli"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteLead(lead.id)}
                            className="bg-white text-red-500 border border-red-200 p-2 rounded-xl hover:bg-red-50 transition-all shadow-sm"
                            title="Elimina Lead"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(activeTab === 'leads' && lastLead) && (
                  <div className="flex justify-center mt-8">
                    <button 
                      onClick={loadMoreLeads}
                      className="px-8 py-3 bg-white border-2 border-gray-100 text-gray-600 rounded-xl font-bold hover:border-[#00B14F] hover:text-[#00B14F] transition-all"
                    >
                      Vedi Altre Richieste
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lead Details Modal */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">Dettagli Lead</h3>
                <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Veicolo</h4>
                  <p className="text-gray-900"><strong>Targa:</strong> {selectedLead.plate || 'N/D'}</p>
                  <p className="text-gray-900"><strong>Marca/Modello:</strong> {selectedLead.brand || 'N/D'}</p>
                  <p className="text-gray-900"><strong>Alimentazione:</strong> {selectedLead.fuel || 'N/D'}</p>
                  <p className="text-gray-900"><strong>Km Annui:</strong> {selectedLead.mileage || 'N/D'}</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Conducente</h4>
                  <p className="text-gray-900"><strong>Data Nascita:</strong> {selectedLead.dob || 'N/D'}</p>
                  <p className="text-gray-900"><strong>Stato Civile:</strong> {selectedLead.maritalStatus || 'N/D'}</p>
                  <p className="text-gray-900"><strong>Professione:</strong> {selectedLead.occupation || 'N/D'}</p>
                  <p className="text-gray-900"><strong>Anno Patente:</strong> {selectedLead.licenseYear || 'N/D'}</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Assicurazione</h4>
                  <p className="text-gray-900"><strong>Classe Merito:</strong> {selectedLead.meritClass || 'N/D'}</p>
                  <p className="text-gray-900"><strong>Scadenza:</strong> {selectedLead.expiryDate || 'N/D'}</p>
                  <p className="text-gray-900"><strong>Anni senza sinistri:</strong> {selectedLead.yearsWithoutAccidents || 'N/D'}</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Contatti</h4>
                  <p className="text-gray-900"><strong>Email:</strong> {selectedLead.email || 'N/D'}</p>
                  <p className="text-gray-900"><strong>Telefono:</strong> {selectedLead.phone || 'N/D'}</p>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t flex justify-end">
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="bg-gray-900 text-white px-8 py-2 rounded-xl font-bold"
                >
                  Chiudi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GoogleSignInButton = ({ label }: { label: string }) => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      console.error('Google Sign-In error:', err);
      alert("Errore durante l'accesso con Google");
    }
  };

  return (
    <button 
      type="button"
      onClick={handleGoogleSignIn}
      className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-gray-200 py-4 rounded-xl text-lg font-bold text-gray-700 hover:border-[#00B14F] hover:text-[#00B14F] transition-all transform hover:scale-[1.01] active:scale-[0.99]"
    >
      <svg className="w-6 h-6" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      <span>{label}</span>
    </button>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Errore durante l\'accesso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-8"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-[#00B14F] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Smile className="text-white w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Bentornato</h2>
          <p className="text-gray-600 mt-2">Accedi al tuo account VaBeneCosi</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <GoogleSignInButton label="Accedi con Google" />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">oppure</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="latua@email.it"
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-[#00B14F] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
            <input 
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-[#00B14F] outline-none transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#00B14F] text-white py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-[#009643] transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-gray-600">
            Non hai ancora un account?{' '}
            <Link to="/register" className="text-[#00B14F] font-bold hover:underline">Registrati</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(userCredential.user, { displayName: formData.name });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Errore durante la registrazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-8"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-[#00B14F] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Smile className="text-white w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Crea Account</h2>
          <p className="text-gray-600 mt-2">Unisciti a VaBeneCosi e inizia a risparmiare</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <GoogleSignInButton label="Registrati con Google" />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">oppure</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Nome Completo</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Mario Rossi"
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-[#00B14F] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="latua@email.it"
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-[#00B14F] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
            <input 
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-[#00B14F] outline-none transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#00B14F] text-white py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-[#009643] transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Registrazione in corso...' : 'Registrati'}
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-gray-600">
            Hai già un account?{' '}
            <Link to="/login" className="text-[#00B14F] font-bold hover:underline">Accedi</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-[#00B14F] rounded flex items-center justify-center">
              <Smile className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight italic">VaBeneCosi</span>
          </div>
          <p className="text-sm leading-relaxed">
            Il primo comparatore in Italia per trasparenza e risparmio. Aiutiamo milioni di italiani a scegliere meglio ogni giorno.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6">Assicurazioni</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/categoria/auto" className="hover:text-[#00B14F] transition-colors">Auto</Link></li>
            <li><Link to="/categoria/moto" className="hover:text-[#00B14F] transition-colors">Moto</Link></li>
            <li><Link to="/categoria/casa" className="hover:text-[#00B14F] transition-colors">Casa</Link></li>
            <li><Link to="/categoria/vita" className="hover:text-[#00B14F] transition-colors">Vita</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Energia e Telco</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/categoria/energia" className="hover:text-[#00B14F] transition-colors">Luce e Gas</Link></li>
            <li><Link to="/categoria/internet" className="hover:text-[#00B14F] transition-colors">Internet Casa</Link></li>
            <li><Link to="/categoria/mobile" className="hover:text-[#00B14F] transition-colors">Tariffe Mobile</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Azienda</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/chi-siamo" className="hover:text-[#00B14F] transition-colors">Chi siamo</Link></li>
            <li><Link to="/lavora-con-noi" className="hover:text-[#00B14F] transition-colors">Lavora con noi</Link></li>
            <li><Link to="/privacy" className="hover:text-[#00B14F] transition-colors">Privacy Policy</Link></li>
            <li><Link to="/contatti" className="hover:text-[#00B14F] transition-colors">Contatti</Link></li>
            <li><Link to="/admin" className="text-[#00B14F] font-bold hover:underline">Area Admin</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs">© 2026 VaBeneCosi S.p.A. - P.IVA 12345678901 - Iscrizione IVASS n. E000123456</p>
        <div className="flex space-x-6">
          <span className="text-xs hover:text-[#00B14F] cursor-pointer transition-colors">Facebook</span>
          <span className="text-xs hover:text-[#00B14F] cursor-pointer transition-colors">LinkedIn</span>
          <span className="text-xs hover:text-[#00B14F] cursor-pointer transition-colors">Instagram</span>
        </div>
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen font-sans">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/categoria/:category" element={<CategoryPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
            {/* Fallback for other routes */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
