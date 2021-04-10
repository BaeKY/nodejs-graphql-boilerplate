FROM node:14
RUN yarn global add pm2
RUN mkdir -p /home/app
COPY ./dist /home/app/
WORKDIR /home/app
RUN yarn install --production
CMD ["pm2", "start", "yarn", "--name", "my-app", "--", "start"]