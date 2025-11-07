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
                // Comando para ejecutar pruebas de .NET, incluyendo las de Blazor (usando xUnit, bUnit, NUnit, etc.)
                sh 'dotnet test' 
                
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

