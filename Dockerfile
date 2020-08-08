# DO ME FROM SCRATCH


# alpine build for smaller image size https://hub.docker.com/_/node/
FROM node:12.18.2-alpine3.12 AS server-builder

WORKDIR /home/node/server

# we want the latest npm version for speed + fixes
RUN npm i npm@latest -g

# RUN chown -R node:node /home/node/app

# the official node image provides an unprivileged user as a security best practice
# but we have to manually enable it. We put it here so npm installs dependencies as the same
# user who runs the app.

COPY package*.json* ./
RUN npm ci --no-optional
# ENV PATH /home/node/app/node_modules/.bin:$PATH

COPY .eslintignore \
  .eslintrc \
  .prettierrc \
  healthCheck.js \
  package.json \
  package-lock.json \
  tsconfig.json ./
COPY ./typings ./typings
COPY ./src ./src
COPY ./config ./config

RUN npm run lint \
  && npm run build

# trivy scans our image for vulnerabilities
# by default it exits with 0 even if vulnerabilities are found
# optional add "--exit-code 1"
RUN apk add curl \
  && curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/master/contrib/install.sh | sh -s -- -b /usr/local/bin \
  && trivy filesystem --no-progress /

FROM node:12.18.2-alpine3.12 AS server

WORKDIR /home/node/server
STOPSIGNAL SIGTERM
EXPOSE 3000

RUN chown -R node:node /home/node/server

USER node

ENV CLIENT_BASE_URL=https://app.wirvonhier.net \
  NODE_ENV=production \
  APP_DOMAIN=wirvonhier.net \
  MONGO_INITDB_ROOT_USERNAME=dbrootnamehere \
  MONGO_INITDB_ROOT_PASSWORD=dbrootpasshere \
  MONGO_INITDB_DATABASE=wirvonhier \
  PORT=3000 \
  MONGO_USER=dbusernamehere \
  MONGO_PASSWORD=dbuserpasshere \
  MONGO_PATH=mongo:27017/wirvonhier \
  MONGO_AUTH_SOURCE=wirvonhier \
  SENDGRID_API_KEY=apikeyhere \
  CLOUDINARY_CLOUD_NAME=wirvonhier \
  CLOUDINARY_API_KEY=apikeyhere \
  CLOUDINARY_API_SECRET=apisecrethere \
  VIMEO_ACCESS_TOKEN=vimeotokenhere

COPY --chown=node:node package.json package-lock.json tsconfig.json ./
RUN npm ci --quiet --only=production && npm cache clean --force --loglevel=error

## We just need the build to execute the command
COPY --chown=node:node --from=server-builder /home/node/server/dist ./

ENTRYPOINT [ "/bin/bash", "docker-entrypoint.sh" ]
CMD [ "node", "-r", "tsconfig-paths/register", "./src/index.js" ]
