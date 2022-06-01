FROM node:16
WORKDIR /usr/src/app
COPY . . 
RUN npm install 
RUN npm install -g --no-save nodemon
ENV PORT=8000
EXPOSE ${PORT}
CMD [ "npm", "start"]
