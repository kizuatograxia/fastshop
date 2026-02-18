import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, Lock, Eye, EyeOff, User, Phone, MapPin, Calendar,
    CreditCard, ChevronRight, ChevronLeft, Check, Gift, Loader2,
    Smartphone, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { api } from "@/lib/api";
import mascotZe from "@/assets/mascot-ze.png";

// ─── Types ──────────────────────────────────────────────
interface FormData {
    email: string;
    confirmEmail: string;
    birthDate: string;
    cpf: string;
    gender: string;
    address: string;
    number: string;
    district: string;
    city: string;
    state: string;
    cep: string;
    country: string;
    phone: string;
    username: string;
    password: string;
    promoCode: string;
    acceptTerms: boolean;
    acceptBonus: boolean;
}

const INITIAL_FORM: FormData = {
    email: "", confirmEmail: "", birthDate: "", cpf: "", gender: "",
    address: "", number: "", district: "", city: "", state: "", cep: "", country: "brasil", phone: "",
    username: "", password: "", promoCode: "", acceptTerms: false, acceptBonus: true,
};

// ─── Masks ──────────────────────────────────────────────
const maskCPF = (v: string) => v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2").slice(0, 14);
const maskCEP = (v: string) => v.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);
const maskPhone = (v: string) => v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 15);
const maskDate = (v: string) => v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 10);

// ─── Stepper ────────────────────────────────────────────
const steps = [
    { label: "Identificação", icon: User },
    { label: "Endereço", icon: MapPin },
    { label: "Conta", icon: Gift },
];

const Stepper: React.FC<{ current: number }> = ({ current }) => (
    <div className="flex items-center justify-center gap-1 mb-8">
        {steps.map((s, i) => {
            const done = i < current;
            const active = i === current;
            return (
                <React.Fragment key={i}>
                    <div className="flex flex-col items-center gap-1.5">
                        <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2
              ${done ? "bg-primary border-primary text-primary-foreground" : active ? "bg-primary border-primary text-primary-foreground shadow-glow" : "bg-muted border-border text-muted-foreground"}
            `}>
                            {done ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                        </div>
                        <span className={`text-[10px] font-semibold ${active ? "text-primary" : done ? "text-primary" : "text-muted-foreground"}`}>
                            {s.label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`w-12 h-0.5 mt-[-18px] rounded-full transition-all ${done ? "bg-primary" : "bg-border"}`} />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

// ─── Input component helper ───────────────────────────
const Field: React.FC<{
    icon: React.ReactNode; label: string; id: string; placeholder: string;
    value: string; onChange: (v: string) => void; type?: string; rightIcon?: React.ReactNode;
}> = ({ icon, label, id, placeholder, value, onChange, type = "text", rightIcon }) => (
    <div className="space-y-1.5">
        <Label htmlFor={id} className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">{label}</Label>
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
            <input
                id={id} type={type} placeholder={placeholder} value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
            />
            {rightIcon && <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</span>}
        </div>
    </div>
);

// ─── Page ───────────────────────────────────────────────
const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register: registerUser, login, googleLogin, user, updateUser } = useAuth();
    const [view, setView] = useState<'register' | 'login'>('register');
    const [step, setStep] = useState<-1 | 0 | 1 | 2>(-1); // -1 = social/email choice
    const [form, setForm] = useState<FormData>(INITIAL_FORM);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleAuth, setIsGoogleAuth] = useState(false);

    const [cepLoading, setCepLoading] = useState(false);

    // Login state
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const set = useCallback((field: keyof FormData, value: string | boolean) => {
        setForm(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleBlurCep = async () => {
        const rawCep = form.cep.replace(/\D/g, '');
        if (rawCep.length === 8) {
            setCepLoading(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setForm(prev => ({
                        ...prev,
                        address: data.logradouro,
                        district: data.bairro,
                        city: data.localidade,
                        state: data.uf,
                    }));
                    // Focus number field if possible
                    document.getElementById('number')?.focus();
                } else {
                    toast.error("CEP não encontrado");
                }
            } catch (error) {
                toast.error("Erro ao buscar CEP");
            } finally {
                setCepLoading(false);
            }
        }
    };

    // Validation per step
    const validateStep = (s: number): boolean => {
        if (s === 0) {
            if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error("Email inválido"); return false; }
            if (form.email !== form.confirmEmail) { toast.error("Emails não coincidem"); return false; }
            if (!form.birthDate || form.birthDate.length < 10) { toast.error("Data de nascimento inválida"); return false; }
            if (!form.cpf || form.cpf.replace(/\D/g, "").length < 11) { toast.error("CPF inválido"); return false; }
            // Check 18+
            const parts = form.birthDate.split("/");
            if (parts.length === 3) {
                const birth = new Date(+parts[2], +parts[1] - 1, +parts[0]);
                const age = (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
                if (age < 18) { toast.error("Você precisa ter 18+ anos"); return false; }
            }
            return true;
        }
        if (s === 1) {
            if (!form.cep || form.cep.replace(/\D/g, "").length < 8) { toast.error("CEP inválido"); return false; }
            if (!form.address) { toast.error("Informe seu endereço"); return false; }
            if (!form.number) { toast.error("Informe o número"); return false; }
            if (!form.district) { toast.error("Informe o bairro"); return false; }
            if (!form.city) { toast.error("Informe sua cidade"); return false; }
            if (!form.state) { toast.error("Informe o estado"); return false; }
            if (!form.phone || form.phone.replace(/\D/g, "").length < 10) { toast.error("Celular inválido"); return false; }
            return true;
        }
        if (s === 2) {
            if (!form.username || form.username.length < 3) { toast.error("Nome de usuário muito curto"); return false; }
            // Skip password validation if Google Auth
            if (!isGoogleAuth) {
                if (!form.password || form.password.length < 6) { toast.error("Senha deve ter 6+ caracteres"); return false; }
            }
            if (!form.acceptTerms) { toast.error("Aceite os termos para continuar"); return false; }
            return true;
        }
        return true;
    };

    const next = () => {
        if (step >= 0 && !validateStep(step)) return;
        setStep(prev => Math.min(prev + 1, 2) as any);
    };
    const prev = () => setStep(prev => Math.max(prev - 1, -1) as any);

    const handleSubmit = async () => {
        if (!validateStep(2)) return;
        setIsSubmitting(true);
        try {
            if (isGoogleAuth) {
                // Google Auth: user already created, just save profile data
                if (user?.id) {
                    await api.updateProfile(user.id, {
                        cpf: form.cpf,
                        birthDate: form.birthDate,
                        gender: form.gender,
                        address: form.address,
                        number: form.number,
                        district: form.district,
                        city: form.city,
                        state: form.state,
                        cep: form.cep,
                        country: form.country,
                        phone: form.phone,
                        username: form.username,
                    });
                    // Update localStorage with profile_complete
                    const sessionData = JSON.parse(localStorage.getItem("luckynft_session") || "{}");
                    sessionData.profile_complete = true;
                    localStorage.setItem("luckynft_session", JSON.stringify(sessionData));
                    localStorage.setItem("user", JSON.stringify(sessionData));
                }
                toast.success("Perfil completo e conta criada! 🎉");
                navigate("/");
            } else {
                const result = await registerUser(form.email, form.password);
                if (result.success) {
                    // After registration, save profile data
                    const sessionData = JSON.parse(localStorage.getItem("luckynft_session") || "{}");
                    if (sessionData.id) {
                        try {
                            await api.updateProfile(sessionData.id, {
                                cpf: form.cpf,
                                birthDate: form.birthDate,
                                gender: form.gender,
                                address: form.address,
                                number: form.number,
                                district: form.district,
                                city: form.city,
                                state: form.state,
                                cep: form.cep,
                                country: form.country,
                                phone: form.phone,
                                username: form.username,
                            });

                            // Update local context properly using the new helper
                            // This ensures the user object has all the new fields immediately
                            if (updateUser) {
                                updateUser({
                                    profile_complete: true,
                                    cpf: form.cpf,
                                    // user interface doesn't have birthDate/gender usually but we can add what matches
                                    address: form.address,
                                    number: form.number,
                                    district: form.district,
                                    city: form.city,
                                    state: form.state,
                                    cep: form.cep,
                                    // phone: form.phone // User interface might not have phone? check AuthContext User type
                                });
                            } else {
                                // Fallback if updateUser not available (should be there)
                                sessionData.profile_complete = true;
                                sessionData.address = form.address;
                                sessionData.number = form.number;
                                sessionData.district = form.district;
                                sessionData.city = form.city;
                                sessionData.state = form.state;
                                sessionData.cep = form.cep;
                                localStorage.setItem("luckynft_session", JSON.stringify(sessionData));
                                localStorage.setItem("user", JSON.stringify(sessionData));
                            }
                        } catch (profileErr) {
                            console.warn("Profile save failed, continuing:", profileErr);
                        }
                    }
                    toast.success("Conta criada com sucesso! 🎉");
                    navigate("/");
                } else {
                    toast.error(result.error || "Erro ao criar conta");
                }
            }
        } catch {
            toast.error("Erro inesperado");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginEmail || !loginPassword) { toast.error("Preencha email e senha"); return; }
        setIsSubmitting(true);
        try {
            const result = await login(loginEmail, loginPassword);
            if (result.success) {
                toast.success("Login realizado com sucesso!");
                navigate("/");
            } else {
                toast.error(result.error || "Email ou senha incorretos");
            }
        } catch {
            toast.error("Erro ao fazer login");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSuccess = async (cred: any) => {
        try {
            const r = await googleLogin(cred.credential!);
            if (r.success) {
                toast.success("Login com Google realizado!");
                if (view === 'login') {
                    navigate("/");
                } else {
                    // Register flow: check if profile is already complete
                    const userData = JSON.parse(localStorage.getItem("luckynft_session") || "{}");
                    if (userData.profile_complete) {
                        toast.success("Perfil já completo! Redirecionando...");
                        navigate("/");
                    } else {
                        setIsGoogleAuth(true);
                        setStep(0);
                    }
                }
            }
        } catch { toast.error("Falha no login com Google"); }
    };

    // Sync email from context if Google Auth is active and form email is empty
    React.useEffect(() => {
        if (isGoogleAuth && user?.email && !form.email) {
            setForm(f => ({ ...f, email: user.email, confirmEmail: user.email }));
        }
    }, [isGoogleAuth, user]);

    // ─── Step Content ─────────────────────────────────────
    const renderStep = () => {
        const variants = {
            enter: { opacity: 0, x: 40 },
            center: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -40 },
        };

        if (view === 'login') {
            return (
                <motion.div key="login" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-extrabold text-foreground">Bem-vindo de volta! 👋</h2>
                        <p className="text-muted-foreground text-sm">Entre na sua conta para continuar</p>
                    </div>

                    {/* Social buttons */}
                    <div className="space-y-3">
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error("Erro no Google")}
                                width={340}
                                theme="filled_black"
                                shape="pill"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-3 text-muted-foreground font-semibold">ou entre com e-mail</span>
                        </div>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <Field
                            icon={<Mail className="w-4 h-4" />}
                            label="Email"
                            id="loginEmail"
                            placeholder="seu@email.com"
                            value={loginEmail}
                            onChange={setLoginEmail}
                            type="email"
                        />
                        <Field
                            icon={<Lock className="w-4 h-4" />}
                            label="Senha"
                            id="loginPassword"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={setLoginPassword}
                            type={showPassword ? "text" : "password"}
                            rightIcon={
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            }
                        />
                        <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "ENTRAR AGORA"}
                        </Button>
                    </form>

                    <p className="text-center text-xs text-muted-foreground">
                        Não tem conta?{" "}
                        <button onClick={() => setView('register')} className="text-primary font-bold hover:underline">Cadastre-se grátis</button>
                    </p>
                </motion.div>
            );
        }

        if (step === -1) {
            return (
                <motion.div key="social" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-extrabold text-foreground">Cadastre-se agora!</h2>
                        <p className="text-muted-foreground text-sm">Escolha como deseja se cadastrar</p>
                    </div>

                    {/* Social buttons */}
                    <div className="space-y-3">
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error("Erro no Google")}
                                width={340}
                                text="signup_with"
                                theme="filled_black"
                                shape="pill"
                            />
                        </div>

                        <div className="flex justify-center">
                            <button className="w-[340px] h-[40px] rounded-full border border-input bg-card hover:bg-accent/10 text-foreground text-sm font-medium flex items-center justify-center gap-3 transition-colors">
                                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                Cadastrar com Facebook
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-3 text-muted-foreground font-semibold">ou cadastre com e-mail</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setStep(0)}
                        className="w-full h-12 rounded-xl border border-primary/50 text-primary font-bold flex items-center justify-center gap-3 hover:bg-primary/10 transition-all"
                    >
                        <Mail className="w-5 h-5" />
                        Cadastrar com E-mail
                    </button>

                    <p className="text-center text-xs text-muted-foreground">
                        Já tem conta?{" "}
                        <button onClick={() => setView('login')} className="text-primary font-bold hover:underline">Faça login</button>
                    </p>
                </motion.div>
            );
        }

        if (step === 0) {
            return (
                <motion.div key="step0" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-xl font-extrabold text-foreground">Vamos começar! 🎯</h2>
                        <p className="text-muted-foreground text-xs">Insira seus dados para garantir sua segurança.</p>
                    </div>
                    {/* If Google Auth, maybe restrict editing email? Or let them confirm? 
                        The requirement implies using gmail data, so pre-fill is good.
                        Maybe disable readOnly to allow correction if needed, but Google email is usually fixed for the account.
                    */}
                    <div className={isGoogleAuth ? "opacity-70 pointer-events-none" : ""}>
                        <Field icon={<Mail className="w-4 h-4" />} label="E-mail" id="email" placeholder="seu@email.com" value={form.email} onChange={v => set("email", v)} type="email" />
                    </div>
                    {/* Hide Confirm Email if Google Auth, redundant */}
                    {!isGoogleAuth && (
                        <Field icon={<Mail className="w-4 h-4" />} label="Confirmar E-mail" id="confirmEmail" placeholder="seu@email.com" value={form.confirmEmail} onChange={v => set("confirmEmail", v)} type="email" />
                    )}

                    <Field icon={<Calendar className="w-4 h-4" />} label="Data de Nascimento" id="birthDate" placeholder="DD/MM/AAAA" value={form.birthDate} onChange={v => set("birthDate", maskDate(v))} />
                    <Field icon={<CreditCard className="w-4 h-4" />} label="CPF" id="cpf" placeholder="000.000.000-00" value={form.cpf} onChange={v => set("cpf", maskCPF(v))} />
                    <div className="space-y-1.5">
                        <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Gênero</Label>
                        <Select value={form.gender} onValueChange={v => set("gender", v)}>
                            <SelectTrigger className="h-12 rounded-xl border border-input bg-background/50 text-foreground focus:ring-1 focus:ring-primary focus:border-primary">
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground">
                                <SelectItem value="masculino">Masculino</SelectItem>
                                <SelectItem value="feminino">Feminino</SelectItem>
                                <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>
            );
        }

        if (step === 1) {
            return (
                <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-xl font-extrabold text-foreground">Quase lá! 📍</h2>
                        <p className="text-muted-foreground text-xs">Onde a sorte te encontra?</p>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="cep" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">CEP</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {cepLoading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <MapPin className="w-4 h-4" />}
                            </span>
                            <input
                                id="cep" type="text" placeholder="00000-000" value={form.cep}
                                onChange={e => {
                                    const v = maskCEP(e.target.value);
                                    set("cep", v);
                                }}
                                onBlur={handleBlurCep}
                                className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-[1fr,100px] gap-4">
                        <Field icon={<MapPin className="w-4 h-4" />} label="Endereço (Rua)" id="address" placeholder="Rua da Sorte" value={form.address} onChange={v => set("address", v)} />
                        <Field icon={<MapPin className="w-4 h-4" />} label="Número" id="number" placeholder="123" value={form.number} onChange={v => set("number", v)} />
                    </div>

                    <Field icon={<MapPin className="w-4 h-4" />} label="Bairro" id="district" placeholder="Centro" value={form.district} onChange={v => set("district", v)} />

                    <div className="grid grid-cols-[1fr,80px] gap-4">
                        <Field icon={<MapPin className="w-4 h-4" />} label="Cidade" id="city" placeholder="Sua cidade" value={form.city} onChange={v => set("city", v)} />
                        <Field icon={<MapPin className="w-4 h-4" />} label="Estado" id="state" placeholder="UF" value={form.state} onChange={v => set("state", v)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">País</Label>
                        <Select value={form.country} onValueChange={v => set("country", v)}>
                            <SelectTrigger className="h-12 rounded-xl border border-input bg-background/50 text-foreground focus:ring-1 focus:ring-primary focus:border-primary">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground">
                                <SelectItem value="brasil">🇧🇷 Brasil</SelectItem>
                                <SelectItem value="portugal">🇵🇹 Portugal</SelectItem>
                                <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Field icon={<Smartphone className="w-4 h-4" />} label="Celular" id="phone" placeholder="(00) 90000-0000" value={form.phone} onChange={v => set("phone", maskPhone(v))} type="tel" />
                </motion.div>
            );
        }

        return (
            <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-extrabold text-foreground">Defina seu acesso 🏆</h2>
                    <p className="text-muted-foreground text-xs">Crie seu login e comece a ganhar!</p>
                </div>
                <Field icon={<User className="w-4 h-4" />} label="Nome de Usuário" id="username" placeholder="ReiDoBicho2024" value={form.username} onChange={v => set("username", v)} />

                {/* Hide password for Google Auth */}
                {!isGoogleAuth && (
                    <Field
                        icon={<Lock className="w-4 h-4" />} label="Senha" id="password" placeholder="••••••••"
                        value={form.password} onChange={v => set("password", v)}
                        type={showPassword ? "text" : "password"}
                        rightIcon={
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        }
                    />
                )}

                <Field icon={<Gift className="w-4 h-4" />} label="Código Promocional (opcional)" id="promo" placeholder="BONUS2024" value={form.promoCode} onChange={v => set("promoCode", v)} />

                <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                            checked={form.acceptTerms}
                            onCheckedChange={v => set("acceptTerms", !!v)}
                            className="mt-0.5 border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span className="text-xs text-muted-foreground leading-relaxed">
                            Li e aceito os <a href="#" className="text-primary font-semibold hover:underline">Termos e Condições</a> e a{" "}
                            <a href="#" className="text-primary font-semibold hover:underline">Política de Privacidade</a>.
                        </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                            checked={form.acceptBonus}
                            onCheckedChange={v => set("acceptBonus", !!v)}
                            className="mt-0.5 border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span className="text-xs text-muted-foreground leading-relaxed">
                            Quero receber bônus, promoções e novidades por e-mail. 🎁
                        </span>
                    </label>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
            <div className="w-full max-w-md">
                {/* Stepper (only for wizard steps and IF in register view) */}
                {view === 'register' && step >= 0 && <Stepper current={step} />}

                {/* Form area */}
                <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6 sm:p-8">
                    <AnimatePresence mode="wait">
                        {renderStep()}
                    </AnimatePresence>

                    {/* Navigation buttons (Wizard only) */}
                    {view === 'register' && (
                        <div className="mt-6 space-y-3">
                            {step === -1 ? null : step < 2 ? (
                                <>
                                    <button
                                        onClick={next}
                                        className="w-full h-13 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-glow py-3.5"
                                    >
                                        Próxima <ChevronRight className="w-5 h-5" />
                                    </button>
                                    {step > 0 && (
                                        <button onClick={prev} className="w-full text-center text-sm text-muted-foreground hover:text-foreground font-medium py-2">
                                            <ChevronLeft className="w-4 h-4 inline mr-1" /> Voltar
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="w-full h-13 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-glow disabled:opacity-50 py-3.5"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>CRIAR CONTA E APOSTAR 🎲</>}
                                    </button>
                                    <button onClick={prev} className="w-full text-center text-sm text-muted-foreground hover:text-foreground font-medium py-2">
                                        <ChevronLeft className="w-4 h-4 inline mr-1" /> Voltar
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {view === 'register' && step === -1 && (
                    <div className="text-center mt-6">
                        <p className="text-sm text-muted-foreground">
                            Já tem conta? <button onClick={() => setView('login')} className="text-primary hover:underline font-bold">Faça login</button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
