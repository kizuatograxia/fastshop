import { Router } from 'express';
import nftsCatalog from '../nfts.js';

const router = Router();

// NFT Catalog (Public) — Single registration, deduplicated
router.get('/nfts', (req, res) => {
    res.json(nftsCatalog);
});

export default router;
