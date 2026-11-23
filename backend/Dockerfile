# ---- build ----
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw -q dependency:go-offline
COPY src src
RUN ./mvnw -q -DskipTests package && cp target/*.jar app.jar

# ---- run ----
FROM eclipse-temurin:17-jre
WORKDIR /app
RUN useradd -r -u 1001 spring
USER spring
COPY --from=build /app/app.jar app.jar
EXPOSE 8080
# Fit small instances (e.g. Render free = 512 MB): cap heap at 75% of the container's
# memory, use the low-overhead Serial GC, keep thread stacks small, and favour fast
# startup (C1 JIT only) since free instances cold-start after sleeping.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC -Xss512k -XX:TieredStopAtLevel=1"
ENTRYPOINT ["java", "-jar", "app.jar"]
