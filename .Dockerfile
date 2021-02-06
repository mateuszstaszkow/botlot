FROM node:12.8.1 AS compile-image

COPY . ./
RUN npm install
RUN ./node_modules/.bin/ng build

FROM nginx
COPY --from=compile-image ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=compile-image ./dist/botlot /usr/share/nginx/html
