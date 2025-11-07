pipeline {
    agent any // Ejecuta en cualquier agente disponible.

    stages {
        stage('Checkout') {
            steps {
                echo 'Código obtenido del repositorio.'
                // git url: 'URL_DE_TU_REPOSITORIO', branch: 'main'
            }
        }

        stage('Build & Test') {
            steps {
                // --- 1. COMANDOS DE BUILD Y TEST MÁS COMUNES ---
                
                // 💻 PROYECTOS JAVASCRIPT/NODE.JS (usando npm o yarn)
                // sh 'npm install' // Primero instala dependencias
                // sh 'npm test'   // Luego ejecuta las pruebas
                
                // ☕ PROYECTOS JAVA/MAVEN
                // sh 'mvn clean test' // Limpia, compila, y ejecuta las pruebas
                
                // ☕ PROYECTOS JAVA/GRADLE
                // sh './gradlew clean test' // Ejecuta las pruebas
                
                // 🐍 PROYECTOS PYTHON (usando pytest)
                // sh 'pip install -r requirements.txt' // Instala dependencias
                // sh 'pytest' // Ejecuta las pruebas
                
                // ⚙️ OTROS COMANDOS DE TEST
                sh 'echo "Reemplaza este comando con el comando real de tus pruebas."' // DEBES REEMPLAZAR ESTO

                echo 'Pruebas de test ejecutadas con éxito.'
                
                // --- 2. PUBLICACIÓN DE RESULTADOS (Muy recomendado) ---
                
                // Si tus pruebas generan un archivo XML de resultados (formato JUnit),
                // este paso publicará los resultados en la interfaz de Jenkins.
                // ¡Asegúrate de cambiar el patrón del archivo si es diferente!
                // junit '**/target/surefire-reports/*.xml' // Ejemplo para Maven
                
            }
        }
        
        stage('Deploy') {
            steps {
                echo 'Despliegue iniciado.'
            }
        }
    }
}