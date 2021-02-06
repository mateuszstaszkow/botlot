FROM node:12.8.1 AS compile-image

COPY . ./
RUN npm install && npm install -g @angular/cli
RUN npm run build

FROM nginx
COPY --from=compile-image ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=compile-image ./dist/botlot /usr/share/nginx/html
