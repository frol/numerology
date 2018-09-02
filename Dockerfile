FROM mhart/alpine-node

WORKDIR /opt/www
COPY ./ ./
RUN npm install --only=production && \
    npm run build && \
    npm run export
