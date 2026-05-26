import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock Data (Moved to Backend)
const OFFERS = [
  {
    id: '1',
    provider: 'Genertel',
    providerLogo: 'https://logo.clearbit.com/genertel.it',
    name: 'Assicurazione Auto Smart',
    price: 245,
    period: 'anno',
    features: ['Assistenza stradale H24', 'Tutela legale inclusa', 'Sconto scatola nera'],
    category: 'auto',
    rating: 4.5
  },
  {
    id: '2',
    provider: 'Prima',
    providerLogo: 'https://logo.clearbit.com/prima.it',
    name: 'Auto Premium',
    price: 210,
    period: 'anno',
    features: ['Sospensione polizza gratuita', 'Infortuni conducente', 'Cristalli'],
    category: 'auto',
    rating: 4.2
  },
  {
    id: '3',
    provider: 'Enel Energia',
    providerLogo: 'https://logo.clearbit.com/enel.it',
    name: 'E-Light Luce',
    price: 45,
    period: 'mese',
    features: ['Prezzo bloccato 12 mesi', 'Energia 100% green', 'Bolletta digitale'],
    category: 'energia',
    rating: 4.8
  },
  {
    id: '4',
    provider: 'Plenitude',
    providerLogo: 'https://logo.clearbit.com/eniplenitude.com',
    name: 'Trend Casa Gas',
    price: 38,
    period: 'mese',
    features: ['Sconto domiciliazione', 'App dedicata', 'Nessun costo attivazione'],
    category: 'energia',
    rating: 4.4
  },
  {
    id: '5',
    provider: 'Intesa Sanpaolo',
    providerLogo: 'https://logo.clearbit.com/intesasanpaolo.com',
    name: 'Mutuo Domus',
    price: 450,
    period: 'mese',
    features: ['Tasso fisso agevolato', 'Fino all\'80% del valore', 'Zero spese istruttoria'],
    category: 'mutui',
    rating: 4.7
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/offers", (req, res) => {
    const { category } = req.query;
    if (category) {
      const filtered = OFFERS.filter(o => o.category === category);
      return res.json(filtered);
    }
    res.json(OFFERS);
  });

  // --- Admin API ---
  let leads: any[] = [];

  app.get("/api/admin/offers", (req, res) => {
    res.json(OFFERS);
  });

  app.post("/api/admin/offers", (req, res) => {
    const newOffer = { ...req.body, id: Math.random().toString(36).substr(2, 9) };
    OFFERS.push(newOffer);
    res.status(201).json(newOffer);
  });

  app.delete("/api/admin/offers/:id", (req, res) => {
    const { id } = req.params;
    const index = OFFERS.findIndex(o => o.id === id);
    if (index > -1) {
      OFFERS.splice(index, 1);
      return res.json({ success: true });
    }
    res.status(404).json({ error: "Offerta non trovata" });
  });

  app.get("/api/admin/leads", (req, res) => {
    res.json(leads);
  });

  app.post("/api/preventivo", (req, res) => {
    const data = { ...req.body, id: Date.now(), date: new Date().toISOString() };
    leads.push(data);
    console.log("Richiesta preventivo ricevuta:", data);
    res.json({ success: true, message: "Richiesta ricevuta con successo!" });
  });

  // --- Auth API ---
  let users: any[] = [];

  app.post("/api/auth/register", (req, res) => {
    const { email, password, name } = req.body;
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: "Utente già registrato" });
    }
    const newUser = { id: Date.now(), email, password, name };
    users.push(newUser);
    res.status(201).json({ success: true, user: { email, name } });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      return res.json({ success: true, user: { email: user.email, name: user.name } });
    }
    res.status(401).json({ error: "Credenziali non valide" });
  });

  // Google OAuth Routes
  app.get("/api/auth/google/url", (req, res) => {
    const redirectUri = `${process.env.APP_URL}/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
    });
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  });

  app.get("/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "Missing code" });

    try {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: code as string,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: `${process.env.APP_URL}/auth/google/callback`,
          grant_type: 'authorization_code',
        }),
      });
      const tokens = await tokenResponse.json();

      // Get user info
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const userInfo = await userResponse.json();

      // Find or create user
      let user = users.find(u => u.email === userInfo.email);
      if (!user) {
        user = { id: Date.now(), email: userInfo.email, name: userInfo.name };
        users.push(user);
      }

      // Send success message to parent window and close popup
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: ${JSON.stringify({ email: user.email, name: user.name })} }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (err) {
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
