# Build stage
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Copy the logo for PDF generation if needed (assuming it's in a known place)
COPY --from=build /app/frontend/public/logo.png /app/frontend/public/logo.png
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
