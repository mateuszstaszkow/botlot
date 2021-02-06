FROM node:12.8.1 AS compile-image

RUN npm install && npm install -g @angular/cli

COPY . ./
RUN npm run build

FROM nginx
COPY --from=compile-image ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=compile-image ./dist/botlot /usr/share/nginx/html
