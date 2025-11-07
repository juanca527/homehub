pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Código obtenido del repositorio.'
            }
        }

        stage('Build & Test') {
            steps {
                // 1. Ejecutar las pruebas del proyecto de Blazor
                sh 'dotnet test MiApp.Client.Tests/MiApp.Client.Tests.csproj'
                
                // 2. Ejecutar las pruebas del proyecto .NET Core/Standard adicional (por ejemplo, la capa de servicios)
                sh 'dotnet test MiApp.Core.Tests/MiApp.Core.Tests.csproj' // **DEBES REEMPLAZAR LA RUTA**
                
                echo 'Pruebas de test ejecutadas con éxito.'
            }
        }
        
        stage('Deploy') {
            steps {
                echo 'Despliegue iniciado.'
            }
        }
    }
}
