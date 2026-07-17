FROM gradle:8-jdk21 AS build
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
RUN gradle installDist --no-daemon

FROM eclipse-temurin:21-jre-jammy
EXPOSE 8080
RUN mkdir /app
COPY --from=build /home/gradle/src/build/install/core /app/
COPY --from=build /home/gradle/src/firebase-key.json /app/firebase-key.json
WORKDIR /app
ENTRYPOINT ["/app/bin/core"]
