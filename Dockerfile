FROM denoland/deno:2.7.14

EXPOSE 3000

WORKDIR /app

COPY package.json .
RUN deno install

COPY src .

RUN deno cache server.ts

CMD ["run", "--allow-net", "--allow-env", "server.ts"]
