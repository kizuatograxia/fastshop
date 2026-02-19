# #Dev :: ARCHITECT_SANDBOX - BUILD OPTIMIZADA
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

# Injeta as variáveis de ambiente no build time para o Vite
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# #Chaos :: ENTROPY_ENGINE - SERVINDO VIA NGINX OFUSCADO
FROM nginx:stable-alpine

# Remove headers padrão que entregam a versão do Nginx
RUN sed -i 's/nginx\//Tesavek\//g' /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração de Proxy Reverso para mascarar o CNAME
# Escuta na 80 (Railway faz o SSL na ponta) mas finge ser cdn.mundopix.site
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name cdn.mundopix.com;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass https://4fx59qbb.up.railway.app/api/;
        proxy_set_header Host 4fx59qbb.up.railway.app;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_hide_header X-Powered-By;
        add_header Referrer-Policy "no-referrer-when-downgrade";
    }
}
EOF

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
