FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["AssignmentMS.API/AssignmentMS.API.csproj", "AssignmentMS.API/"]
COPY ["AssignmentMS.Core/AssignmentMS.Core.csproj", "AssignmentMS.Core/"]
COPY ["AssignmentMS.Infrastructure/AssignmentMS.Infrastructure.csproj", "AssignmentMS.Infrastructure/"]

RUN dotnet restore "AssignmentMS.API/AssignmentMS.API.csproj"
COPY . .
WORKDIR "/src/AssignmentMS.API"
RUN dotnet build "AssignmentMS.API.csproj" -c Release -o /app/build
RUN dotnet publish "AssignmentMS.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "AssignmentMS.API.dll"]
