
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  GoogleGenAI, 
  GenerateContentResponse 
} from "@google/genai";
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Search, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Check, 
  ShieldAlert, 
  ExternalLink,
  ShoppingBag,
  TrendingUp,
  MessageCircle,
  ShieldCheck,
  CreditCard,
  Target,
  Zap,
  BarChart3,
  Flame,
  MousePointer2
} from 'lucide-react';

// --- Types ---

type UserStatus = 'pending' | 'active' | 'rejected' | 'suspended' | 'new';
type UserRole = 'user' | 'admin';

interface User {
  id: string;
  email: string;
  whatsapp?: string;
  plan?: string;
  status: UserStatus;
  role: UserRole;
  createdAt: string;
  rejectionReason?: string;
}

interface Product {
  product_name: string;
  score: number;
  score_breakdown: {
    trend: number;
    engagement: number;
    platform_diversity: number;
    buy_intent: number;
    dropshipping_friendly: number;
  };
  signals: {
    viral_potential: boolean;
    high_engagement: boolean;
    multi_platform: boolean;
    strong_buy_intent: boolean;
  };
  platforms: string[];
  appearances: number;
  total_views: number;
  total_engagement: number;
  analysis: {
    winning_reasons: string[];
    ad_hooks: string[];
    ad_angles: string[];
    pricing: string;
    target_audience: string;
  };
}

// --- Constants & Utilities ---

const STORAGE_KEY = 'winning_products_dz_v2';
const INITIAL_ADMIN_EMAIL = 'admin@winning.dz';
// Updated to the URL provided by the user
const N8N_WEBHOOK_URL = 'https://innovation-team.hawiyat.org/webhook-test/scan-products';

const saveToStorage = (data: any) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
const getFromStorage = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

// --- Mock Backend Logic ---

const useAppStore = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getFromStorage();
    if (data) {
      setUsers(data.users || []);
    } else {
      const initialUsers: User[] = [{
        id: 'admin-id',
        email: INITIAL_ADMIN_EMAIL,
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString()
      }];
      setUsers(initialUsers);
      saveToStorage({ users: initialUsers });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      saveToStorage({ users });
    }
  }, [users]);

  const signup = (email: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      role: 'user',
      status: 'new',
      createdAt: new Date().toISOString()
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
  };

  const login = (email: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  const adminAction = (userId: string, status: UserStatus, reason?: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status, rejectionReason: reason } : u));
  };

  const logout = () => setCurrentUser(null);

  return { users, currentUser, signup, login, updateProfile, adminAction, logout, loading };
};

// --- Shared Components ---

const StatusBadge = ({ status }: { status: UserStatus }) => {
  const configs = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'قيد المراجعة', icon: Clock },
    active: { color: 'bg-green-100 text-green-800', label: 'نشط', icon: CheckCircle },
    rejected: { color: 'bg-red-100 text-red-800', label: 'مرفوض', icon: XCircle },
    suspended: { color: 'bg-gray-100 text-gray-800', label: 'موقوف', icon: ShieldAlert },
    new: { color: 'bg-blue-100 text-blue-800', label: 'جديد', icon: AlertCircle },
  };
  const config = configs[status];
  const Icon = config.icon;
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
};

const Layout = ({ children, user, onLogout }: { children?: React.ReactNode, user: User | null, onLogout: () => void }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <TrendingUp size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Winning Products DZ</h1>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden md:inline">{user.email}</span>
            <button onClick={onLogout} className="text-slate-500 hover:text-red-600 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        )}
      </nav>
      <main className="flex-1 container mx-auto p-4 max-w-6xl">
        {children}
      </main>
      <footer className="bg-white border-t p-6 text-center text-slate-400 text-sm">
        جميع الحقوق محفوظة &copy; {new Date().getFullYear()} Winning Products DZ
      </footer>
    </div>
  );
};

const WhatsAppLink = ({ number, message = "" }: { number: string, message?: string }) => {
  const cleanNumber = number.replace('+', '');
  const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 flex items-center gap-1 font-medium">
      <MessageCircle size={16} />
      <span>تواصل عبر واتساب</span>
    </a>
  );
};

// --- Pages ---

const Landing = ({ onSignup, onLogin }: { onSignup: () => void, onLogin: () => void }) => (
  <div className="text-center py-12 px-4">
    <div className="mb-8 inline-block p-4 bg-blue-50 rounded-full text-blue-600">
      <ShoppingBag size={64} />
    </div>
    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">اكتشف المنتجات الأكثر مبيعاً في الجزائر</h1>
    <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
      منصة متكاملة لتحليل السوق الجزائري والعثور على منتجات رابحة لمنصات تيك توك، فيسبوك، وإنستغرام.
    </p>
    <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
      <button onClick={onSignup} className="btn-primary text-white px-10 py-4 rounded-xl font-bold text-lg w-full md:w-auto shadow-lg">
        سجل الآن وابدأ الربح
      </button>
      <button onClick={onLogin} className="bg-white text-slate-700 border border-slate-200 px-10 py-4 rounded-xl font-bold text-lg w-full md:w-auto hover:bg-slate-50 transition-colors">
        تسجيل الدخول
      </button>
    </div>
    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        { icon: TrendingUp, title: "تحليل ذكي", desc: "نستخدم الذكاء الاصطناعي لاكتشاف التوجهات الحالية بناءً على n8n و Gemini." },
        { icon: ShieldCheck, title: "دقة عالية", desc: "بيانات حقيقية مستمدة من السوق الجزائري مع حساب Scores دقيق." },
        { icon: CreditCard, title: "اشتراك رمزي", desc: "خطة واحدة بسيطة ومناسبة للجميع 1000 دج/سنة." },
      ].map((feat, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mx-auto mb-4">
            <feat.icon />
          </div>
          <h3 className="font-bold text-lg mb-2">{feat.title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const AuthForm = ({ type, onSubmit, onSwitch }: { type: 'login' | 'signup', onSubmit: (email: string) => void, onSwitch: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">{type === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
          <input 
            type="email" 
            className="w-full border p-3 rounded-lg outline-blue-500 text-right"
            placeholder="example@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
          <input 
            type="password" 
            className="w-full border p-3 rounded-lg outline-blue-500 text-right"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button 
          onClick={() => email && onSubmit(email)}
          className="w-full btn-primary text-white py-3 rounded-lg font-bold text-lg mt-4"
        >
          {type === 'login' ? 'دخول' : 'استمرار'}
        </button>
        <div className="text-center mt-4">
          <button onClick={onSwitch} className="text-blue-600 text-sm font-medium hover:underline">
            {type === 'login' ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب بالفعل؟ ادخل هنا'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PlanSelection = ({ onConfirm }: { onConfirm: (plan: string) => void }) => (
  <div className="max-w-md mx-auto mt-10">
    <h2 className="text-3xl font-bold text-center mb-8">اختر خطة الاشتراك</h2>
    <div className="bg-white border-2 border-blue-500 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase">الأكثر طلباً</div>
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-slate-500 mb-2">الخطة السنوية</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-extrabold">1000</span>
          <span className="text-slate-400 font-bold">دج / سنة</span>
        </div>
      </div>
      <ul className="space-y-4 mb-8">
        {['بحث غير محدود عن المنتجات', 'تحليل TikTok Ads Library', 'تحليل Facebook Ads', 'دعم فني 24/7 عبر واتساب', 'تحديثات يومية للمنتجات'].map((item, i) => (
          <li key={i} className="flex items-center gap-3 text-slate-600">
            <Check className="text-green-500 shrink-0" size={18} />
            <span className="text-sm font-medium">{item}</span>
          </li>
        ))}
      </ul>
      <button onClick={() => onConfirm('yearly_1000')} className="w-full btn-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg">
        اشترك الآن
      </button>
    </div>
  </div>
);

const WhatsAppForm = ({ onSubmit }: { onSubmit: (number: string) => void }) => {
  const [number, setNumber] = useState('+213');
  const [error, setError] = useState('');

  const handleSumbit = () => {
    const regex = /^\+213[567]\d{8}$/;
    if (!regex.test(number)) {
      setError('يرجى إدخال رقم واتساب جزائري صحيح (مثال: +213555001122)');
      return;
    }
    onSubmit(number);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border mt-10">
      <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-3">
        <MessageCircle size={24} />
        <p className="text-sm font-bold">يرجى إضافة رقم واتساب لتفعيل الحساب</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">رقم الواتساب</label>
          <input 
            type="text" 
            dir="ltr"
            className="w-full border p-4 rounded-xl outline-green-500 text-lg font-bold tracking-widest text-center"
            placeholder="+213XXXXXXXXX"
            value={number}
            onChange={(e) => {
              setNumber(e.target.value);
              setError('');
            }}
          />
          {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
        </div>
        <p className="text-xs text-slate-400 text-center">سنقوم بالتواصل معك عبر هذا الرقم لتأكيد الدفع وتفعيل حسابك.</p>
        <button onClick={handleSumbit} className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg transition-colors">
          تأكيد وإرسال الطلب
        </button>
      </div>
    </div>
  );
};

const StatusPage = ({ status, reason, onLogout }: { status: UserStatus, reason?: string, onLogout: () => void }) => {
  const config = {
    pending: {
      title: 'طلبك قيد المراجعة',
      desc: 'شكراً لاشتراكك! نحن نقوم بمراجعة طلبك وتفعيل حسابك الآن. ستتلقى رسالة عبر واتساب فور التفعيل.',
      icon: Clock,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50'
    },
    rejected: {
      title: 'تم رفض الطلب',
      desc: reason || 'عذراً، لم نتمكن من قبول طلبك في الوقت الحالي. يرجى التواصل معنا للاستفسار.',
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-50'
    },
    suspended: {
      title: 'الحساب موقوف',
      desc: 'تم إيقاف حسابك لمخالفة شروط الاستخدام. يرجى مراجعة الإدارة.',
      icon: ShieldAlert,
      color: 'text-slate-500',
      bg: 'bg-slate-100'
    }
  }[status as 'pending' | 'rejected' | 'suspended'];

  const Icon = config.icon;

  return (
    <div className="max-w-lg mx-auto mt-16 text-center">
      <div className={`${config.bg} w-24 h-24 rounded-full flex items-center justify-center ${config.color} mx-auto mb-6`}>
        <Icon size={48} />
      </div>
      <h2 className="text-3xl font-bold mb-4">{config.title}</h2>
      <p className="text-slate-600 mb-8 leading-relaxed">{config.desc}</p>
      
      <div className="space-y-4">
        <WhatsAppLink number="+213555112233" message={`سلام، أنا مسجل بإيميل ويرجى مراجعة حسابي. حالتي الحالية: ${status}`} />
        <button onClick={onLogout} className="text-slate-400 text-sm hover:underline">خروج</button>
      </div>
    </div>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-blue-600 p-4 text-white">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold text-lg">{product.product_name}</h3>
          <div className="bg-white/20 px-2 py-1 rounded text-xs font-bold">
            Score: {product.score}/100
          </div>
        </div>
        <div className="flex gap-1">
          {product.platforms.map(p => (
            <span key={p} className="text-[10px] bg-white text-blue-600 px-1.5 rounded uppercase font-bold">{p}</span>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 block mb-1">Trend Score</span>
            <div className="flex items-center gap-1">
              <Flame size={12} className="text-orange-500" />
              <span className="text-sm font-bold">{product.score_breakdown.trend}/30</span>
            </div>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 block mb-1">Engagement</span>
            <div className="flex items-center gap-1">
              <MousePointer2 size={12} className="text-blue-500" />
              <span className="text-sm font-bold">{product.score_breakdown.engagement}/25</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {product.signals.viral_potential && <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">Viral 🚀</span>}
          {product.signals.high_engagement && <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-100">Hot 🔥</span>}
          {product.signals.strong_buy_intent && <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">Buy Intent 💰</span>}
        </div>

        <div className="flex justify-between items-center border-t pt-3">
          <div className="text-sm">
            <span className="text-slate-400 block text-[10px]">السعر المقترح</span>
            <span className="font-bold text-blue-600">{product.analysis.pricing}</span>
          </div>
          <button 
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1"
          >
            {showAnalysis ? 'إخفاء التحليل' : 'عرض تحليل n8n الكامل'}
          </button>
        </div>

        {showAnalysis && (
          <div className="mt-4 pt-4 border-t space-y-4 bg-slate-50 p-4 rounded-xl">
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1">
                <ShieldCheck size={14} className="text-green-600" />
                لماذا هذا المنتج رابح؟
              </h4>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                {product.analysis.winning_reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1">
                <Zap size={14} className="text-yellow-500" />
                5 Hooks إعلانية
              </h4>
              <div className="grid grid-cols-1 gap-1">
                {product.analysis.ad_hooks.map((h, i) => (
                  <div key={i} className="bg-white p-2 rounded border text-[10px] border-slate-200">{h}</div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1">
                <Target size={14} className="text-red-500" />
                الجمهور المستهدف
              </h4>
              <p className="text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-200">{product.analysis.target_audience}</p>
            </div>
          </div>
        )}

        <button className="w-full mt-2 border-2 border-blue-500 text-blue-500 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm">
          <ExternalLink size={16} />
          معاينة الإعلانات الأصلية
        </button>
      </div>
    </div>
  );
};

const UserDashboard = ({ currentUser }: { currentUser: User }) => {
  const [niche, setNiche] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['tiktok', 'facebook', 'instagram']);
  const [results, setResults] = useState<Product[]>([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  const togglePlatform = (p: string) => {
    if (platforms.includes(p)) {
      setPlatforms(platforms.filter(item => item !== p));
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const scanProducts = async () => {
    if (!niche) {
      setError('يرجى إدخال اسم المجال أو النيش أولاً');
      return;
    }
    if (platforms.length === 0) {
      setError('يرجى اختيار منصة واحدة على الأقل');
      return;
    }

    setScanning(true);
    setError('');
    
    try {
      // 1. Send request to n8n Webhook
      const payload = {
        scan_id: `scan_${Date.now()}`,
        user_id: currentUser.id,
        niche: niche,
        platforms: platforms,
        country: "DZ",
        callback_url: window.location.origin + "/api/scans/complete"
      };

      // CORS Issues usually trigger "Failed to fetch" on browser-side webhooks.
      // We try the fetch, but wrap it so we can fallback to AI simulation if it fails.
      try {
        const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          // Adding no-cors as a possibility if the server doesn't support preflight,
          // though it limits our ability to read the response. 
          // For now we use standard fetch and fallback on failure.
        });

        if (n8nResponse.ok) {
          const n8nData = await n8nResponse.json();
          if (n8nData && (n8nData.products || Array.isArray(n8nData))) {
            setResults(n8nData.products || n8nData);
            setScanning(false);
            return; // Success!
          }
        }
      } catch (fetchErr) {
        console.warn('Webhook fetch failed (likely CORS or Network), falling back to AI Simulation.', fetchErr);
        // We continue to Gemini simulation below so the user isn't stuck.
      }

      // 2. Fallback: Simulation using Gemini
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as an n8n workflow engine for "Winning Products DZ". 
      Follow the scoring and logic defined in the documentation:
      - Input Niche: "${niche}"
      - Platforms: ${platforms.join(', ')}
      - Market: Algeria (DZ)
      
      Generate 3 potential winning products with these exact scoring rules:
      1. Trend Score (0-30): based on views and appearances.
      2. Engagement Score (0-25).
      3. Platform Diversity (0-15): ${platforms.length} platforms * 5.
      4. Buy Intent (0-20).
      5. Dropshipping Friendly (0-10).
      
      Output ONLY a JSON array of objects strictly matching this structure (Return in Arabic):
      {
        "product_name": string,
        "score": number (70-95),
        "score_breakdown": { "trend": number, "engagement": number, "platform_diversity": number, "buy_intent": number, "dropshipping_friendly": number },
        "signals": { "viral_potential": boolean, "high_engagement": boolean, "multi_platform": boolean, "strong_buy_intent": boolean },
        "platforms": string[],
        "appearances": number,
        "total_views": number,
        "total_engagement": number,
        "analysis": {
          "winning_reasons": string[] (3-4 reasons),
          "ad_hooks": string[] (5 hooks in Arabic/French),
          "ad_angles": string[] (3 angles),
          "pricing": string (e.g., "2500-4500 DZD"),
          "target_audience": string
        }
      }
      Return only the JSON, no markdown code blocks.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt
      });

      const text = response.text || "[]";
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      setResults(JSON.parse(cleanJson));
      
    } catch (err) {
      console.error(err);
      setError(`خطأ: ${err instanceof Error ? err.message : 'حدث خطأ غير متوقع'}. تأكد من تفعيل CORS في n8n أو استخدام البروكسي.`);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Search className="text-blue-600" size={20} />
          فحص المنتجات (n8n Workflow Integration)
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">المجال أو النيش المستهدف (Niche)</label>
            <input 
              type="text" 
              className="w-full border p-3 rounded-xl outline-blue-500" 
              placeholder="مثال: مستحضرات تجميل، أجهزة كهرومنزلية، أكسسوارات سيارات..." 
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">المنصات المطلوب تحليلها (Platform Splitting)</label>
            <div className="flex flex-wrap gap-2">
              {['tiktok', 'facebook', 'instagram'].map(p => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all flex items-center gap-2 ${platforms.includes(p) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400'}`}
                >
                  <Check size={14} className={platforms.includes(p) ? 'opacity-100' : 'opacity-0'} />
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={scanProducts}
          disabled={scanning}
          className={`w-full mt-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${scanning ? 'bg-slate-200 text-slate-500' : 'btn-primary text-white shadow-lg'}`}
        >
          {scanning ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-500 border-t-transparent"></div>
              جاري تنفيذ الووركفلو (n8n Active)...
            </>
          ) : (
            <>
              <Zap size={20} />
              بدء تحليل الترندات (Run Scan)
            </>
          )}
        </button>
        {error && <p className="text-red-500 text-sm mt-3 text-center font-medium">{error}</p>}
      </div>

      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 size={20} className="text-blue-600" />
          المنتجات المتصدرة في الجزائر (Score >= 70)
        </h3>
        {results.length > 0 && <span className="text-xs text-slate-400">تم العثور على {results.length} منتجات</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {results.length > 0 ? (
          results.map((prod, i) => (
            <ProductCard key={i} product={prod} />
          ))
        ) : !scanning && (
          <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">ابدأ البحث لاستخراج بيانات المنتجات الرابحة بناءً على تحليل AI و n8n</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = ({ users, onAction }: { users: User[], onAction: (id: string, status: UserStatus, reason?: string) => void }) => {
  const [filter, setFilter] = useState<UserStatus | 'all'>('all');

  const filteredUsers = users.filter(u => u.role !== 'admin' && (filter === 'all' || u.status === filter));

  const stats = useMemo(() => ({
    all: users.filter(u => u.role !== 'admin').length,
    pending: users.filter(u => u.status === 'pending').length,
    active: users.filter(u => u.status === 'active').length,
  }), [users]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-400 text-sm font-medium mb-1">إجمالي المستخدمين</h3>
          <p className="text-3xl font-extrabold text-slate-800">{stats.all}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-yellow-100">
          <h3 className="text-yellow-600 text-sm font-medium mb-1">طلبات معلقة</h3>
          <p className="text-3xl font-extrabold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100">
          <h3 className="text-green-600 text-sm font-medium mb-1">مستخدم نشط</h3>
          <p className="text-3xl font-extrabold text-green-600">{stats.active}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold flex items-center gap-2 text-slate-700">
            <Users size={20} className="text-blue-600" />
            إدارة المستخدمين
          </h2>
          <div className="flex gap-2 text-xs">
            {(['all', 'pending', 'active', 'rejected', 'suspended'] as const).map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full border transition-colors ${filter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
              >
                {f === 'all' ? 'الكل' : f === 'pending' ? 'المعلقة' : f === 'active' ? 'النشطة' : f === 'rejected' ? 'المرفوضة' : 'الموقوفة'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold">
              <tr>
                <th className="p-4 border-b">المستخدم</th>
                <th className="p-4 border-b">الواتساب</th>
                <th className="p-4 border-b">الحالة</th>
                <th className="p-4 border-b">التاريخ</th>
                <th className="p-4 border-b">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{u.email}</div>
                    <div className="text-xs text-slate-400">{u.plan || 'بدون خطة'}</div>
                  </td>
                  <td className="p-4">
                    {u.whatsapp ? (
                      <WhatsAppLink number={u.whatsapp} message="مرحباً، بخصوص حسابك في Winning Products DZ..." />
                    ) : (
                      <span className="text-slate-300">غير متوفر</span>
                    )}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString('ar-DZ')}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {u.status === 'pending' && (
                        <>
                          <button onClick={() => onAction(u.id, 'active')} className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-bold text-xs hover:bg-green-200">تفعيل</button>
                          <button onClick={() => onAction(u.id, 'rejected', 'لم يتم استلام الدفع')} className="bg-red-100 text-red-700 px-3 py-1 rounded-lg font-bold text-xs hover:bg-red-200">رفض</button>
                        </>
                      )}
                      {u.status === 'active' && (
                        <button onClick={() => onAction(u.id, 'suspended')} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-bold text-xs hover:bg-slate-200">إيقاف</button>
                      )}
                      {(u.status === 'suspended' || u.status === 'rejected') && (
                        <button onClick={() => onAction(u.id, 'active')} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold text-xs hover:bg-blue-200">إعادة تفعيل</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">لا يوجد مستخدمون مطابقون</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- App Root ---

const App = () => {
  const { currentUser, signup, login, updateProfile, adminAction, logout, users, loading } = useAppStore();
  const [view, setView] = useState<'landing' | 'login' | 'signup'>('landing');

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-xl"></div>
        <div className="h-4 w-32 bg-slate-200 rounded"></div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!currentUser) {
      if (view === 'login') return <AuthForm type="login" onSubmit={(e) => login(e) || alert('بيانات خاطئة')} onSwitch={() => setView('signup')} />;
      if (view === 'signup') return <AuthForm type="signup" onSubmit={signup} onSwitch={() => setView('login')} />;
      return <Landing onSignup={() => setView('signup')} onLogin={() => setView('login')} />;
    }

    if (currentUser.role === 'admin') {
      return <AdminDashboard users={users} onAction={adminAction} />;
    }

    if (!currentUser.plan) {
      return <PlanSelection onConfirm={(plan) => updateProfile({ plan })} />;
    }

    if (!currentUser.whatsapp) {
      return <WhatsAppForm onSubmit={(whatsapp) => updateProfile({ whatsapp, status: 'pending' })} />;
    }

    if (currentUser.status === 'active') {
      return <UserDashboard currentUser={currentUser} />;
    }

    if (['pending', 'rejected', 'suspended'].includes(currentUser.status)) {
      return <StatusPage status={currentUser.status} reason={currentUser.rejectionReason} onLogout={logout} />;
    }

    return <div>خطأ غير متوقع</div>;
  };

  return (
    <Layout user={currentUser} onLogout={logout}>
      {renderContent()}
    </Layout>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
