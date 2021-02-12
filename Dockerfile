FROM node:12
RUN mkdir -p /home/app
COPY ./dist /home/app/
WORKDIR /home/app
RUN yarn install --production
CMD ["yarn", "start"]