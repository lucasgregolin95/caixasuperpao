import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Super Pão API] Servidor iniciado na porta ${PORT}`);
  console.log(`Acesse localmente em: http://localhost:${PORT}`);
});
