pipeline {
    agent any

    environment {
        NEXUS_TOKEN = 'a11c4160-7643-3de8-a6a0-e994f4f17cf5'
    }

    stages {
        stage('Checkout Frontend') {
            steps {
                dir('HR_Management') {
                    git url: 'https://github.com/aymeennefzi/HR_Management.git', branch: 'master'
                }
            }
        }

        stage("Checkout Backend") {
            steps {
                dir('HR_Managment_application_Backend-') {
                    echo 'Pulling backend repository...'
                    git branch: 'master', url: 'https://github.com/aymeennefzi/HR_Managment_application_Backend-.git'
                }
            }
            post {
                success {
                    echo "Cloning of backend successful..."
                }
                failure {
                    echo "Cloning of backend failed! See log for details. Terminating..."
                }
            }
        }
        
        stage('Install dependencies (Backend)') {
            steps {
                script {
                    dir('HR_Managment_application_Backend-') {
                        sh('npm install --force')
                    }
                }
            }
        }
        
        stage('Build application (Backend)') {
            steps {
                script {
                    dir('HR_Managment_application_Backend-') {
                        sh('npm run build')
                    }
                }
            }
        }
        
        stage('Dépôt sur Nexus') {
    steps {
        script {
            dir('HR_Managment_application_Backend-') {
                // Setup the .npmrc file using environment variable for auth
                sh 'echo "registry=http://172.16.1.70:8081/repository/npmHosted/" > .npmrc'
                sh 'echo "//172.16.1.70:8081/repository/npmHosted/:_authToken=${NEXUS_TOKEN}" >> .npmrc'
                
                // Publish package to Nexus npm repository
                sh 'npm publish'
            }
        }
    }
}

        
        stage('Remove Previous Containers') {
            steps {
                script {
                    dir('HR_Managment_application_Backend-') {
                        sh 'ls -la' // List the contents of the current directory
                        sh 'docker compose down'
                        sh 'docker rmi server_app:latest --force'
                        sh 'docker rmi server_web:latest --force'
                    } 
                    echo 'removing...'
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    dir('HR_Managment_application_Backend-') {
                        sh 'ls -la' // List the contents of the current directory
                        sh 'docker compose up -d'
                    }
                    echo 'Deploying application...'
                }
            }
        }
    }
}
