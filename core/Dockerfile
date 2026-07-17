FROM gradle:8-jdk21 AS build
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
# Build the fat jar. Using 'build' which triggers 'shadowJar' for Ktor.
RUN gradle buildFatJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
EXPOSE 8080
RUN mkdir /app
# Copy the fat jar from the build stage
COPY --from=build /home/gradle/src/build/libs/core-all.jar /app/ktor-app.jar
# Copy the Firebase config file
COPY --from=build /home/gradle/src/firebase-key.json /app/firebase-key.json
WORKDIR /app
ENTRYPOINT ["java","-jar","/app/ktor-app.jar"]
