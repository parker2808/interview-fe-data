FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY books.mjs ./
EXPOSE 4319
CMD ["node", "books.mjs"]
