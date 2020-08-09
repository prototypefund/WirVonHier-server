# DO ME FROM SCRATCH


# alpine build for smaller image size https://hub.docker.com/_/node/
FROM node:12.18.2 AS server-builder

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
RUN apt-get install curl \
  && curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/master/contrib/install.sh | sh -s -- -b /usr/local/bin \
  && trivy filesystem --no-progress /

FROM node:12.18.3 AS server

WORKDIR /home/node/server
STOPSIGNAL SIGTERM
EXPOSE 3000

RUN chown -R node:node /home/node/server

USER node

COPY --chown=node:node package.json package-lock.json tsconfig.json ./
RUN npm ci --quiet --only=production && npm cache clean --force --loglevel=error

## We just need the build to execute the command
COPY --chown=node:node --from=server-builder /home/node/server/dist ./
COPY docker-entrypoint.sh /

ENTRYPOINT [ "/bin/bash", "/docker-entrypoint.sh" ]
CMD [ "node", "-r", "tsconfig-paths/register", "./src/index.js" ]
