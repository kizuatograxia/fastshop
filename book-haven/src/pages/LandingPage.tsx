import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldCheck, Lock, BookOpen, PlayCircle, Layers } from 'lucide-react';
import { motion } from "framer-motion";

const LandingPage = () => {
    const navigate = useNavigate();

    // Redireciona para o dashboard se o usuário já estiver logado
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleAccessClick = () => {
        navigate('/login');
    };

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
            {/* Header / Nav */}
            <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-900 p-1.5 rounded-lg">
                            <Layers className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">MundoPix Academy</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <a href="#cursos" className="text-sm font-medium text-slate-600 hover:text-blue-900">Cursos</a>
                        <a href="#masterclass" className="text-sm font-medium text-slate-600 hover:text-blue-900">Masterclasses</a>
                        <a href="#depoimentos" className="text-sm font-medium text-slate-600 hover:text-blue-900">Depoimentos</a>
                    </nav>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={() => navigate('/login')}>Entrar</Button>
                        <Button className="bg-blue-900 hover:bg-blue-800" onClick={() => navigate('/register')}>Começar Agora</Button>
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-20 lg:py-32 overflow-hidden bg-slate-900 text-white">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-900"></div>

                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                            <Badge className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 mb-6 border-blue-500/50 px-4 py-1.5">
                                A Nova Era da Educação Financeira
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                                Domine a Nova <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Economia Digital</span>.
                            </h1>
                            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                                Acesse estratégias exclusivas, guias de investimento e masterclasses sobre Web3,
                                Criptoeconomia e Ativos Digitais. Formação completa para o futuro do dinheiro.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-14 text-lg w-full sm:w-auto" onClick={handleAccessClick}>
                                    Acessar Área de Membros
                                </Button>
                                <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800 h-14 w-full sm:w-auto backdrop-blur-sm">
                                    Conhecer Planos
                                </Button>
                            </div>
                            <div className="mt-12 flex items-center justify-center gap-8 text-slate-400 text-sm">
                                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> +5.000 Alunos</span>
                                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Certificado Incluso</span>
                                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Acesso Vitalício</span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Vitrine de Produtos (Fachada) */}
                <section id="cursos" className="py-20 bg-slate-50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Nossos Materiais Exclusivos</h2>
                            <p className="text-slate-600 max-w-xl mx-auto">
                                Conteúdo curado por especialistas para acelerar sua jornada na economia digital.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Produto A */}
                            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                                <div className="h-48 bg-slate-200 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-blue-900/0 transition-colors"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <BookOpen className="h-16 w-16 text-slate-400" />
                                    </div>
                                </div>
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Ebook</Badge>
                                    </div>
                                    <CardTitle>Guia da Economia Digital</CardTitle>
                                    <CardDescription>
                                        Os fundamentos essenciais para começar a investir com segurança.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-slate-600 mb-4">
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-blue-500" /> Introdução à Blockchain</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-blue-500" /> Carteiras Digitais</li>
                                    </ul>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center border-t pt-4">
                                    <span className="text-lg font-bold text-blue-900">R$ 29,90</span>
                                    <Button size="sm" onClick={handleAccessClick}>Comprar Agora</Button>
                                </CardFooter>
                            </Card>

                            {/* Produto B */}
                            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group relative">
                                <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">POPULAR</div>
                                <div className="h-48 bg-slate-800 relative overflow-hidden flex items-center justify-center">
                                    <PlayCircle className="h-16 w-16 text-white/50 group-hover:text-white/80 transition-colors" />
                                </div>
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">Video Aula</Badge>
                                    </div>
                                    <CardTitle>Masterclass Web3 Essentials</CardTitle>
                                    <CardDescription>
                                        Mergulhe fundo na tecnologia que está mudando a internet.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-slate-600 mb-4">
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-blue-500" /> DeFi e Smart Contracts</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-blue-500" /> Análise de Projetos</li>
                                    </ul>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center border-t pt-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400 line-through">R$ 197,00</span>
                                        <span className="text-lg font-bold text-blue-900">R$ 97,00</span>
                                    </div>
                                    <Button size="sm" onClick={handleAccessClick}>Assistir Agora</Button>
                                </CardFooter>
                            </Card>

                            {/* Produto C */}
                            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                                <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                                    <Layers className="h-16 w-16 text-slate-400" />
                                </div>
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">Pack</Badge>
                                    </div>
                                    <CardTitle>Pack de Assets Premium</CardTitle>
                                    <CardDescription>
                                        Ferramentas e planilhas para gestão do seu portfólio.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-slate-600 mb-4">
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-blue-500" /> Planilha de ROI</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-blue-500" /> Checklist de Segurança</li>
                                    </ul>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center border-t pt-4">
                                    <span className="text-lg font-bold text-blue-900">R$ 49,90</span>
                                    <Button size="sm" onClick={handleAccessClick}>Baixar</Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Social Proof */}
                <section id="depoimentos" className="py-20 bg-white border-y border-slate-100">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">O que dizem nossos alunos</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { name: "Carlos M.", text: "O curso mudou minha visão sobre finanças. O conteúdo sobre Web3 é inigualável." },
                                { name: "Fernanda S.", text: "Didática excelente e material de apoio muito rico. Recomendo para todos que querem entender a nova economia." },
                                { name: "Roberto J.", text: "Finalmente entendi como fazer gestão de risco em ativos digitais. Valeu cada centavo." }
                            ].map((testimonial, i) => (
                                <div key={i} className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                    <div className="flex text-yellow-500 mb-4">★★★★★</div>
                                    <p className="text-slate-600 mb-6 italic">"{testimonial.text}"</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center font-bold text-slate-500">
                                            {testimonial.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{testimonial.name}</p>
                                            <p className="text-xs text-slate-500">Aluno Verificado</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Secure Payment Section (Trust Signals) */}
                <section className="py-12 bg-slate-50">
                    <div className="container mx-auto px-4 text-center">
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Pagamento Seguro & Garantia</p>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                            {/* Placeholder Logos - Text for now */}
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-8 w-8 text-slate-600" />
                                <span className="font-bold text-slate-700">Mercado Pago</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Lock className="h-8 w-8 text-slate-600" />
                                <span className="font-bold text-slate-700">Ambiente Seguro SSL</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-8 w-8 text-slate-600" />
                                <span className="font-bold text-slate-700">Garantia de 7 Dias</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer de Compliance */}
            <footer className="bg-slate-900 text-slate-400 py-12 text-sm">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                <Layers className="h-5 w-5" /> MundoPix Academy
                            </h3>
                            <p className="mb-4 max-w-sm">
                                Plataforma líder em educação para a nova economia digital. Nossa missão é democratizar o acesso ao conhecimento financeiro.
                            </p>
                            <p>
                                CNPJ: 12.345.678/0001-90<br />
                                Av. Paulista, 1000 - São Paulo, SP
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Legal</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Direito de Arrependimento</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Contato</h4>
                            <ul className="space-y-2">
                                <li>suporte@mundopix.com</li>
                                <li>(11) 99999-9999</li>
                                <li>Seg - Sex, 9h às 18h</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p>© 2024 MundoPix Academy. Todos os direitos reservados.</p>
                        <div className="flex gap-4 text-xs text-slate-500">
                            <p>Este site não tem afiliação com o Facebook ou Google.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
