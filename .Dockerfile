FROM node:13.3.0 AS compile-image

RUN npm install

COPY . ./
RUN ng build --prod

FROM nginx
COPY --from=compile-image ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=compile-image ./dist/botlot /usr/share/nginx/html
