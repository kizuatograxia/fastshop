import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Clock, Users, Ticket, Trophy, Target, Info, CheckCircle2,
  Minus, Plus, Loader2, Share2, ShoppingCart, Activity, Hash, ChevronRight,
  Eye, X, Star, Truck, ShieldCheck, ChevronUp, ChevronDown, ZoomIn, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { useUserRaffles } from "@/contexts/UserRafflesContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { OwnedNFT, NFT } from "@/types/raffle";
import { Progress } from "@/components/ui/progress";
import { MempoolLayoutSideBySide } from "@/components/MempoolLayout";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ── Activity Feed ──
const ActivityFeed: React.FC<{ raffleId: string; autoRefresh?: boolean }> = ({ raffleId, autoRefresh = false }) => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);

  const fetchParticipants = () => {
    api.getRaffleParticipants(raffleId)
      .then((data) => setParticipants(Array.isArray(data) ? data.slice(0, 15) : []))
      .catch(() => setParticipants([]))
      .finally(() => setLoadingParticipants(false));
  };

  useEffect(() => {
    fetchParticipants();
    if (autoRefresh) {
      const interval = setInterval(fetchParticipants, 8000);
      return () => clearInterval(interval);
    }
  }, [raffleId, autoRefresh]);

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return "agora";
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  };

  if (loadingParticipants) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3 items-center animate-pulse">
            <div className="w-8 h-8 rounded-full bg-muted" />
            <div className="h-3 bg-muted rounded flex-1" />
            <div className="h-3 bg-muted rounded w-8" />
          </div>
        ))}
      </div>
    );
  }

  if (participants.length === 0) {
    return <div className="p-6 text-center text-muted-foreground text-sm">Nenhuma atividade ainda</div>;
  }

  return (
    <div className="divide-y divide-border">
      {participants.map((p, i) => {
        const name = p.user_name || p.name || p.username || `Participante ${i + 1}`;
        const tickets = p.ticket_count || p.tickets || 1;
        const joinedAt = p.joined_at || p.created_at || p.date;
        return (
          <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-600/10 dark:bg-blue-400/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs flex-shrink-0">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-foreground truncate block">{name}</span>
              <span className="text-xs text-muted-foreground">{tickets} bilhete{tickets !== 1 ? 's' : ''}</span>
            </div>
            {joinedAt && (
              <span className="text-xs text-muted-foreground flex-shrink-0">{formatTime(joinedAt)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Star Rating (mock) ──
const StarRating: React.FC<{ rating: number; count: number }> = ({ rating, count }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} className={`w-[14px] h-[14px] ${s <= Math.floor(rating) ? "text-blue-600 dark:text-blue-400 fill-current" : "text-muted-foreground/30"}`} />
    ))}
    <span className="text-sm text-muted-foreground ml-1">({count})</span>
  </div>
);

// ── Image Gallery with vertical scroll ──
const ImageGallery: React.FC<{
  images: string[];
  activeImage: string;
  setActiveImage: (url: string) => void;
  title: string;
}> = ({ images, activeImage, setActiveImage, title }) => {
  const thumbRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const thumbHeight = 52; // h-11 + mb-2 gap

  const checkScroll = () => {
    const el = thumbRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 2);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 2);
  };

  useEffect(() => {
    checkScroll();
    const el = thumbRef.current;
    if (el) el.addEventListener("scroll", checkScroll);
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [images]);

  const scrollBy = (dir: number) => {
    thumbRef.current?.scrollBy({ top: dir * thumbHeight * 4, behavior: "smooth" });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className="flex gap-2">
      {/* Thumbnails column */}
      {images.length > 1 && (
        <div className="flex flex-col items-center flex-shrink-0 w-[52px]">
          {canScrollUp && (
            <button onClick={() => scrollBy(-1)} className="w-full flex items-center justify-center py-1 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
          <div ref={thumbRef} className="flex flex-col gap-2 max-h-[340px] overflow-hidden scroll-smooth snap-y" style={{ scrollSnapType: "y mandatory" }}>
            {images.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(url)}
                className={`w-11 h-11 rounded-[4px] overflow-hidden border flex-shrink-0 snap-start transition-all ${activeImage === url
                  ? "ring-2 ring-blue-600 dark:ring-blue-400 border-blue-600 dark:border-blue-400"
                  : "border-border hover:border-foreground/40"}`}
              >
                <img src={url} alt={`${title} ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          {canScrollDown && (
            <button onClick={() => scrollBy(1)} className="w-full flex items-center justify-center py-1 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Main image */}
      <div
        className="relative flex-1 bg-card rounded-sm overflow-hidden cursor-crosshair aspect-square flex items-center justify-center"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={activeImage}
          alt={title}
          className="w-full h-full object-contain transition-transform duration-200"
          style={isZoomed ? { transform: "scale(2)", transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : {}}
        />
      </div>
    </div>
  );
};

// ── Main Component ──
const RaffleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ownedNFTs, removeNFT, refreshWallet } = useWallet();
  const { addUserRaffle, getUserValue, getTicketCount } = useUserRaffles();

  const [selectedNFTs, setSelectedNFTs] = useState<Record<string, number>>({});
  const [raffle, setRaffle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLiveViewActive, setIsLiveViewActive] = useState(false);
  const [activeImage, setActiveImage] = useState<string>("");
  const [quantity, setQuantity] = useState("1");

  const [pendingChangeDialog, setPendingChangeDialog] = useState<{
    open: boolean; emptySlots: number; selectedValue: number; changeValue: number; changeNFTs: NFT[];
  } | null>(null);

  // ── Fetch raffle ──
  useEffect(() => {
    if (id) {
      api.getRaffle(id)
        .then(data => {
          const mapped = {
            id: String(data.id), titulo: data.title, descricao: data.description,
            imagem: data.image_url && !data.image_url.includes('example.com')
              ? data.image_url : "https://images.unsplash.com/photo-1635326444826-06c8f8d2e61d?w=800&q=80",
            status: data.status === 'active' ? 'ativo' : 'encerrado',
            premio: data.prize_pool || `R$ ${data.prize_value}`, premioValor: data.prize_value || 0,
            dataFim: data.draw_date || "2024-12-31", custoNFT: data.ticket_price,
            participantes: parseInt(data.tickets_sold) || 0,
            maxParticipantes: parseInt(data.max_tickets) || parseInt(data.total_tickets) || 0,
            categoria: data.category || "geral", raridade: "comum", emoji: "🎫",
            image_urls: data.image_urls || [data.image_url],
            winner: data.winner_name ? { name: data.winner_name, picture: data.winner_picture } : undefined,
          };
          setRaffle(mapped);
          setActiveImage(mapped.imagem);
        })
        .catch(err => { console.error("Error fetching raffle", err); toast.error("Erro ao carregar sorteio."); })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // ── Derived state ──
  const userCurrentValue = raffle ? getUserValue(raffle.id) : 0;
  const userTicketsFromCount = raffle ? getTicketCount(raffle.id) : 0;
  const userTicketsFromValue = raffle?.custoNFT > 0 ? Math.floor(userCurrentValue / raffle.custoNFT) : 0;
  const userTickets = Math.max(userTicketsFromCount, userTicketsFromValue);
  const availableNFTs = ownedNFTs.filter(nft => nft.quantidade > 0);

  const handleQuantityChange = (nftId: string, delta: number, max: number) => {
    setSelectedNFTs(prev => {
      const current = prev[nftId] || 0;
      const next = Math.max(0, Math.min(max, current + delta));
      const newState = { ...prev, [nftId]: next };
      if (next === 0) delete newState[nftId];
      return newState;
    });
  };

  const toggleSelection = (nftId: string, max: number) => {
    setSelectedNFTs(prev => {
      const current = prev[nftId] || 0;
      if (current > 0) { const ns = { ...prev }; delete ns[nftId]; return ns; }
      return { ...prev, [nftId]: 1 };
    });
  };

  const selectionStats = useMemo(() => {
    let count = 0, value = 0;
    availableNFTs.forEach(nft => { const qty = selectedNFTs[nft.id] || 0; count += qty; value += qty * nft.preco; });
    return { count, value };
  }, [availableNFTs, selectedNFTs]);

  const calculateChance = (tickets: number) => {
    const total = raffle?.participantes || 0;
    if (total === 0 || tickets === 0) return 0;
    return Math.min((tickets / total) * 100, 100);
  };

  // ── Polling ──
  useEffect(() => {
    if (!id || raffle?.status === 'encerrado') return;
    const poll = setInterval(async () => {
      try {
        const data = await api.getRaffle(id);
        if (data?.tickets_sold) setRaffle((prev: any) => ({ ...prev, participantes: parseInt(data.tickets_sold) || prev.participantes }));
        if (data?.status === 'encerrado' && !isDrawing) { setIsLiveViewActive(true); setIsDrawing(true); }
      } catch { }
    }, isLiveViewActive ? 3_000 : 5_000);
    return () => clearInterval(poll);
  }, [id, isDrawing, isLiveViewActive, raffle?.status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Sorteio não encontrado</h1>
          <Button onClick={() => navigate("/")} variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
        </div>
      </div>
    );
  }

  const { count: selectedCount, value: selectedValue } = selectionStats;
  const ticketPrice = raffle.custoNFT;
  const ticketsToReceive = Math.floor(selectedValue / ticketPrice);
  let emptySlots = Infinity;
  if (raffle.maxParticipantes > 0) emptySlots = Math.max(0, raffle.maxParticipantes - raffle.participantes);
  else if (raffle.premioValor > 0 && ticketPrice > 0) emptySlots = Math.max(0, Math.ceil(raffle.premioValor / ticketPrice) - raffle.participantes);

  const currentChance = calculateChance(userTickets);
  const potentialChance = calculateChance(userTickets + ticketsToReceive);
  const totalSlots = raffle.maxParticipantes > 0 ? raffle.maxParticipantes : (raffle.premioValor > 0 && ticketPrice > 0 ? Math.ceil(raffle.premioValor / ticketPrice) : Math.max(10, raffle.participantes * 1.5));
  const progressPercent = totalSlots > 0 ? Math.min((raffle.participantes / totalSlots) * 100, 100) : 0;

  const dataFimFormatted = (() => {
    try { return new Date(raffle.dataFim).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }); } catch { return raffle.dataFim; }
  })();

  const executeParticipation = async (finalTicketsToReceive: number, finalSelectedValue: number, changeNFTsToIssue: NFT[] = []) => {
    setIsProcessing(true);
    try {
      await addUserRaffle(raffle, finalTicketsToReceive, finalSelectedValue, selectedNFTs);
      setRaffle((prev: any) => ({ ...prev, participantes: prev.participantes + finalTicketsToReceive }));
      if (changeNFTsToIssue.length > 0) {
        const userId = JSON.parse(localStorage.getItem("luckynft_session") || "{}")?.id;
        if (userId) {
          await Promise.all(changeNFTsToIssue.map(c => api.addToWallet(Number(userId), c)));
          toast.success("Troco de NFTs Enviado!", { description: `R$ ${changeNFTsToIssue.reduce((a, n) => a + n.preco, 0).toFixed(2)} em NFTs na sua carteira.` });
        }
      }
      await refreshWallet();
      setSelectedNFTs({});
      setPendingChangeDialog(null);
      try { const d = await api.getRaffle(raffle.id); if (d?.tickets_sold) setRaffle((p: any) => ({ ...p, participantes: parseInt(d.tickets_sold) || 0 })); } catch { }
      toast.success(`Você entrou com ${finalTicketsToReceive} bilhetes!`, { description: `Valor: R$ ${finalSelectedValue.toFixed(2)}` });
    } catch (error) {
      console.error("Erro ao participar", error);
      toast.error("Erro ao processar participação.");
    } finally { setIsProcessing(false); }
  };

  const handleParticipate = async () => {
    if (isProcessing) return;
    if (raffle.status !== 'ativo') { toast.error("Sorteio encerrado!"); return; }
    if (selectedCount === 0) { toast.error("Selecione pelo menos 1 NFT"); return; }
    if (ticketsToReceive === 0) { toast.error(`Valor insuficiente para um bilhete (R$ ${ticketPrice})`); return; }
    if (ticketsToReceive > emptySlots) {
      if (emptySlots === 0) { toast.error("Limite máximo atingido!"); return; }
      setIsProcessing(true);
      try {
        const allowedValue = emptySlots * ticketPrice;
        let changeValue = selectedValue - allowedValue;
        const catalog = await api.getNFTCatalog();
        const sortedCatalog = catalog.sort((a: any, b: any) => b.preco - a.preco);
        const changeNFTs: NFT[] = [];
        let rem = changeValue;
        for (const nft of sortedCatalog) { while (rem >= nft.preco && nft.preco > 0) { changeNFTs.push(nft); rem -= nft.preco; } }
        setPendingChangeDialog({ open: true, emptySlots, selectedValue, changeValue: selectedValue - allowedValue - rem, changeNFTs });
      } catch { toast.error("Erro ao calcular troco."); } finally { setIsProcessing(false); }
      return;
    }
    await executeParticipation(ticketsToReceive, selectedValue);
  };

  const rarityColors: Record<string, string> = {
    comum: "from-gray-400 to-gray-500", raro: "from-blue-400 to-cyan-500",
    epico: "from-purple-400 to-pink-500", lendario: "from-yellow-400 to-orange-500",
    mitico: "from-emerald-400 to-green-600", celestial: "from-cyan-400 to-blue-600",
  };

  const allImages = raffle.image_urls && raffle.image_urls.length > 0
    ? raffle.image_urls.filter((u: string) => u && !u.includes("example.com"))
    : [raffle.imagem];
  if (allImages.length === 0) allImages.push(raffle.imagem);

  return (
    <div className="min-h-screen bg-secondary/30 dark:bg-background pb-24 lg:pb-8">
      {/* ── Change Dialog ── */}
      <AlertDialog open={pendingChangeDialog?.open} onOpenChange={(open) => { if (!open) setPendingChangeDialog(null); }}>
        <AlertDialogContent className="bg-card border-border max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-foreground">Limite de Cotas Alcançado</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              Usaremos R$ {(pendingChangeDialog?.emptySlots! * ticketPrice).toFixed(2)} para as últimas {pendingChangeDialog?.emptySlots} cotas.
              <br /><br />Troco: <strong>R$ {pendingChangeDialog?.changeValue.toFixed(2)}</strong>
              <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
                {pendingChangeDialog?.changeNFTs.map((nft, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-muted p-2 rounded">
                    <div className="flex items-center gap-2">
                      {nft.image ? <img src={nft.image} alt={nft.nome} className="w-7 h-7 rounded object-cover" /> : <span>{nft.emoji}</span>}
                      <span className="font-medium">{nft.nome}</span>
                    </div>
                    <span className="font-semibold text-green-600 dark:text-green-500">R$ {nft.preco.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-sm">Mudar Seleção</AlertDialogCancel>
            <AlertDialogAction className="bg-blue-600 hover:bg-blue-700 text-white text-sm" onClick={() => {
              if (pendingChangeDialog) executeParticipation(pendingChangeDialog.emptySlots, pendingChangeDialog.emptySlots * ticketPrice, pendingChangeDialog.changeNFTs);
            }}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Live View Overlay ── */}
      <AnimatePresence>
        {isLiveViewActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden">
            <header className="flex-shrink-0 bg-card border-b border-border z-10">
              <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div className="w-2.5 h-2.5 rounded-full bg-red-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                  <span className="font-bold text-sm text-foreground">AO VIVO</span>
                </div>
                <h2 className="font-semibold text-sm text-foreground truncate flex-1 text-center mx-4">{raffle.titulo}</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsLiveViewActive(false)}><X className="h-5 w-5" /></Button>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto">
              <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <div>
                    <h3 className="font-bold text-xl text-foreground mb-4">{isDrawing ? "Sorteio em Andamento" : "Visualização em Tempo Real"}</h3>
                    <MempoolLayoutSideBySide totalSlots={totalSlots} soldTickets={raffle.participantes} userTickets={userTickets} targetDate={raffle.dataFim} onExpire={() => setIsDrawing(true)} isDrawing={isDrawing} winner={raffle.winner}
                      onDrawComplete={async () => {
                        try { const d = await api.getRaffle(raffle.id); if (d) setRaffle((p: any) => ({ ...p, participantes: parseInt(d.tickets_sold) || p.participantes, status: d.status, winner: d.winner_name ? { name: d.winner_name, picture: d.winner_picture } : d.winner })); } catch { }
                        setIsDrawing(false);
                      }} />
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: Ticket, label: "Cotas Vendidas", value: raffle.participantes, color: "text-blue-600 dark:text-blue-400" },
                        { icon: Target, label: "Sua Chance", value: `${currentChance.toFixed(1)}%`, color: "text-green-600 dark:text-green-500" },
                        { icon: Ticket, label: "Seus Tickets", value: userTickets, color: "text-foreground" },
                        { icon: Trophy, label: "Prêmio", value: `R$ ${raffle.premioValor.toLocaleString("pt-BR")}`, color: "text-foreground" },
                      ].map((s, i) => (
                        <div key={i} className="bg-card rounded-md border border-border p-4">
                          <s.icon className={`w-4 h-4 ${s.color} mb-1`} />
                          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-card rounded-md border border-border overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <div className="flex items-center gap-2">
                          <motion.div className="w-2 h-2 rounded-full bg-green-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                          <span className="font-semibold text-sm text-foreground">Atividade Recente</span>
                        </div>
                      </div>
                      <ActivityFeed raffleId={raffle.id} autoRefresh={isLiveViewActive} />
                    </div>
                    <button onClick={() => { setIsLiveViewActive(false); setTimeout(() => document.getElementById("nft-selection")?.scrollIntoView({ behavior: "smooth" }), 200); }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-[6px] font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                      <ShoppingCart className="w-4 h-4" />Comprar Mais Tickets
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Breadcrumb Header ── */}
      <div className="bg-card border-b border-border">
        <div className="max-w-[1184px] mx-auto px-4 py-2.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer" onClick={() => navigate("/")}>Início</span>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer" onClick={() => navigate("/sorteios")}>Sorteios</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{raffle.categoria}</span>
        </div>
      </div>

      {/* ── Main Product Card ── */}
      <div className="max-w-[1184px] mx-auto mt-4 px-2 lg:px-0">
        <div className="bg-card rounded-md shadow-sm border border-border">

          {/* ── Winner Banner ── */}
          {raffle.status === 'encerrado' && raffle.winner && (
            <div className="border-b border-border bg-green-600/5 dark:bg-green-500/5 px-6 py-4 flex items-center gap-4">
              <div className="relative">
                <img src={raffle.winner.picture} alt={raffle.winner.name} className="w-14 h-14 rounded-full border-2 border-green-600 dark:border-green-500 object-cover" />
                <div className="absolute -bottom-1 -right-1 bg-green-600 text-white p-1 rounded-full"><Trophy className="w-3 h-3" /></div>
              </div>
              <div>
                <p className="text-xs text-green-600 dark:text-green-500 font-semibold uppercase tracking-wider">Vencedor do Sorteio</p>
                <h2 className="text-xl font-bold text-foreground">{raffle.winner.name}</h2>
              </div>
            </div>
          )}

          {/* ── Above the Fold: Gallery + Buy Box ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left: Gallery (~65%) */}
            <div className="lg:col-span-7 p-4 lg:p-6 lg:pr-4">
              <ImageGallery images={allImages} activeImage={activeImage} setActiveImage={setActiveImage} title={raffle.titulo} />
              <div className="flex items-center gap-2 mt-3">
                <button className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm hover:underline">
                  <Share2 className="w-4 h-4" />Compartilhar
                </button>
                <span className="text-border">|</span>
                <button className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm hover:underline">
                  <Heart className="w-4 h-4" />Favoritar
                </button>
              </div>
            </div>

            {/* Right: Buy Box (~35%) */}
            <div className="lg:col-span-5 p-4 lg:p-6 lg:pl-4 lg:border-l border-border">

              {/* Condition & Sold */}
              <p className="text-[14px] text-muted-foreground">
                {raffle.status === 'ativo' ? 'Sorteio Ativo' : 'Encerrado'} | +{raffle.participantes} vendidos
              </p>

              {/* Title */}
              <h1 className="text-[22px] font-semibold text-foreground leading-tight mt-2 mb-2">
                {raffle.titulo}
              </h1>

              {/* Rating */}
              <StarRating rating={4.8} count={raffle.participantes > 0 ? raffle.participantes : 42} />

              {/* Price */}
              <div className="mt-4 mb-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Cota Mínima</p>
                <div className="flex items-center gap-2">
                  <span className="text-[36px] font-light text-foreground tracking-tight flex items-center gap-2">
                    <Ticket className="w-8 h-8 text-green-600 dark:text-green-500" />
                    {raffle.custoNFT?.toFixed?.(2) || raffle.custoNFT}
                  </span>
                </div>
              </div>

              {/* Shipping */}
              <div className="mt-5 flex items-start gap-2">
                <Truck className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-600 dark:text-green-500 font-semibold text-sm">Sorteio Digital Garantido</p>
                  <p className="text-green-600 dark:text-green-500 text-xs">Entrega imediata na carteira</p>
                </div>
              </div>

              <div className="border-t border-border my-5" />

              {/* Seller Info */}
              <div className="space-y-1 mb-5">
                <p className="text-sm text-muted-foreground">
                  Vendido por <span className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">MundoPix</span>
                </p>
                <p className="text-xs text-muted-foreground">Distribuidor Autorizado | Mais de 10 mil sorteios entregues</p>
              </div>


              {/* Tech Specs Mini */}
              <div className="bg-muted/50 rounded-md p-4 mb-5 space-y-2">
                <p className="text-sm font-semibold text-foreground mb-2">O que você precisa saber:</p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-foreground">•</span> Prêmio Total: <strong className="text-foreground">{raffle.premio}</strong></li>
                  <li className="flex items-start gap-2"><span className="text-foreground">•</span> Vencedores: <strong className="text-foreground">{raffle.winnersAmount > 1 ? `${raffle.winnersAmount} prêmios disponíveis` : '1'}</strong></li>
                  <li className="flex items-start gap-2"><span className="text-foreground">•</span> Oportunidade Atual: <strong className="text-foreground">{currentChance.toFixed(1)}%</strong></li>
                  <li className="flex items-start gap-2"><span className="text-foreground">•</span> Encerramento: <strong className="text-foreground">{dataFimFormatted}</strong></li>
                  <li className="flex items-start gap-2"><span className="text-foreground">•</span> Prêmio de luxo • Sorteio auditado</li>
                </ul>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-sm text-muted-foreground">Quantidade:</span>
                <Select value={quantity} onValueChange={setQuantity}>
                  <SelectTrigger className="w-auto min-w-[160px] h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 5, 10].map(n => (
                      <SelectItem key={n} value={String(n)}>{n} unidade{n > 1 ? "s" : ""} ({emptySlots === Infinity ? "disponível" : `${Math.min(n, emptySlots)} disponíveis`})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full py-4 rounded-[6px] font-semibold text-[16px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={raffle.status !== 'ativo'}
                  onClick={() => document.getElementById("nft-selection")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Participar agora
                </button>
                <button
                  className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 w-full py-4 rounded-[6px] font-semibold text-[16px] transition-colors flex items-center justify-center gap-2"
                  onClick={() => setIsLiveViewActive(true)}
                >
                  <Eye className="w-5 h-5" />Acompanhar ao vivo
                </button>
              </div>

              {/* Security */}
              <div className="flex items-start gap-2.5 mt-5 pt-4 border-t border-border">
                <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-snug">
                  <span className="text-green-600 dark:text-green-500 font-semibold">Compra Garantida</span>, receba o bilhete que está esperando ou devolvemos suas NFTs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ Below the Fold ═══════ */}

        {/* Characteristics Table */}
        <div className="bg-card rounded-md shadow-sm border border-border mt-4 overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Características principais</h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {[
                ["Prêmio", raffle.premio],
                ["Valor de face", `R$ ${raffle.premioValor.toLocaleString("pt-BR")}`],
                ["Preço por Bilhete", `R$ ${raffle.custoNFT}`],
                ["Cotas Vendidas", `${raffle.participantes}`],
                ["Total de Cotas", totalSlots > 0 ? `${totalSlots}` : "Ilimitado"],
                ["Categoria", raffle.categoria],
                ["Data de Encerramento", dataFimFormatted],
                ["Status", raffle.status === 'ativo' ? 'Ativo' : 'Encerrado'],
              ].map(([label, val], i) => (
                <tr key={label} className={i % 2 === 0 ? "bg-secondary/50" : "bg-card"}>
                  <td className="px-6 py-3 font-semibold text-foreground w-[40%] border-b border-border">{label}</td>
                  <td className="px-6 py-3 text-muted-foreground border-b border-border">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Progress */}
          <div className="px-6 py-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{raffle.participantes} vendidos</span>
              <span>{totalSlots > 0 ? `${totalSlots} total` : "Sem limite"}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>

        {/* Description */}
        <div className="bg-card rounded-md shadow-sm border border-border mt-4 overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Descrição do anúncio</h2>
          </div>
          <div className="px-6 py-6">
            <p className="text-[20px] text-muted-foreground font-light leading-relaxed whitespace-pre-line">
              {raffle.descricao}
            </p>
          </div>
        </div>

        {/* NFT Selection (Full) */}
        <div id="nft-selection" className="bg-card rounded-md shadow-sm border border-border mt-4 overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Escolha seus Ingressos</h2>
          </div>
          <div className="p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-2">
                  {availableNFTs.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed border-border rounded-md bg-muted/30">
                      <p className="mb-3 font-medium">Nenhum NFT disponível na carteira.</p>
                      <Button onClick={() => navigate("/")} variant="outline" size="sm">Ir para a Loja</Button>
                    </div>
                  ) : (
                    availableNFTs.map(nft => {
                      const qtySelected = selectedNFTs[nft.id] || 0;
                      const isSelected = qtySelected > 0;
                      return (
                        <div
                          key={nft.id}
                          className={`flex items-center gap-3 p-3 rounded-md border-2 transition-all cursor-pointer ${isSelected ? "border-blue-600 dark:border-blue-400 bg-blue-600/5" : "border-border hover:border-foreground/30"}`}
                          onClick={() => toggleSelection(nft.id, nft.quantidade)}
                        >
                          <div className={`w-12 h-12 rounded-md bg-gradient-to-br overflow-hidden ${rarityColors[nft.raridade] || "from-gray-500 to-gray-600"} flex items-center justify-center text-2xl shadow-sm`}>
                            {nft.image ? <img src={nft.image} alt={nft.nome} className="w-full h-full object-cover" /> : nft.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground text-sm truncate">{nft.nome}</h4>
                            <span className="text-sm font-bold text-green-600 dark:text-green-500">R$ {nft.preco.toFixed(2)}</span>
                          </div>
                          {isSelected && (
                            <div className="flex items-center gap-1 bg-muted rounded border border-border p-0.5" onClick={e => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(nft.id, -1, nft.quantidade)} disabled={qtySelected <= 0}><Minus className="h-3 w-3" /></Button>
                              <span className="text-sm font-bold w-5 text-center text-foreground">{qtySelected}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(nft.id, 1, nft.quantidade)} disabled={qtySelected >= nft.quantidade}><Plus className="h-3 w-3" /></Button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Summary sidebar */}
              <div className="lg:col-span-4">
                <div className="bg-muted/30 rounded-md border border-border p-5 sticky top-24 space-y-4">
                  <h4 className="text-base font-semibold text-foreground">Resumo da compra</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bilhetes</span>
                      <span className="font-semibold text-foreground">{ticketPrice > 0 ? Math.floor(selectedValue / ticketPrice) : 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor total</span>
                      <span className="font-semibold text-foreground">R$ {selectedValue.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between">
                      <span className="text-muted-foreground">Chance potencial</span>
                      <span className="font-bold text-green-600 dark:text-green-500 text-lg">{potentialChance.toFixed(2)}%</span>
                    </div>
                    <Progress value={potentialChance} className="h-2" />
                  </div>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3.5 rounded-[6px] font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                    disabled={isProcessing || selectedCount === 0}
                    onClick={handleParticipate}
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar entrada"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity / Perguntas */}
        <div className="bg-card rounded-md shadow-sm border border-border mt-4 mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Atividade recente</h2>
            <div className="flex items-center gap-1.5">
              <motion.div className="w-2 h-2 rounded-full bg-green-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              <span className="text-xs text-muted-foreground">Tempo real</span>
            </div>
          </div>
          <ActivityFeed raffleId={raffle.id} autoRefresh />
        </div>
      </div>
    </div>
  );
};

export default RaffleDetails;
