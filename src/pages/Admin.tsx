import { ReviewsList, Review } from "@/components/admin/ReviewsList";

// ... existing imports

type ViewMode = 'dashboard' | 'create' | 'participants' | 'raffles' | 'settings' | 'details' | 'reviews';

const Admin = () => {
    // ... existing state
    const [reviews, setReviews] = useState<Review[]>([]);

    // ... existing effects

    // ... existing handlers

    const fetchReviews = async () => {
        try {
            const data = await api.getPendingReviews(password);
            setReviews(data);
        } catch (error) {
            toast.error("Erro ao carregar depoimentos.");
        }
    };

    const handleApproveReview = async (id: string) => {
        try {
            await api.approveReview(password, id);
            toast.success("Depoimento aprovado!");
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            toast.error("Erro ao aprovar depoimento.");
        }
    };

    const handleRejectReview = async (id: string) => {
        if (!confirm("Tem certeza que deseja rejeitar este depoimento?")) return;
        try {
            await api.rejectReview(password, id);
            toast.success("Depoimento rejeitado.");
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            toast.error("Erro ao rejeitar depoimento.");
        }
    };

    // Update handlers to fetch reviews when view changes
    // (This is a simplified approach, ideally use useEffect dependent on view)
    useEffect(() => {
        if (view === 'reviews') {
            fetchReviews();
        }
    }, [view]);

    // ... inside AdminLayout
    {
        view === 'reviews' && (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Análise de Depoimentos</h2>
                <ReviewsList
                    reviews={reviews}
                    onApprove={handleApproveReview}
                    onReject={handleRejectReview}
                />
            </div>
        )
    }

    {/* LIVE ROULETTE OVERLAY */ }
    // ...

    export default Admin;
